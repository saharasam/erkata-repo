import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeedbackBundleState, UserRole, RequestStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { ConfigService } from '../common/config.service';

@Injectable()
export class MediationService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @InjectQueue('mediation') private mediationQueue: Queue,
  ) {}

  async submitFeedback(
    transactionId: string,
    authorId: string,
    content: string,
    rating: number,
    categories: string[] = [],
  ) {
    // 1. Validate transaction existence
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { feedbacks: true },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    // 2. Validate author and role
    const author = await this.prisma.profile.findUnique({
      where: { id: authorId },
    });
    if (!author) throw new NotFoundException('Author not found');

    if (author.role !== UserRole.customer && author.role !== UserRole.agent) {
      throw new BadRequestException(
        'Only Customers and Agents can submit feedback',
      );
    }

    // 3. Prevent duplicate feedback from the same author for this transaction
    const existingFeedback = transaction.feedbacks.find(
      (f) => f.authorId === authorId,
    );
    if (existingFeedback)
      throw new BadRequestException(
        'Feedback already submitted for this transaction',
      );

    // 4. Create feedback
    const feedback = await this.prisma.feedback.create({
      data: {
        transactionId,
        authorId,
        content,
        rating,
        categories,
      } as any,
    });

    // 5. Schedule timeout if this is the first feedback
    if (transaction.feedbacks.length === 0) {
      await this.mediationQueue.add(
        'feedback-timeout',
        { transactionId },
        { delay: 14 * 24 * 60 * 60 * 1000 }, // 14 days
      );
    }

    // 6. Check for Auto-Bundling
    await this.checkAndBundle(transactionId);

    return feedback;
  }

  private async checkAndBundle(transactionId: string) {
    const feedbacks = await this.prisma.feedback.findMany({
      where: { transactionId },
      include: { author: true },
    });

    const hasCustomer = feedbacks.some(
      (f) => f.author.role === UserRole.customer,
    );
    const hasAgent = feedbacks.some((f) => f.author.role === UserRole.agent);

    if (hasCustomer && hasAgent) {
      // Create or Update Bundle to BUNDLED status
      await this.prisma.feedbackBundle.upsert({
        where: { transactionId },
        update: {
          state: FeedbackBundleState.BUNDLED,
          stateHistory: {
            push: {
              from: FeedbackBundleState.WAITING_BOTH,
              to: FeedbackBundleState.BUNDLED,
              at: new Date().toISOString(),
              by: 'SYSTEM',
              reason: 'Automatic bundling after both parties provided feedback',
            },
          },
        },
        create: {
          transactionId,
          state: FeedbackBundleState.BUNDLED,
          stateHistory: [
            {
              from: FeedbackBundleState.WAITING_BOTH,
              to: FeedbackBundleState.BUNDLED,
              at: new Date().toISOString(),
              by: 'SYSTEM',
              reason: 'Initial automatic bundle creation',
            },
          ],
        },
      });
    }
  }

  async proposeResolution(
    bundleId: string,
    adminId: string,
    proposedText: string,
  ) {
    const bundle = await this.prisma.feedbackBundle.findUnique({
      where: { id: bundleId },
    });
    if (!bundle) throw new NotFoundException('Bundle not found');

    const proposal = await this.prisma.resolutionProposal.create({
      data: {
        bundleId,
        proposedById: adminId,
        proposedText,
      },
    });

    await this.prisma.feedbackBundle.update({
      where: { id: bundleId },
      data: {
        state: FeedbackBundleState.PROPOSED,
        stateHistory: {
          push: {
            from: bundle.state,
            to: FeedbackBundleState.PROPOSED,
            at: new Date().toISOString(),
            by: adminId,
            reason: 'Admin proposed resolution',
          },
        },
      },
    });

    return proposal;
  }

  async finalizeResolution(
    proposalId: string,
    actorId: string,
    approved: boolean,
    comment?: string,
  ) {
    const proposal = await this.prisma.resolutionProposal.findUnique({
      where: { id: proposalId },
      include: {
        bundle: true,
      },
    });

    if (!proposal) throw new NotFoundException('Proposal not found');

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: proposal.bundle.transactionId },
      include: { match: { include: { request: true } } },
    });

    if (!transaction)
      throw new NotFoundException('Associated transaction not found');

    const actor = await this.prisma.profile.findUnique({
      where: { id: actorId },
    });
    if (!actor) throw new NotFoundException('Actor not found');

    const isEscalated = transaction.match.request.status === RequestStatus.disputed;
    const budget = transaction.match.request.budgetMax
      ? Number(transaction.match.request.budgetMax)
      : 0;
    const riskThreshold = this.config.get<number>(
      'high_risk_threshold_etb',
      ConfigService.DEFAULT_RISK_THRESHOLD,
    );
    const isHighRisk = budget > riskThreshold;

    if ((isEscalated || isHighRisk) && actor.role !== UserRole.super_admin) {
      throw new BadRequestException(
        'This case is escalated/high-risk and requires Super Admin finalization',
      );
    }

    const final = await this.prisma.finalResolution.create({
      data: {
        proposalId,
        approved,
        comment,
        finalizedById: actorId,
      },
    });

    await this.prisma.feedbackBundle.update({
      where: { id: proposal.bundleId },
      data: {
        state: approved
          ? FeedbackBundleState.RESOLVED
          : FeedbackBundleState.REJECTED,
        stateHistory: {
          push: {
            from: proposal.bundle.state,
            to: approved
              ? FeedbackBundleState.RESOLVED
              : FeedbackBundleState.REJECTED,
            at: new Date().toISOString(),
            by: actorId,
            reason: comment || 'Final decision recorded',
          },
        },
      },
    });

    return final;
  }

  async escalateToSuperAdmin(
    bundleId: string,
    adminId: string,
    reason: string,
  ) {
    const bundle = await this.prisma.feedbackBundle.findUnique({
      where: { id: bundleId },
    });
    if (!bundle) throw new NotFoundException('Bundle not found');

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: bundle.transactionId },
      include: { match: true },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');



    await this.prisma.feedbackBundle.update({
      where: { id: bundleId },
      data: {
        stateHistory: {
          push: {
            from: bundle.state,
            to: bundle.state,
            at: new Date().toISOString(),
            by: adminId,
            reason: `Escalated to Super Admin: ${reason}`,
          },
        },
      },
    });

    return { escalated: true };
  }

  async overrideResolution(
    resolutionId: string,
    superAdminId: string,
    newApproved: boolean,
    comment: string,
  ) {
    const resolution = await this.prisma.finalResolution.findUnique({
      where: { id: resolutionId },
      include: { proposal: { include: { bundle: true } } },
    });

    if (!resolution) throw new NotFoundException('Resolution not found');

    const updated = await this.prisma.finalResolution.update({
      where: { id: resolutionId },
      data: {
        approved: newApproved,
        comment: `OVERRIDDEN by Super Admin: ${comment}`,
        finalizedById: superAdminId,
      },
    });

    if (newApproved !== resolution.approved) {
      await this.prisma.feedbackBundle.update({
        where: { id: resolution.proposal.bundleId },
        data: {
          state: newApproved
            ? FeedbackBundleState.RESOLVED
            : FeedbackBundleState.REJECTED,
          stateHistory: {
            push: {
              from: resolution.proposal.bundle.state,
              to: newApproved
                ? FeedbackBundleState.RESOLVED
                : FeedbackBundleState.REJECTED,
              at: new Date().toISOString(),
              by: superAdminId,
              reason: `Resolution OVERRIDDEN: ${comment}`,
            },
          },
        },
      });
    }

    return updated;
  }

  async getBundles(state?: FeedbackBundleState) {
    return this.prisma.feedbackBundle.findMany({
      where: state ? { state } : {},
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      include: {
        transaction: {
          include: {
            agent: true,
            match: {
              include: {
                request: {
                  include: {
                    customer: true,
                    zone: true,
                  },
                },
              },
            },
            feedbacks: {
              include: {
                author: true,
              },
            },
          },
        },
      } as any,
      orderBy: { createdAt: 'desc' },
    });
  }

  async finalizeBundleDirectly(
    bundleId: string,
    actorId: string,
    resolutionText: string,
  ) {
    const proposal = await this.prisma.resolutionProposal.create({
      data: {
        bundleId,
        proposedById: actorId,
        proposedText: resolutionText,
      },
    });

    return this.finalizeResolution(
      proposal.id,
      actorId,
      true,
      'Direct Admin Resolution',
    );
  }
}
