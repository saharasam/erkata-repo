import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { FeedbackBundleState } from '@prisma/client';

@Processor('mediation')
export class MediationProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<unknown, unknown, string>): Promise<unknown> {
    if (job.name === 'feedback-timeout') {
      await this.handleTimeout(job);
    }
    return undefined;
  }

  private async handleTimeout(job: Job) {
    const { transactionId } = job.data as { transactionId: string };

    const bundle = await this.prisma.feedbackBundle.findUnique({
      where: { transactionId },
    });

    if (!bundle) return;

    // Use string comparisons for states that might not be in the stale generated types
    const state = bundle.state as string;

    if (
      state === 'WAITING_BOTH' ||
      state === 'WAITING_AGENT' ||
      state === 'WAITING_CUSTOMER'
    ) {
      const timedOutState = 'TIMED_OUT' as unknown as FeedbackBundleState;

      // Define a local type for JSON history to satisfy strict Prisma types
      type StateHistoryEntry = {
        from: string;
        to: string;
        at: string;
        by: string;
        reason: string;
      };

      // Avoid 'unbound-method' by using a structural interface cast for the model access
      interface FeedbackBundleModel {
        update: (args: {
          where: { transactionId: string };
          data: {
            state: FeedbackBundleState;
            stateHistory: { push: unknown };
          };
        }) => Promise<unknown>;
      }

      await (
        this.prisma.feedbackBundle as unknown as FeedbackBundleModel
      ).update({
        where: { transactionId },
        data: {
          state: timedOutState,
          stateHistory: {
            push: {
              from: state,
              to: 'TIMED_OUT',
              at: new Date().toISOString(),
              by: 'SYSTEM',
              reason: '14-day feedback window expired',
            } as StateHistoryEntry as unknown,
          },
        },
      });
    }
  }
}
