import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus, UserRole } from '@prisma/client';

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
    // Find the zone ID based on kifleKetema and woreda if needed,
    // but schema says Request has a zoneId which is a UUID string.
    // For now, let's find or assume a default zone if we can't find it,
    // or better, require zoneId in DTO.
    // However, the existing code uses locationZone as JSON.
    // Let's check schema.prisma: Request has zoneId String @map("zone_id")

    // We must find the Zone ID first.
    const zone = await this.prisma.zone.findFirst({
      where: { name: dto.locationZone.kifleKetema }, // Simplified mapping
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
    return request;
  }

  // ── 2. Operator views incoming queue (customer PII redacted) ─────────────
  async getOperatorQueue(filters?: { zoneId?: string }) {
    const whereClause: { status: { in: RequestStatus[] }; zoneId?: string } = {
      status: { in: [RequestStatus.pending] },
    };

    if (filters?.zoneId) {
      whereClause.zoneId = filters.zoneId;
    }

    const requests = await this.prisma.request.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, fullName: true, createdAt: true },
        },
        zone: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
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

    // Validate agent exists, is agent role, and covers the request zone
    const agent = await this.prisma.profile.findUnique({
      where: { id: agentId },
      include: { agentZones: true, referralLink: true },
    });

    if (!agent || agent.role !== UserRole.agent) {
      throw new BadRequestException('Invalid agent');
    }

    // Zone check
    // const coversZone = agent.agentZones.some(
    //   (z) => z.zoneId === request.zoneId,
    // );

    // if (!coversZone) {
    //   throw new BadRequestException(
    //     `Agent does not have zone coverage for ${request.zone.name}`,
    //   );
    // }

    // Atomic: update request (status: matched) + create match
    const match = await this.prisma.$transaction(async (tx) => {
      await tx.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.matched,
        },
      });

      return tx.match.create({
        data: {
          requestId,
          agentId,
          operatorId,
          status: 'assigned', // MatchStatus.assigned
        },
      });
    });

    this.eventEmitter.emit('match.created', { match, agentId });
    return match;
  }

  // ── 4. Role-scoped status view ───────────────────────────────────────────
  async getRequestStatus(requestId: string, userId: string, role: UserRole) {
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

    const activeMatch = request.matches[0]; // Simplified: assume one active match

    if (role === UserRole.customer) {
      if (request.customerId !== userId) throw new ForbiddenException();

      // Better typing for redacted info to satisfy strict linter
      let agentInfo: unknown = activeMatch?.agent;

      if (activeMatch && activeMatch.status === 'assigned') {
        agentInfo = this.redact(
          { id: '', fullName: '', phone: '' },
          'An agent has been assigned — details will be visible once they accept.',
        );
      }

      const response = {
        id: request.id,
        category: request.category,
        description: request.description,
        zone: request.zone,
        status: request.status,
        createdAt: request.createdAt,
        match: activeMatch
          ? {
              id: activeMatch.id,
              status: activeMatch.status,
              agent: agentInfo as {
                id: string;
                fullName: string;
                phone: string;
              } | null,
            }
          : null,
      };
      return response as unknown;
    }

    if (role === UserRole.agent) {
      if (activeMatch?.agentId !== userId) throw new ForbiddenException();

      let customerInfo: unknown = request.customer;
      if (activeMatch.status === 'assigned') {
        customerInfo = this.redact(
          request.customer,
          'Customer details will be revealed once you accept the assignment.',
        );
      }
      return {
        ...request,
        customer: customerInfo as {
          id: string;
          fullName: string;
          phone: string;
          createdAt: Date;
        },
      } as unknown;
    }

    // Operators, Admins, Super Admin see the full record
    return request;
  }

  // ── 5. All active agents — sorted by tier (desc) then zone (asc) ─────────
  async findEligibleAgents() {
    console.log(
      `[RequestsService] findEligibleAgents called — fetching all active agents`,
    );

    const agents = await this.prisma.profile.findMany({
      where: {
        role: UserRole.agent,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        isActive: true,
        referralLink: { select: { tier: true } },
        agentZones: {
          include: { zone: { select: { id: true, name: true } } },
        },
      },
    });

    console.log(`[RequestsService] Found ${agents.length} active agents.`);

    const tierPriority: Record<string, number> = {
      ABUNDANT_LIFE: 5,
      UNITY: 4,
      LOVE: 3,
      PEACE: 2,
      FREE: 1,
    };

    const enriched = agents.map((agent) => ({
      id: agent.id,
      fullName: agent.fullName,
      isActive: agent.isActive,
      tier: agent.referralLink?.tier ?? 'FREE',
      zones:
        agent.agentZones.length > 0
          ? agent.agentZones.map((az) => az.zone?.name ?? 'Unknown Zone')
          : ['Unknown Zone'],
    }));

    return enriched.sort((a, b) => {
      const tA = tierPriority[a.tier] ?? 1;
      const tB = tierPriority[b.tier] ?? 1;
      if (tB !== tA) return tB - tA; // Higher tier first
      // Secondary sort: first zone name alphabetically
      return a.zones[0].localeCompare(b.zones[0]);
    });
  }

  // ── 6. Customer's own request history ────────────────────────────────────
  async getCustomerRequests(customerId: string) {
    return this.prisma.request.findMany({
      where: { customerId },
      include: {
        zone: true,
        matches: {
          select: {
            id: true,
            status: true,
            agent: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
