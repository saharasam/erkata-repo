import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus, RequestStatus, Prisma } from '@prisma/client';
import { AglpService } from '../aglp/aglp.service';
import { ConfigService } from '../common/config.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly aglpService: AglpService,
    private readonly configService: ConfigService,
    @InjectQueue('assignment-timeout') private readonly timeoutQueue: Queue,
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

        // Sync parent request status to assigned
        await tx.request.update({
          where: { id: match.requestId },
          data: { status: RequestStatus.assigned },
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
      include: { agent: true, request: true },
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

    const agentName = match.agent.fullName;
    const currentMetadata =
      (match.request.metadata as Record<string, any>) || {};

    await this.prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id: matchId },
        data: { status: 'rejected' },
      });

      // Re-enter the request into pending status and record decline metadata
      await tx.request.update({
        where: { id: match.requestId },
        data: {
          status: RequestStatus.pending,
          metadata: {
            ...currentMetadata,
            declinedByAgentName: agentName,
            declinedByAgentId: agentId,
            declinedAt: new Date().toISOString(),
          },
        },
      });
    });

    this.eventEmitter.emit('match.rejected', { matchId, agentId });
    return { message: 'Assignment rejected. Request returned to queue.' };
  }

  // ── Agent transfers the assignment to a referral ────────────────────────
  async transferAssignment(
    matchId: string,
    fromAgentId: string,
    toAgentId: string,
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) throw new NotFoundException('Match not found');
    if (match.agentId !== fromAgentId) {
      throw new ForbiddenException('This assignment does not belong to you');
    }
    if (match.status !== 'assigned' && match.status !== 'accepted') {
      throw new BadRequestException(
        `Cannot transfer a match that is already "${match.status}"`,
      );
    }

    // Verify toAgentId is referred by fromAgentId
    const targetAgent = await this.prisma.profile.findUnique({
      where: { id: toAgentId },
    });

    if (
      !targetAgent ||
      targetAgent.referredById !== fromAgentId ||
      targetAgent.role !== 'agent'
    ) {
      throw new BadRequestException(
        'Target agent must be one of your referrals',
      );
    }

    // NEW CHECK: Prevent duplicate matches for the same request
    const existingMatch = await this.prisma.match.findUnique({
      where: {
        requestId_agentId: {
          requestId: match.requestId,
          agentId: toAgentId,
        },
      },
    });

    if (existingMatch) {
      throw new BadRequestException(
        'Target agent is already matched with this request',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const matchResult = await tx.match.update({
        where: { id: matchId },
        data: {
          agentId: toAgentId,
          status: 'assigned', // Reset to assigned for the new agent to accept
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: fromAgentId,
          action: 'MATCH_TRANSFERRED',
          targetTable: 'matches',
          targetId: matchId,
          metadata: {
            fromAgentId,
            toAgentId,
          },
        },
      });

      return matchResult;
    });

    this.eventEmitter.emit('match.transferred', {
      matchId,
      fromAgentId,
      toAgentId,
    });
    return updated;
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

    const result = await this.prisma.$transaction(
      async (tx) => {
        const matchResult = await tx.match.update({
          where: { id: matchId },
          data: {
            status: 'completed',
          },
          include: {
            agent: {
              include: {
                referredBy: true,
              },
            },
            request: true,
          },
        });

        await tx.request.update({
          where: { id: match.requestId },
          data: { status: RequestStatus.fulfilled },
        });

        // ── Commission Splitting Logic (Phase 2) ──────────────────────────
        interface MatchWithRelations {
          agent?: {
            fullName: string;
            referredById?: string;
          };
          request?: {
            type: string;
            category: string;
            budgetMax?: number;
            budgetMin?: number;
          };
        }

        const res = matchResult as unknown as MatchWithRelations;
        const budget = Number(
          res.request?.budgetMax || res.request?.budgetMin || 0,
        );

        if (budget > 0) {
          const type = res.request?.type || 'real_estate';
          const category = res.request?.category || 'General';
          const isRealEstate = type === 'real_estate';

          // 1. Primary Agent Commission (Dynamic Rate)
          const configKey = isRealEstate
            ? 'COMMISSION_REAL_ESTATE_PRIMARY'
            : 'COMMISSION_FURNITURE_PRIMARY';

          const primaryCommissionConfig = this.configService.get<{
            value: number;
          }>(configKey, { value: 0.1 });
          const primaryCommissionRate = primaryCommissionConfig.value || 0.1;
          const primaryCommissionEtb = budget * primaryCommissionRate;

          // ESCROW: Lock commission for sales
          await this.aglpService.lockCommission(
            tx,
            agentId,
            primaryCommissionEtb,
            matchId,
            `Primary commission for ${type} fulfillment: ${category}`,
          );

          // 2. Referral Override - Real Estate Only
          if (isRealEstate && res.agent?.referredById) {
            const overrideConfig = this.configService.get<{
              value: number;
            }>('COMMISSION_REAL_ESTATE_OVERRIDE', { value: 0.05 });
            const referralCommissionRate = overrideConfig.value || 0.05;
            const referralCommissionEtb = budget * referralCommissionRate;

            // ESCROW: Lock referral override too (since it is sale-based)
            await this.aglpService.lockCommission(
              tx,
              res.agent.referredById,
              referralCommissionEtb,
              matchId,
              `Referral override commission from agent ${
                res.agent.fullName || 'Unknown'
              }`,
            );
          }
        }

        return matchResult;
      },
      { timeout: 15000 },
    );
    this.eventEmitter.emit('match.completed', result);

    // Schedule 72h auto-confirmation window
    await this.timeoutQueue.add(
      'check-fulfillment-timeout',
      { requestId: result.requestId },
      {
        delay: 72 * 60 * 60 * 1000,
        jobId: `confirm-timeout-${result.requestId}`,
      },
    );

    return result;
  }

  // ── Agent fetches their assigned jobs ────────────────────────────────────
  async getAgentJobs(agentId: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        agentId,
        status: { not: 'rejected' },
      },
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
          metadata: req.metadata ?? {},
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
        agent: {
          select: { id: true, fullName: true, phone: true },
        },
        request: {
          include: {
            customer: {
              select: { id: true, fullName: true, phone: true },
            },
            zone: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }
}
