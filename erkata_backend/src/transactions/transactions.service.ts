import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus, RequestStatus, Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ── Agent accepts the assignment ─────────────────────────────────────────
  async acceptAssignment(matchId: string, agentId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { request: true },
    });

    if (!match) throw new NotFoundException('Match not found');
    if (match.agentId !== agentId) {
      throw new ForbiddenException('This assignment does not belong to you');
    }
    if (match.status !== 'assigned') {
      throw new BadRequestException(
        `Assignment is already "${match.status}" and cannot be accepted`,
      );
    }

    const updated = await this.prisma.$transaction(
      async (tx) => {
        const matchResult = await tx.match.update({
          where: { id: matchId },
          data: {
            status: 'accepted',
          },
        });

        // Sync parent request status to in_progress
        await tx.request.update({
          where: { id: match.requestId },
          data: { status: RequestStatus.in_progress },
        });

        // ── Create Transaction Record (Locked for Mediation/Feedback) ────
        // This is necessary because feedback submission requires a transaction ID.
        await tx.transaction.upsert({
          where: { matchId: matchId },
          update: {}, // Already exists, do nothing
          create: {
            matchId,
            amount: match.request.budgetMax || new Prisma.Decimal(0),
            currency: 'ETB',
            status: 'pending',
          },
        });

        return matchResult;
      },
      {
        timeout: 15000,
      },
    );

    this.eventEmitter.emit('match.accepted', updated);
    return updated;
  }

  // ── Agent declines the assignment (request re-enters Operator queue) ─────
  async declineAssignment(matchId: string, agentId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) throw new NotFoundException('Match not found');
    if (match.agentId !== agentId) {
      throw new ForbiddenException('This assignment does not belong to you');
    }
    if (match.status !== 'assigned') {
      throw new BadRequestException(
        'Cannot decline a match that is already processed',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id: matchId },
        data: { status: 'rejected' },
      });

      // Re-enter the request into pending status
      await tx.request.update({
        where: { id: match.requestId },
        data: {
          status: RequestStatus.pending,
        },
      });
    });

    this.eventEmitter.emit('match.rejected', { matchId, agentId });
    return { message: 'Assignment rejected. Request returned to queue.' };
  }

  // ── Agent marks job as complete ──────────────────────────────────────────
  async markComplete(matchId: string, agentId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) throw new NotFoundException('Match not found');
    if (match.agentId !== agentId) {
      throw new ForbiddenException('This match does not belong to you');
    }
    if (match.status !== 'accepted') {
      throw new BadRequestException(
        'Only accepted matches can be marked complete',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const matchResult = await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'completed',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        include: {
          agent: {
            include: {
              referredBy: true,
            },
          },
          request: true,
        } as any,
      });

      await tx.request.update({
        where: { id: match.requestId },
        data: { status: RequestStatus.completed },
      });

      // ── Commission Splitting Logic (Phase 2) ──────────────────────────
      interface MatchWithRelations {
        agent?: {
          fullName: string;
          referredBy?: any;
          referredById?: string;
        };
        request?: {
          budgetMax?: number;
          budgetMin?: number;
        };
      }

      const res = matchResult as unknown as MatchWithRelations;
      const budget = res.request?.budgetMax || res.request?.budgetMin || 0;

      if (budget > 0 && res.agent?.referredBy) {
        const commissionAmount = budget * 0.05;

        await tx.profile.update({
          where: { id: res.agent.referredById },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: {
            walletBalance: {
              increment: commissionAmount,
            },
          } as any,
        });

        await tx.auditLog.create({
          data: {
            actorId: agentId,
            action: 'REFERRAL_COMMISSION_CREDITED',
            targetTable: 'profiles',
            targetId: res.agent.referredById,
            metadata: {
              matchId,
              amount: commissionAmount,
              reason: `Referral commission from agent ${res.agent.fullName}`,
            },
          },
        });
      }

      return matchResult;
    });

    this.eventEmitter.emit('match.completed', result);
    return result;
  }

  // ── Agent fetches their assigned jobs ────────────────────────────────────
  async getAgentJobs(agentId: string) {
    const matches = await this.prisma.match.findMany({
      where: { agentId },
      include: {
        transaction: true,
        request: {
          include: {
            zone: true,
            customer: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    // Redact customer PII on jobs where Agent has not yet accepted
    return matches.map((m) => {
      const isAccepted = m.status !== 'assigned';
      const req = m.request;

      return {
        id: m.id,
        status: m.status,
        assignedAt: m.assignedAt,
        transaction: m.transaction
          ? {
              id: m.transaction.id,
              status: m.transaction.status,
              amount: m.transaction.amount?.toString() || '0',
            }
          : null,
        request: {
          id: req.id,
          category: req.category,
          description: req.description,
          budgetMax: req.budgetMax?.toString() || '0',
          woreda: req.woreda,
          type: req.type,
          status: req.status,
          zone: req.zone?.name || 'Unknown',
          customer: isAccepted
            ? {
                id: req.customer?.id,
                fullName: req.customer?.fullName,
                phone: req.customer?.phone,
              }
            : {
                id: null,
                fullName: 'Accept this assignment to reveal customer details.',
                phone: null,
              },
        },
      };
    });
  }

  // ── Operator fetches managed transactions ──────────────────────────────
  async getOperatorTransactions(query?: { status?: string }) {
    return this.prisma.match.findMany({
      where: query?.status ? { status: query.status as MatchStatus } : {},
      include: {
        request: {
          include: {
            customer: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }
}
