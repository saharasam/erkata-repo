import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus, UserRole } from '@prisma/client';
import { Logger, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';

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

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'check-timeout') {
      const { requestId, operatorId } = job.data;
      this.logger.log(`[AssignmentProcessor] Checking timeout for request ${requestId} assigned to ${operatorId}`);

      const request = await this.prisma.request.findUnique({
        where: { id: requestId },
      });

      // If request is still pending and still assigned to this operator, it's a timeout
      if (request && request.status === RequestStatus.pending && (request as any).assignedOperatorId === operatorId) {
        this.logger.warn(`[AssignmentProcessor] Request ${requestId} timed out for operator ${operatorId}. Reclaiming...`);

        await this.prisma.$transaction(async (tx) => {
          // Unassign the request
          await tx.request.update({
            where: { id: requestId },
            data: {
              assignedOperatorId: null,
              assignmentPushedAt: null,
            } as any,
          });

          // Mark operator as offline
          await tx.profile.update({
            where: { id: operatorId },
            data: { isOnline: false } as any,
          });

          // Kill their Redis presence so the 10-minute sync doesn't bring them back online
          await this.redis.del(`presence:operator:${operatorId}`);
        });

        this.logger.log(`[AssignmentProcessor] Operator ${operatorId} marked offline. Triggering re-assignment.`);
        
        // Notify system that a request is now unassigned and potentially other operators are needed
        this.eventEmitter.emit('request.created', { id: requestId });
      }
    }
  }
}
