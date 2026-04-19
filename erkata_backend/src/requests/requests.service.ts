import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus, UserRole, Prisma } from '@prisma/client';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface CreateRequestDto {
  category: string;
  type?: 'real_estate' | 'furniture';
  details: Record<string, any>;
  metadata?: Record<string, any>;
  locationZone: {
    kifleKetema: string;
    woreda: string;
  };
}

interface OperatorIdResult {
  id: string;
}

interface RequestCreatedPayload {
  id: string;
}

@Injectable()
export class RequestsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly presence: RedisPresenceService,
    @InjectQueue('assignment-timeout') private readonly timeoutQueue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule a recurring sweeper job to prevent requests from getting stuck in "Pending Limbo"
    // This runs every minute and re-triggers assignment for any unassigned pending requests.
    await this.timeoutQueue.add(
      'queue-sweeper',
      {},
      {
        repeat: { every: 60000 },
        removeOnComplete: true,
        removeOnFail: true,
        jobId: 'global-queue-sweeper',
      },
    );
  }

  private redact(
    user: {
      id: string;
      fullName: string;
      phone: string;
      avatarUrl?: string | null;
      createdAt?: Date;
    },
    message: string,
  ) {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      fullName: message,
      phone: '',
      avatarUrl: null,
      createdAt: user.createdAt || new Date(),
    };
  }

  // ── 1. Customer submits a request ────────────────────────────────────────
  async createRequest(customerId: string, dto: CreateRequestDto) {
    const zone = await this.prisma.zone.findFirst({
      where: { name: dto.locationZone.kifleKetema },
    });

    if (!zone) throw new BadRequestException('Invalid zone');

    const request = await this.prisma.request.create({
      data: {
        customerId,
        category: dto.category,
        type: dto.type || 'real_estate',
        description: dto.details.description as string,
        budgetMin: dto.details.budgetMin as number | undefined,
        budgetMax: dto.details.budgetMax as number | undefined,
        metadata: dto.metadata || {},
        zoneId: zone.id,
        woreda: dto.locationZone.woreda,
        status: RequestStatus.pending,
      },
    });

    this.eventEmitter.emit('request.created', request);

    // Trigger instant assignment attempt
    await this.assignToNextReadyOperator(request.id);

    return request;
  }

  // ── New: Automated Push Logic ─────────────────────────────────────────────
  async assignToNextReadyOperator(requestId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (
      !request ||
      request.status !== RequestStatus.pending ||
      request.assignedOperatorId
    ) {
      return;
    }

    // 2. Select operator using row-level locking to avoid race condition
    // We want an operator who:
    // - Is online
    // - Has no pending assignments
    // - Is the least recently assigned (fairness)
    // We use FOR UPDATE SKIP LOCKED to ensure concurrency safety
    const operators = await this.prisma.$queryRaw<OperatorIdResult[]>`
      SELECT p.id 
      FROM profiles p
      WHERE p.role = 'operator' 
        AND p.is_online = true
        AND (
          SELECT count(*) FROM requests r 
          WHERE r.assigned_operator_id = p.id 
          AND r.status = 'pending'
        ) < 5
      ORDER BY p.last_assignment_at ASC NULLS FIRST
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `;

    const operatorId = operators[0]?.id;
    if (!operatorId) return;

    await this.prisma.$transaction(async (tx) => {
      // Final check: Is the request still unassigned?
      const targetRequest = await tx.request.findUnique({
        where: { id: requestId },
      });

      if (!targetRequest || targetRequest.assignedOperatorId) {
        return;
      }

      await tx.request.update({
        where: { id: requestId },
        data: {
          assignedOperatorId: operatorId,
          assignmentPushedAt: new Date(),
        },
      });

      await tx.profile.update({
        where: { id: operatorId },
        data: { lastAssignmentAt: new Date() },
      });

      await this.timeoutQueue.add(
        'check-timeout',
        { requestId, operatorId },
        { delay: 5 * 60 * 1000, jobId: `timeout-${requestId}` },
      );
    });

    this.eventEmitter.emit('request.pushed', { requestId, operatorId });
  }

  async handleOperatorReady() {
    const oldestRequest = await this.prisma.request.findFirst({
      where: {
        status: RequestStatus.pending,
        assignedOperatorId: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (oldestRequest) {
      await this.assignToNextReadyOperator(oldestRequest.id);
    }
  }

  @OnEvent('request.created')
  async handleRequestCreatedEvent(payload: string | RequestCreatedPayload) {
    const requestId = typeof payload === 'string' ? payload : payload.id;
    await this.assignToNextReadyOperator(requestId);
  }

  @OnEvent('operator.online')
  async handleOperatorOnlineEvent() {
    await this.handleOperatorReady();
  }

  // ── 2. Operator views incoming queue (customer PII redacted) ─────────────
  async getOperatorQueue(filters?: { zoneId?: string }) {
    const whereClause: Prisma.RequestWhereInput = {
      status: RequestStatus.pending,
      assignedOperatorId: null, // Only show unassigned/unpushed requests
    };

    if (filters?.zoneId) {
      whereClause.zoneId = filters.zoneId;
    }

    return await this.prisma.request.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, fullName: true, createdAt: true },
        },
        zone: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── 3. Operator assigns an eligible Agent ────────────────────────────────
  async assignAgent(requestId: string, agentId: string, operatorId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: { zone: true },
    });

    if (!request) throw new NotFoundException('Request not found');

    if (request.status !== RequestStatus.pending) {
      throw new BadRequestException(
        `Request status "${request.status}" does not allow assignment`,
      );
    }

    // Authority Check: Only the assigned operator can assign an agent
    if (request.assignedOperatorId !== operatorId) {
      throw new ForbiddenException('This request is not assigned to you');
    }

    const agent = await this.prisma.profile.findUnique({
      where: { id: agentId },
      include: { agentZones: true },
    });

    if (!agent || agent.role !== UserRole.agent) {
      throw new BadRequestException('Invalid agent');
    }

    if (!agent.isActive) {
      throw new ForbiddenException('Cannot assign a suspended agent.');
    }

    const operator = await this.prisma.profile.findUnique({
      where: { id: operatorId },
      select: { isActive: true },
    });

    if (!operator || !operator.isActive) {
      throw new ForbiddenException('Your account is suspended.');
    }

    const match = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.match.findUnique({
        where: {
          requestId_agentId: { requestId, agentId },
        },
      });

      if (existing) {
        // If the match was previously rejected, reset it to assigned
        if (existing.status === 'rejected') {
          return tx.match.update({
            where: { id: existing.id },
            data: {
              status: 'assigned',
              assignedAt: new Date(),
            },
          });
        }
        return existing;
      }

      return tx.match.create({
        data: {
          requestId,
          agentId,
          operatorId,
          status: 'assigned',
        },
      });
    });

    this.eventEmitter.emit('match.created', { match, agentId });

    // Fallback: If agent doesn't accept/decline in 1 hour, reclaim to operator pool
    await this.timeoutQueue.add(
      'check-agent-timeout',
      { requestId, agentId, matchId: match.id },
      { delay: 60 * 60 * 1000, jobId: `agent-timeout-${match.id}` },
    );

    // Trigger ready for next task
    await this.handleOperatorReady();

    return match;
  }

  // ── 4. Generic request fetch with role-scoped visibility ──────────────────
  async getRequest(requestId: string, userId: string, role: UserRole) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, createdAt: true },
        },
        matches: {
          include: {
            agent: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                avatarUrl: true,
              },
            },
            transaction: true,
          },
        },
        zone: true,
      },
    });

    if (!request) throw new NotFoundException('Request not found');

    if (role === UserRole.customer) {
      if (request.customerId !== userId) throw new ForbiddenException();
      const activeMatch = request.matches[0];
      let agentInfo: {
        id: string;
        fullName: string;
        phone: string;
        avatarUrl?: string | null;
      } | null = activeMatch?.agent || null;

      if (activeMatch && activeMatch.status === 'assigned') {
        agentInfo = this.redact(
          { id: '', fullName: '', phone: '' },
          'An agent has been assigned — details will be visible once they accept.',
        );
      }

      return {
        ...request,
        customer: request.customer,
        match: activeMatch ? { ...activeMatch, agent: agentInfo } : null,
      };
    }

    if (role === UserRole.operator) {
      const isAssigned = request.assignedOperatorId === userId;
      const isPending = request.status === RequestStatus.pending;

      if (!isAssigned && !isPending) {
        throw new ForbiddenException('No access to this request');
      }

      return {
        ...request,
        customer: this.redact(
          request.customer,
          'Customer PII is hidden until assignment.',
        ),
      };
    }

    // Admins see everything
    return request;
  }

  // ── 5. Eligible agents listing ───────────────────────────────────────────
  async findEligibleAgents() {
    const agents = await this.prisma.profile.findMany({
      where: {
        role: UserRole.agent,
        isActive: true,
      },
      include: {
        agentZones: {
          include: { zone: { select: { id: true, name: true } } },
        },
      },
    });

    const tierPriority: Record<string, number> = {
      ABUNDANT_LIFE: 5,
      UNITY: 4,
      LOVE: 3,
      PEACE: 2,
      FREE: 1,
    };

    return agents
      .map((agent) => ({
        id: agent.id,
        fullName: agent.fullName,
        isActive: agent.isActive,
        tier: agent.tier ?? 'FREE',
        zones: agent.agentZones.map((az) => az.zone?.name ?? 'Unknown Zone'),
      }))
      .sort((a, b) => {
        const tA = tierPriority[a.tier] ?? 1;
        const tB = tierPriority[b.tier] ?? 1;
        if (tB !== tA) return tB - tA;
        return (a.zones[0] || '').localeCompare(b.zones[0] || '');
      });
  }

  // ── 6. Customer history ──────────────────────────────────────────────────
  async getCustomerRequests(customerId: string) {
    return this.prisma.request.findMany({
      where: { customerId },
      include: {
        zone: true,
        matches: {
          include: {
            agent: { select: { id: true, fullName: true, avatarUrl: true } },
            transaction: { select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmFulfillment(
    requestId: string,
    customerId: string,
    confirmed: boolean,
  ) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.customerId !== customerId)
      throw new ForbiddenException('Not your request');

    // Only allow confirmation if request is fulfilled (by agent)
    if (request.status !== RequestStatus.fulfilled) {
      throw new BadRequestException('Request is not in a confirmable state');
    }

    if (confirmed) {
      await this.prisma.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.fulfilled,
          completedAt: new Date(),
        },
      });
    } else {
      await this.prisma.request.update({
        where: { id: requestId },
        data: { status: RequestStatus.disputed },
      });

      await this.eventEmitter.emitAsync('request.disputed', {
        requestId,
        customerId,
      });
    }

    return { success: true, status: confirmed ? 'fulfilled' : 'disputed' };
  }

  // Operator resolves a dispute by marking it fulfilled
  async resolveDispute(requestId: string, operatorId: string, note?: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== RequestStatus.disputed) {
      throw new BadRequestException('Request is not in a disputed state');
    }

    const currentMetadata = (request.metadata as Record<string, any>) || {};

    const updated = await this.prisma.request.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.fulfilled,
        completedAt: new Date(),
        isEscalated: false,
        metadata: {
          ...currentMetadata,
          resolutionNote: note || 'Resolved by operator.',
          resolvedAt: new Date().toISOString(),
          resolvedBy: operatorId,
        },
      },
      include: { customer: true, matches: { include: { agent: true } } },
    });

    await this.eventEmitter.emitAsync('request.resolved', {
      requestId,
      operatorId,
      note,
    });
    return updated;
  }

  // Operator escalates a dispute to Admin
  async escalateDispute(requestId: string, operatorId: string, note?: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== RequestStatus.disputed) {
      throw new BadRequestException('Request is not in a disputed state');
    }

    const currentMetadata = (request.metadata as Record<string, any>) || {};

    const updated = await this.prisma.request.update({
      where: { id: requestId },
      data: {
        isEscalated: true,
        metadata: {
          ...currentMetadata,
          escalationNote: note || 'No description provided by operator.',
          escalatedAt: new Date().toISOString(),
          escalatedBy: operatorId,
        },
      },
    });

    await this.eventEmitter.emitAsync('request.escalated', {
      requestId,
      operatorId,
      note,
    });
    return updated;
  }

  // Operator voiding a dispute, returning it to the agent for a redo
  async voidDispute(requestId: string, operatorId: string, note?: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== RequestStatus.disputed) {
      throw new BadRequestException('Request is not in a disputed state');
    }

    const currentMetadata = (request.metadata as Record<string, any>) || {};

    const updated = await this.prisma.$transaction(async (tx) => {
      const req = await tx.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.assigned,
          isEscalated: false,
          metadata: {
            ...currentMetadata,
            needsRedo: true,
            voidNote: note || 'Fulfillment voided. Redo required.',
            voidAt: new Date().toISOString(),
            voidBy: operatorId,
            resolvedAt: new Date().toISOString(),
          },
        },
      });

      // Reset the active match back to 'accepted' so the agent can resubmit
      await tx.match.updateMany({
        where: {
          requestId,
          status: 'completed',
        },
        data: {
          status: 'accepted',
        },
      });

      return req;
    });

    await this.eventEmitter.emitAsync('request.voided', {
      requestId,
      operatorId,
      note,
    });
    return updated;
  }

  // Fetch historical disputes for the audit dashboard
  async getDisputeHistory() {
    // We look for requests that are currently disputed OR have dispute resolution metadata
    return this.prisma.request.findMany({
      where: {
        OR: [
          { status: RequestStatus.disputed },
          { isEscalated: true },
          {
            metadata: {
              path: ['resolvedAt'],
              not: Prisma.JsonNull,
            },
          },
        ],
      },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true },
        },
        matches: {
          include: {
            agent: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
        zone: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
