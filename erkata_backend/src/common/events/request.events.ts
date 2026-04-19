import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationsGateway } from '../../notifications/notifications.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { Match, Request } from '@prisma/client';

interface RequestCreatedPayload {
  id: string;
}

interface MatchCreatedPayload {
  match: Partial<Match>;
  agentId: string;
}

interface RequestIdPayload {
  requestId: string;
}

@Injectable()
export class RequestEventListener {
  private readonly logger = new Logger(RequestEventListener.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly gateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('request.created')
  handleRequestCreated(payload: RequestCreatedPayload) {
    this.logger.log(`[EVENT] request.created → id=${payload.id}`);
    // Initially, notify all super admins for monitoring?
    // In our system, the push logic handles operator assignment.
  }

  @OnEvent('request.pushed')
  async handleRequestPushed(payload: {
    requestId: string;
    operatorId: string;
  }) {
    this.logger.log(
      `[EVENT] request.pushed → requestId=${payload.requestId}, operatorId=${payload.operatorId}`,
    );

    const notification = await this.notifications.create({
      userId: payload.operatorId,
      title: 'New Request Assigned',
      message: `A new request has been pushed to your queue. Accept it before it times out.`,
      type: 'request.pushed',
      link: `/operator/requests/${payload.requestId}`,
    });

    this.gateway.sendToUser(payload.operatorId, 'notification', notification);
  }

  @OnEvent('match.created')
  async handleMatchCreated(payload: MatchCreatedPayload) {
    this.logger.log(`[EVENT] match.created → agentId=${payload.agentId}`);

    const notification = await this.notifications.create({
      userId: payload.agentId,
      title: 'New Lead Assignment',
      message:
        'An operator has assigned a new lead to you. Accept it to see details.',
      type: 'match.created',
      link: `/agent/tasks/${payload.match.id}`,
    });

    this.gateway.sendToUser(payload.agentId, 'notification', notification);
  }

  @OnEvent('match.accepted')
  async handleMatchAccepted(payload: RequestIdPayload) {
    this.logger.log(`[EVENT] match.accepted → requestId=${payload.requestId}`);

    // Notify Customer
    const request = await this.prisma.request.findUnique({
      where: { id: payload.requestId },
      include: { customer: true },
    });

    if (request) {
      const notification = await this.notifications.create({
        userId: request.customerId,
        title: 'Request has been assigned',
        message:
          'An agent has accepted your request and will contact you soon.',
        type: 'match.accepted',
        link: `/dashboard/requests/${request.id}`,
      });

      this.gateway.sendToUser(request.customerId, 'notification', notification);
    }
  }

  @OnEvent('match.completed')
  async handleMatchCompleted(payload: RequestIdPayload) {
    this.logger.log(`[EVENT] match.completed → requestId=${payload.requestId}`);

    // Notify Customer
    const request = await this.prisma.request.findUnique({
      where: { id: payload.requestId },
      include: { customer: true },
    });

    if (request) {
      const notification = await this.notifications.create({
        userId: request.customerId,
        title: 'Job Delivered',
        message:
          'The agent has marked your request as delivered. Please confirm fulfillment.',
        type: 'match.completed',
        link: `/dashboard/requests/${request.id}`,
      });

      this.gateway.sendToUser(request.customerId, 'notification', notification);
    }
  }

  @OnEvent('request.disputed')
  async handleRequestDisputed(payload: {
    requestId: string;
    customerId: string;
  }) {
    this.logger.log(
      `[EVENT] request.disputed → requestId=${payload.requestId}`,
    );

    const request = await this.prisma.request.findUnique({
      where: { id: payload.requestId },
      include: { assignedOperator: true },
    });

    const admins = await this.prisma.profile.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });

    const targets = new Set(admins.map((a) => a.id));
    if (request?.assignedOperatorId) targets.add(request.assignedOperatorId);

    for (const targetId of targets) {
      const notification = await this.notifications.create({
        userId: targetId,
        title: 'Lead Disputed',
        message: `A customer has marked a lead as NOT fulfilled. Immediate intervention required.`,
        type: 'request.disputed',
        link: `/operator/requests/${payload.requestId}`,
      });

      this.gateway.sendToUser(targetId, 'notification', notification);
    }
  }

  @OnEvent('request.escalated')
  async handleRequestEscalated(payload: {
    requestId: string;
    operatorId: string;
    note?: string;
  }) {
    this.logger.log(
      `[EVENT] request.escalated → requestId=${payload.requestId}`,
    );

    // Clear the active disputed notification since it's now escalated
    await this.notifications.markRelatedAsRead(payload.requestId, [
      'request.disputed',
    ]);

    const admins = await this.prisma.profile.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });
    for (const admin of admins) {
      const notification = await this.notifications.create({
        userId: admin.id,
        title: 'Dispute Escalated',
        message: `Operator escalated a dispute. Note: ${payload.note || 'None'}`,
        type: 'request.escalated',
        link: `/admin?view=disputes&requestId=${payload.requestId}`,
      });
      this.gateway.sendToUser(admin.id, 'notification', notification);
    }
  }

  @OnEvent('request.resolved')
  async handleRequestResolved(payload: {
    requestId: string;
    operatorId: string;
    note?: string;
  }) {
    this.logger.log(
      `[EVENT] request.resolved → requestId=${payload.requestId}`,
    );

    // Clear any active dispute or escalation notifications
    await this.notifications.markRelatedAsRead(payload.requestId, [
      'request.disputed',
      'request.escalated',
    ]);

    const request = await this.prisma.request.findUnique({
      where: { id: payload.requestId },
    });
    if (request) {
      const notification = await this.notifications.create({
        userId: request.customerId,
        title: 'Dispute Resolved',
        message: `Your dispute has been resolved. Note: ${payload.note || 'Resolved by operator.'}`,
        type: 'request.resolved',
        link: `/dashboard/requests/${request.id}`,
      });
      this.gateway.sendToUser(request.customerId, 'notification', notification);
    }
  }

  @OnEvent('request.voided')
  async handleRequestVoided(payload: {
    requestId: string;
    operatorId: string;
    note?: string;
  }) {
    this.logger.log(`[EVENT] request.voided → requestId=${payload.requestId}`);
    const request = await this.prisma.request.findUnique({
      where: { id: payload.requestId },
      include: {
        matches: { where: { status: 'assigned' }, include: { agent: true } },
      },
    });
    const agent = request?.matches[0]?.agent;
    if (agent) {
      const notification = await this.notifications.create({
        userId: agent.id,
        title: 'Fulfillment Voided',
        message: `A fulfillment was voided by an operator (redo required). Note: ${payload.note || 'None'}`,
        type: 'request.voided',
        link: '/agent?view=focus',
      });
      this.gateway.sendToUser(agent.id, 'notification', notification);
    }
  }
}
