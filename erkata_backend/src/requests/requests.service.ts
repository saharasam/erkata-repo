import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus, UserRole, Prisma } from '@prisma/client';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { AglpService } from '../aglp/aglp.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { CreateRequestDto } from './dto/create-request.dto';

interface OperatorIdResult {
  id: string;
}

interface RequestCreatedPayload {
  id: string;
}

@Injectable()
export class RequestsService implements OnModuleInit {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly presence: RedisPresenceService,
    private readonly aglpService: AglpService,
    @InjectQueue('assignment-timeout') private readonly timeoutQueue: Queue,
  ) {}

  async onModuleInit() {
    // Routine system sweep for pending requests
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

    // Routine system sweep for stale upgrade requests
    await this.timeoutQueue.add(
      'upgrade-sweeper',
      {},
      {
        repeat: { every: 10 * 60 * 1000 },
        removeOnComplete: true,
        removeOnFail: true,
        jobId: 'global-upgrade-sweeper',
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

  // 1. Logic for creating a new request
  async createRequest(customerId: string, dto: CreateRequestDto) {
    // Convert input to number
    const budget =
      dto.details.budget !== undefined ? Number(dto.details.budget) : undefined;

    // Simplified validation: only checking for positive numbers
    if (budget !== undefined && budget < 0) {
      throw new BadRequestException('Budget value must be a positive number');
    }

    const zone = await this.prisma.zone.findFirst({
      where: { name: dto.locationZone.kifleKetema },
    });

    if (!zone) throw new BadRequestException('Invalid zone');

    // Saving to the new single "budget" field
    const request = await this.prisma.request.create({
      data: {
        customerId,
        category: dto.category,
        type: dto.type || 'real_estate',
        description: dto.details.description,
        budget: budget,
        metadata: dto.metadata || {},
        zoneId: zone.id,
        woreda: dto.locationZone.woreda,
        status: RequestStatus.pending,
      },
    });

    this.eventEmitter.emit('request.created', request);

    // Trigger instant assignment to an operator
    await this.assignToNextReadyOperator(request.id);

    return request;
  }

  // Logic for pushing a request to an available operator
  async assignToNextReadyOperator(requestId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (
      !request ||
      request.status !== RequestStatus.pending ||
      request.assignedOperatorId
    ) {
      this.logger.debug(
        `[ASSIGN] Skipping ${requestId}: status=${request?.status}, alreadyAssigned=${!!request?.assignedOperatorId}`,
      );
      return;
    }

    // Select operator based on online status and current workload
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

    this.logger.log(
      `[ASSIGN] request=${requestId} → found ${operators.length} eligible operator(s)`,
    );

    const operatorId = operators[0]?.id;
    if (!operatorId) return;

    await this.prisma.$transaction(async (tx) => {
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

    this.logger.log(
      `[ASSIGN] request=${requestId} → pushed to operator=${operatorId}`,
    );
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

  // Logic for viewing the list of unassigned requests
  async getOperatorQueue(filters?: {
    zoneId?: string;
    limit?: number;
    offset?: number;
  }) {
    const whereClause: Prisma.RequestWhereInput = {
      status: RequestStatus.pending,
      assignedOperatorId: null,
    };

    if (filters?.zoneId) {
      whereClause.zoneId = filters.zoneId;
    }

    const take = filters?.limit ? Number(filters.limit) : 50;
    const skip = filters?.offset ? Number(filters.offset) : 0;

    return await this.prisma.request.findMany({
      where: whereClause,
      take,
      skip,
      include: {
        customer: {
          select: { id: true, fullName: true, createdAt: true },
        },
        zone: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Logic for assigning an agent to a specific request
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

    await this.timeoutQueue.add(
      'check-agent-timeout',
      { requestId, agentId, matchId: match.id },
      { delay: 60 * 60 * 1000, jobId: `agent-timeout-${match.id}` },
    );

    await this.handleOperatorReady();

    return match;
  }

  // Logic for looking up a single request with privacy rules
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
          'Details hidden until agent accepts.',
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
          'Customer contact hidden until assignment.',
        ),
      };
    }

    return request;
  }

  // Logic for finding agents sorted by level and location
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

  // Logic for showing a customer their own requests
  async getCustomerRequests(customerId: string) {
    return this.prisma.request.findMany({
      where: { customerId },
      include: {
        zone: true,
        matches: {
          include: {
            agent: { select: { id: true, fullName: true, avatarUrl: true } },
            transaction: {
              select: {
                id: true,
                feedbacks: {
                  select: { authorId: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Logic for marking work as done or raising a problem
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

    if (request.status !== RequestStatus.fulfilled) {
      throw new BadRequestException('Request is not in a confirmable state');
    }

    if (confirmed) {
      await this.prisma.$transaction(async (tx) => {
        await tx.request.update({
          where: { id: requestId },
          data: {
            status: RequestStatus.completed,
            completedAt: new Date(),
          },
        });
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

    return { success: true, status: confirmed ? 'completed' : 'disputed' };
  }

  // Logic for operators to settle a disagreement
  async resolveDispute(requestId: string, operatorId: string, note?: string) {
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
          status: RequestStatus.completed,
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

      return req;
    });

    await this.eventEmitter.emitAsync('request.resolved', {
      requestId,
      operatorId,
      note,
    });
    return updated;
  }

  // Logic for sending a difficult case to high-level management
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
          escalationNote: note || 'No description provided.',
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

  // Logic for cancelling work and allowing the agent to try again
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
            voidNote: note || 'Redo required.',
            voidAt: new Date().toISOString(),
            voidBy: operatorId,
            resolvedAt: new Date().toISOString(),
          },
        },
      });

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

  // Logic for viewing a history of all disagreements
  async getDisputeHistory(pagination?: { limit?: number; offset?: number }) {
    const take = pagination?.limit ? Number(pagination.limit) : 50;
    const skip = pagination?.offset ? Number(pagination.offset) : 0;

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
      take,
      skip,
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true },
        },
        assignedOperator: {
          select: { id: true, fullName: true, role: true },
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

  // Logic for bypassing the customer and marking a request finished manually
  async forceComplete(requestId: string, operatorId: string, note?: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== RequestStatus.fulfilled) {
      throw new BadRequestException(
        'Request must be fulfilled before force completion',
      );
    }

    const currentMetadata = (request.metadata as Record<string, any>) || {};

    const updated = await this.prisma.$transaction(async (tx) => {
      const req = await tx.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.completed,
          completedAt: new Date(),
          metadata: {
            ...currentMetadata,
            forceCompletedAt: new Date().toISOString(),
            forceCompletedBy: operatorId,
            forceCompletionNote: note || 'Manually confirmed.',
          },
        },
        include: { customer: true, matches: { include: { agent: true } } },
      });

      return req;
    });

    await this.eventEmitter.emitAsync('request.completed', {
      requestId,
      operatorId,
      forced: true,
    });

    return updated;
  }
}
