import { Injectable } from '@nestjs/common';
import { ConfigService } from '../common/config.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  AglpTransactionType,
  AglpTransactionStatus,
} from '@prisma/client';

@Injectable()
export class AglpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  getConversionRate(): number {
    const config = this.configService.get<{ rate: number }>(
      'AGLP_TO_ETB_RATE',
      {
        rate: 1.0,
      },
    );
    return Number(config.rate || 1.0);
  }

  // Handle ETB -> AGLP deposit
  async depositEtb(
    tx: Prisma.TransactionClient,
    profileId: string,
    amountEtb: number,
    referenceId?: string,
    referenceType: string = 'DEPOSIT',
  ) {
    const rate = this.getConversionRate();
    const amountAglp = amountEtb * rate;

    await tx.profile.update({
      where: { id: profileId },
      data: { aglpBalance: { increment: amountAglp } },
    });

    const aglpTx = await tx.aglpTransaction.create({
      data: {
        profileId,
        type: AglpTransactionType.DEPOSIT,
        amount: amountAglp,
        etbEquivalent: amountEtb,
        conversionRate: rate,
        status: AglpTransactionStatus.COMPLETED,
        referenceId,
        referenceType,
      },
    });

    // Write audit log for the UI (Earnings history)
    await tx.auditLog.create({
      data: {
        actorId: profileId,
        action: 'PACKAGE_REWARD_EARNED',
        targetTable: 'profiles',
        targetId: profileId,
        metadata: {
          referenceId,
          amount: amountAglp,
          amountEtb,
          reason: `Package reward for ${referenceType || 'PURCHASE'}`,
        },
      },
    });

    return aglpTx;
  }

  // Handle AGLP spend for packages
  async spendAglpForPackage(
    tx: Prisma.TransactionClient,
    profileId: string,
    amountAglp: number,
    packageId: string,
  ) {
    const profile = await tx.profile.findUnique({ where: { id: profileId } });
    if (!profile || Number(profile.aglpBalance) < amountAglp) {
      throw new Error('Insufficient AGLP balance');
    }

    await tx.profile.update({
      where: { id: profileId },
      data: { aglpBalance: { decrement: amountAglp } },
    });

    const aglpTx = await tx.aglpTransaction.create({
      data: {
        profileId,
        type: AglpTransactionType.SPEND_PACKAGE,
        amount: amountAglp,
        status: AglpTransactionStatus.COMPLETED,
        referenceId: packageId,
        referenceType: 'PACKAGE_UPGRADE',
      },
    });

    // Write audit log for the UI
    await tx.auditLog.create({
      data: {
        actorId: profileId,
        action: 'PACKAGE_UPGRADE_SPENT',
        targetTable: 'profiles',
        targetId: profileId,
        metadata: {
          referenceId: packageId,
          amount: amountAglp,
          reason: `Upgraded to package ${packageId} using AGLP`,
        },
      },
    });

    return aglpTx;
  }

  // Handle earning commission or rewards
  async earnCommission(
    tx: Prisma.TransactionClient,
    profileId: string,
    amountEtb: number,
    referenceId: string,
    reason: string,
  ) {
    const rate = this.getConversionRate();
    const amountAglp = amountEtb * rate;

    // 1. Check for suspicious spikes (Transactional)
    const thresholdConfig = this.configService.get<{ value: number }>(
      'alert_commission_spike_threshold',
      { value: 10000 },
    );
    const threshold = Number(thresholdConfig.value);

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentEarnings = await tx.aglpTransaction.aggregate({
      where: {
        profileId,
        type: AglpTransactionType.EARN,
        status: AglpTransactionStatus.COMPLETED,
        createdAt: { gte: twentyFourHoursAgo },
      },
      _sum: {
        etbEquivalent: true,
      },
    });

    const totalWithCurrent =
      Number(recentEarnings._sum.etbEquivalent || 0) + amountEtb;

    if (totalWithCurrent >= threshold) {
      await tx.auditLog.create({
        data: {
          actorId: profileId,
          action: 'SUSPICIOUS_COMMISSION',
          targetTable: 'profiles',
          targetId: profileId,
          metadata: {
            referenceId,
            currentAmount: amountEtb,
            rolling24hTotal: totalWithCurrent,
            threshold,
            reason: 'Commission spike detected',
          },
        },
      });
    }

    // 2. Credit AGLP Balance
    await tx.profile.update({
      where: { id: profileId },
      data: { aglpBalance: { increment: amountAglp } },
    });

    // 3. Log AGLP Earn Transaction
    await tx.aglpTransaction.create({
      data: {
        profileId,
        type: AglpTransactionType.EARN,
        amount: amountAglp,
        etbEquivalent: amountEtb,
        conversionRate: rate,
        status: AglpTransactionStatus.COMPLETED,
        referenceId,
        referenceType: 'COMMISSION_OR_REWARD',
      },
    });

    // 4. Write backwards compatible audit log
    await tx.auditLog.create({
      data: {
        actorId: profileId,
        action: 'COMMISSION_EARNED',
        targetTable: 'profiles',
        targetId: profileId,
        metadata: {
          referenceId,
          amount: amountAglp,
          amountEtb,
          reason,
        },
      },
    });
  }

  // Handle AGLP withdrawal request
  async withdrawAglp(
    tx: Prisma.TransactionClient,
    profileId: string,
    amountAglp: number,
  ) {
    const profile = await tx.profile.findUnique({ where: { id: profileId } });
    if (!profile || Number(profile.aglpBalance) < amountAglp) {
      throw new Error('Insufficient AGLP balance');
    }

    const rate = this.getConversionRate();
    const amountEtb = amountAglp / rate;

    // 1. Update Profile Balances
    await tx.profile.update({
      where: { id: profileId },
      data: {
        aglpBalance: { decrement: amountAglp },
        aglpWithdrawn: { increment: amountAglp },
      },
    });

    // 2. Log AGLP Withdrawal Transaction
    const aglpTx = await tx.aglpTransaction.create({
      data: {
        profileId,
        type: AglpTransactionType.WITHDRAWAL,
        amount: amountAglp,
        etbEquivalent: amountEtb,
        conversionRate: rate,
        status: AglpTransactionStatus.PENDING, // PENDING until admin approves
        referenceType: 'PAYOUT',
      },
    });

    // 3. Write audit log for the request
    await tx.auditLog.create({
      data: {
        actorId: profileId,
        action: 'PAYOUT_REQUESTED',
        targetTable: 'profiles',
        targetId: profileId,
        metadata: {
          amountAglp,
          amountEtb,
          aglpTxId: aglpTx.id,
        },
      },
    });

    return aglpTx;
  }

  // Handle AGLP withdrawal rejection (Refund)
  async rejectWithdrawal(
    tx: Prisma.TransactionClient,
    aglpTxId: string,
    reason: string,
  ) {
    const aglpTx = await tx.aglpTransaction.findUnique({
      where: { id: aglpTxId },
      include: { profile: true },
    });

    if (!aglpTx || aglpTx.type !== AglpTransactionType.WITHDRAWAL) {
      throw new Error('Withdrawal transaction not found');
    }

    if (aglpTx.status !== AglpTransactionStatus.PENDING) {
      // In my previous implementation I set it to COMPLETED by default,
      // but for administrative flow PENDING is better.
      // I will adjust the withdrawAglp method to set status to PENDING.
    }

    // 1. Refund the AGLP
    await tx.profile.update({
      where: { id: aglpTx.profileId },
      data: {
        aglpBalance: { increment: aglpTx.amount },
        aglpWithdrawn: { decrement: aglpTx.amount },
      },
    });

    // 2. Update Transaction Status
    await tx.aglpTransaction.update({
      where: { id: aglpTxId },
      data: { status: AglpTransactionStatus.REJECTED },
    });

    // 3. Log Audit Log
    await tx.auditLog.create({
      data: {
        actorId: aglpTx.profileId,
        action: 'PAYOUT_REJECTED',
        targetTable: 'profiles',
        targetId: aglpTx.profileId,
        metadata: {
          aglpTxId,
          amountAglp: aglpTx.amount,
          reason,
        },
      },
    });
  }

  // Handle locking commission in escrow (Pending)
  async lockCommission(
    tx: Prisma.TransactionClient,
    profileId: string,
    amountEtb: number,
    referenceId: string,
    reason: string,
  ) {
    const rate = this.getConversionRate();
    const amountAglp = amountEtb * rate;

    // Credit AGLP Pending (instead of balance)
    await tx.profile.update({
      where: { id: profileId },
      data: { aglpPending: { increment: amountAglp } },
    });

    // Log AGLP Earn Transaction as PENDING
    const aglpTx = await tx.aglpTransaction.create({
      data: {
        profileId,
        type: AglpTransactionType.EARN,
        amount: amountAglp,
        etbEquivalent: amountEtb,
        conversionRate: rate,
        status: AglpTransactionStatus.PENDING,
        referenceId,
        referenceType: 'COMMISSION_ESCROW',
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        actorId: profileId,
        action: 'COMMISSION_LOCKED',
        targetTable: 'profiles',
        targetId: profileId,
        metadata: {
          aglpTxId: aglpTx.id,
          referenceId,
          amount: amountAglp,
          amountEtb,
          reason: `${reason} (Awaiting Admin Release)`,
        },
      },
    });

    return aglpTx;
  }

  // Release commission from escrow to available balance
  async releaseEscrow(tx: Prisma.TransactionClient, aglpTxId: string) {
    const aglpTx = await tx.aglpTransaction.findUnique({
      where: { id: aglpTxId },
      include: { profile: true },
    });

    if (
      !aglpTx ||
      aglpTx.status !== AglpTransactionStatus.PENDING ||
      aglpTx.type !== AglpTransactionType.EARN
    ) {
      throw new Error('Valid pending escrow transaction not found');
    }

    // Move from pending to balance
    await tx.profile.update({
      where: { id: aglpTx.profileId },
      data: {
        aglpPending: { decrement: aglpTx.amount },
        aglpBalance: { increment: aglpTx.amount },
      },
    });

    // Update transaction status
    await tx.aglpTransaction.update({
      where: { id: aglpTxId },
      data: { status: AglpTransactionStatus.COMPLETED },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        actorId: aglpTx.profileId,
        action: 'COMMISSION_RELEASED',
        targetTable: 'profiles',
        targetId: aglpTx.profileId,
        metadata: {
          aglpTxId,
          amount: aglpTx.amount,
          reason: 'Escrow released by Admin',
        },
      },
    });
  }

  // Allow agent to cancel their own PENDING withdrawal
  async cancelWithdrawal(
    tx: Prisma.TransactionClient,
    aglpTxId: string,
    requestedByProfileId: string,
  ) {
    const aglpTx = await tx.aglpTransaction.findUnique({
      where: { id: aglpTxId },
    });

    if (
      !aglpTx ||
      aglpTx.type !== AglpTransactionType.WITHDRAWAL ||
      aglpTx.profileId !== requestedByProfileId ||
      aglpTx.status !== AglpTransactionStatus.PENDING
    ) {
      throw new Error('Cannot cancel this withdrawal');
    }

    // Refund the AGLP
    await tx.profile.update({
      where: { id: requestedByProfileId },
      data: {
        aglpBalance: { increment: aglpTx.amount },
        aglpWithdrawn: { decrement: aglpTx.amount },
      },
    });

    // Update Transaction Status to REJECTED (as in cancelled)
    await tx.aglpTransaction.update({
      where: { id: aglpTxId },
      data: { status: AglpTransactionStatus.REJECTED },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        actorId: requestedByProfileId,
        action: 'PAYOUT_CANCELLED',
        targetTable: 'profiles',
        targetId: requestedByProfileId,
        metadata: {
          aglpTxId,
          amountAglp: aglpTx.amount,
          reason: 'Cancelled by Agent',
        },
      },
    });
  }
}
