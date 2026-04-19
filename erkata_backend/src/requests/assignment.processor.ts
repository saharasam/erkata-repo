import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus } from '@prisma/client';
import { Logger, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface AssignmentJobData {
  requestId?: string;
  operatorId?: string;
  agentId?: string;
  matchId?: string;
}

@Processor('assignment-timeout')
export class AssignmentProcessor extends WorkerHost {
  private readonly logger = new Logger(AssignmentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<AssignmentJobData, any, string>): Promise<any> {
    if (job.name === 'check-timeout') {
      const { requestId, operatorId } = job.data;
      this.logger.log(
        `[AssignmentProcessor] Checking timeout for request ${requestId} assigned to ${operatorId}`,
      );

      const request = await this.prisma.request.findUnique({
        where: { id: requestId },
      });

      // If request is still pending and still assigned to this operator, it's a timeout
      if (
        request &&
        request.status === RequestStatus.pending &&
        request.assignedOperatorId === operatorId
      ) {
        this.logger.warn(
          `[AssignmentProcessor] Request ${requestId} timed out for operator ${operatorId}. Reclaiming...`,
        );

        await this.prisma.$transaction(async (tx) => {
          // Unassign the request
          await tx.request.update({
            where: { id: requestId },
            data: {
              assignedOperatorId: null,
              assignmentPushedAt: null,
            },
          });

          // 1. Increment missed assignments counter
          const profile = await tx.profile.update({
            where: { id: operatorId },
            data: {
              missedAssignments: { increment: 1 },
            },
          });

          // 2. Only mark offline if they've reached the threshold (3)
          if (profile.missedAssignments >= 3) {
            this.logger.warn(
              `[AssignmentProcessor] Operator ${operatorId} reached ${profile.missedAssignments} misses. Marking offline.`,
            );
            await tx.profile.update({
              where: { id: operatorId },
              data: { isOnline: false },
            });

            // Kill their Redis presence so the 10-minute sync doesn't bring them back online
            await this.redis.del(`presence:operator:${operatorId}`);
          } else {
            this.logger.log(
              `[AssignmentProcessor] Operator ${operatorId} missed assignment (${profile.missedAssignments}/3). Remaining online.`,
            );
          }
        });

        this.logger.log(
          `[AssignmentProcessor] Request ${requestId} reclaimed. Triggering re-assignment.`,
        );

        // Notify system that a request is now unassigned and potentially other operators are needed
        this.eventEmitter.emit('request.created', { id: requestId });
      }
    }

    if (job.name === 'check-agent-timeout') {
      const { requestId, matchId, agentId } = job.data;
      this.logger.log(
        `[AssignmentProcessor] Checking agent timeout for match ${matchId} (Request: ${requestId})`,
      );

      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
      });

      // If the match is still in 'assigned' status, the agent ghosted it.
      if (match && match.status === 'assigned') {
        this.logger.warn(
          `[AssignmentProcessor] Agent ${agentId} timed out on match ${matchId}. Returning request to operator.`,
        );

        await this.prisma.$transaction(async (tx) => {
          // 1. Mark match as rejected (or expired)
          await tx.match.update({
            where: { id: matchId },
            data: { status: 'rejected' },
          });

          const currentRequest = await tx.request.findUnique({
            where: { id: requestId },
          });

          // 2. Reset request status to pending so operator sees it again
          await tx.request.update({
            where: { id: requestId },
            data: {
              status: RequestStatus.pending,
              metadata: {
                ...(typeof currentRequest?.metadata === 'object'
                  ? (currentRequest.metadata as any)
                  : {}),
                agentTimeoutAt: new Date().toISOString(),
                lastTimedOutAgentId: agentId,
              },
            },
          });
        });

        // Notify operator dashboard to refresh
        this.eventEmitter.emit('request.updated', { id: requestId });
      }
    }

    if (job.name === 'check-fulfillment-timeout') {
      const { requestId } = job.data;
      this.logger.log(
        `[AssignmentProcessor] Checking fulfillment auto-confirm for request ${requestId}`,
      );

      const request = await this.prisma.request.findUnique({
        where: { id: requestId },
      });

      if (
        request &&
        request.status === RequestStatus.fulfilled &&
        !request.completedAt
      ) {
        this.logger.log(
          `[AssignmentProcessor] Auto-confirming request ${requestId} after 72h window.`,
        );

        await this.prisma.request.update({
          where: { id: requestId },
          data: {
            status: RequestStatus.fulfilled,
            completedAt: new Date(),
            metadata: {
              ...(typeof request.metadata === 'object' ? request.metadata : {}),
              autoConfirmedAt: new Date().toISOString(),
            },
          },
        });
      }
    }

    if (job.name === 'queue-sweeper') {
      this.logger.log('[AssignmentProcessor] Running Queue Sweeper...');
      const unassignedRequests = await this.prisma.request.findMany({
        where: {
          status: RequestStatus.pending,
          assignedOperatorId: null,
        },
        take: 10,
        orderBy: { createdAt: 'asc' },
      });

      if (unassignedRequests.length > 0) {
        this.logger.log(
          `[AssignmentProcessor] Sweeper found ${unassignedRequests.length} unassigned requests. Re-triggering...`,
        );
        for (const req of unassignedRequests) {
          this.eventEmitter.emit('request.created', { id: req.id });
        }
      }
    }
  }
}
