import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus, UserRole } from '@prisma/client';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface CreateRequestDto {
  category: string;
  details: Record<string, any>; // { title, budget(Number), description }
  locationZone: {
    kifleKetema: string;
    woreda: string;
  };
}

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly presence: RedisPresenceService,
    @InjectQueue('assignment-timeout') private readonly timeoutQueue: Queue,
  ) {}

  private redact(
    user: { id: string; fullName: string; phone: string; createdAt?: Date },
    message: string,
  ) {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      fullName: message,
      phone: '',
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
        description: dto.details.description as string,
        budgetMin: dto.details.budgetMin as number | undefined,
        budgetMax: dto.details.budgetMax as number | undefined,
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
      include: { zone: true },
    });

    if (!request || request.status !== RequestStatus.pending || (request as any).assignedOperatorId) {
      return;
    }

    const operator = await this.prisma.profile.findFirst({
      where: {
        role: UserRole.operator,
        isOnline: true,
        assignedRequests: {
          none: {
            status: RequestStatus.pending,
          },
        },
      } as any,
      orderBy: { lastAssignmentAt: 'asc' } as any,
    });

    if (!operator) return;

    await this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.request.update({
        where: { id: requestId, assignedOperatorId: null } as any,
        data: {
          assignedOperatorId: operator.id,
          assignmentPushedAt: new Date(),
        } as any,
      });

      await tx.profile.update({
        where: { id: operator.id },
        data: { lastAssignmentAt: new Date() } as any,
      });

      await this.timeoutQueue.add(
        'check-timeout',
        { requestId: updatedRequest.id, operatorId: operator.id },
        { delay: 5 * 60 * 1000, jobId: `timeout-${updatedRequest.id}` },
      );
    });

    this.eventEmitter.emit('request.pushed', { requestId, operatorId: operator.id });
  }

  async handleOperatorReady(operatorId: string) {
    const oldestRequest = await this.prisma.request.findFirst({
      where: {
        status: RequestStatus.pending,
        assignedOperatorId: null,
      } as any,
      orderBy: { createdAt: 'asc' },
    });

    if (oldestRequest) {
      await this.assignToNextReadyOperator(oldestRequest.id);
    }
  }

  // ── 2. Operator views incoming queue (customer PII redacted) ─────────────
  async getOperatorQueue(filters?: { zoneId?: string }) {
    const whereClause: any = {
      status: RequestStatus.pending,
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
              select: { id: true, fullName: true, phone: true },
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
      let agentInfo: any = activeMatch?.agent;

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
      const isAssigned = (request as any).assignedOperatorId === userId;
      const isPending = request.status === RequestStatus.pending;

      if (!isAssigned && !isPending) {
        throw new ForbiddenException('No access to this request');
      }

      return {
        ...request,
        customer: this.redact(request.customer, 'Customer PII is hidden until assignment.'),
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
      ABUNDANT_LIFE: 5, UNITY: 4, LOVE: 3, PEACE: 2, FREE: 1,
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
            agent: { select: { id: true, fullName: true } },
            transaction: { select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmFulfillment(requestId: string, customerId: string, confirmed: boolean) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.customerId !== customerId) throw new ForbiddenException('Not your request');

    // Only allow confirmation if request is fulfilled (by agent)
    if (request.status !== RequestStatus.fulfilled) {
      throw new BadRequestException('Request is not in a confirmable state');
    }

    if (confirmed) {
      await this.prisma.request.update({
        where: { id: requestId },
        data: { 
          status: RequestStatus.fulfilled,
          completedAt: new Date()
        },
      });
    } else {
      await this.prisma.request.update({
        where: { id: requestId },
        data: { status: RequestStatus.disputed },
      });

      this.eventEmitter.emit('request.disputed', { requestId, customerId });
    }

    return { success: true, status: confirmed ? 'fulfilled' : 'disputed' };
  }
}
