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
    bankDetails: {
      bankName: string;
      bankAccountNumber: string;
      bankAccountHolder: string;
    },
  ) {
    const profile = await tx.profile.findUnique({ where: { id: profileId } });
    if (!profile || Number(profile.aglpBalance) < amountAglp) {
      throw new Error('Insufficient AGLP balance');
    }

    // 1. Enforce Minimum Amount
    const minAmount = this.configService.get<number>(
      'withdrawal_min_amount',
      100,
    );
    if (amountAglp < minAmount) {
      throw new Error(`Minimum withdrawal amount is ${minAmount} AGLP`);
    }

    // 2. Enforce Daily Maximum
    const maxDaily = this.configService.get<number>(
      'withdrawal_max_amount_daily',
      50000,
    );
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentWithdrawals = await tx.aglpTransaction.aggregate({
      where: {
        profileId,
        type: AglpTransactionType.WITHDRAWAL,
        status: { not: AglpTransactionStatus.REJECTED },
        createdAt: { gte: twentyFourHoursAgo },
      },
      _sum: { amount: true },
    });

    const totalWithdrawn24h = Number(recentWithdrawals._sum.amount || 0);
    if (totalWithdrawn24h + amountAglp > maxDaily) {
      throw new Error(
        `Daily withdrawal limit reached. Max: ${maxDaily} AGLP. Already withdrawn in 24h: ${totalWithdrawn24h} AGLP.`,
      );
    }

    // 3. Apply Processing Fee
    const feePct = this.configService.get<number>(
      'withdrawal_fee_percentage',
      0.05,
    );
    const feeAmountAglp = amountAglp * feePct;
    const netAglp = amountAglp - feeAmountAglp;

    const rate = this.getConversionRate();
    const netEtb = netAglp / rate;

    // 4. Update Profile Balances (Gross amount deducted from balance only)
    await tx.profile.update({
      where: { id: profileId },
      data: {
        aglpBalance: { decrement: amountAglp },
      },
    });

    // 5. Log AGLP Withdrawal Transaction
    const aglpTx = await tx.aglpTransaction.create({
      data: {
        profileId,
        type: AglpTransactionType.WITHDRAWAL,
        amount: amountAglp,
        etbEquivalent: netEtb,
        conversionRate: rate,
        status: AglpTransactionStatus.PENDING,
        referenceType: 'PAYOUT',
        bankName: bankDetails.bankName,
        bankAccountNumber: bankDetails.bankAccountNumber,
        bankAccountHolder: bankDetails.bankAccountHolder,
      },
    });

    // 6. Write audit log
    await tx.auditLog.create({
      data: {
        actorId: profileId,
        action: 'PAYOUT_REQUESTED',
        targetTable: 'profiles',
        targetId: profileId,
        metadata: {
          amountAglp,
          feeAglp: feeAmountAglp,
          netAglp,
          amountEtb: netEtb,
          aglpTxId: aglpTx.id,
        },
      },
    });

    return aglpTx;
  }

  // Handle AGLP withdrawal rejection (Refund)
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

    // 1. Refund the AGLP to balance only (since it was never in aglpWithdrawn)
    await tx.profile.update({
      where: { id: aglpTx.profileId },
      data: {
        aglpBalance: { increment: aglpTx.amount },
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

  // Finalize AGLP withdrawal (Mark as received)
  async completeWithdrawal(tx: Prisma.TransactionClient, aglpTxId: string) {
    const aglpTx = await tx.aglpTransaction.findUnique({
      where: { id: aglpTxId },
    });

    if (
      !aglpTx ||
      aglpTx.type !== AglpTransactionType.WITHDRAWAL ||
      aglpTx.status !== AglpTransactionStatus.PENDING
    ) {
      throw new Error('Valid pending withdrawal transaction not found');
    }

    // 1. Update Profile: Mark money as officially withdrawn
    await tx.profile.update({
      where: { id: aglpTx.profileId },
      data: {
        aglpWithdrawn: { increment: aglpTx.amount },
      },
    });

    // 2. Update Transaction Status
    await tx.aglpTransaction.update({
      where: { id: aglpTxId },
      data: { status: AglpTransactionStatus.COMPLETED },
    });

    // 3. Log Audit Log
    await tx.auditLog.create({
      data: {
        actorId: aglpTx.profileId,
        action: 'PAYOUT_COMPLETED',
        targetTable: 'profiles',
        targetId: aglpTx.profileId,
        metadata: {
          aglpTxId,
          amountAglp: aglpTx.amount,
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
          reason: 'Escrow released by system (Terminal State reached)',
        },
      },
    });
  }

  // Release commission for a specific match
  async releaseCommissionByMatchId(
    tx: Prisma.TransactionClient,
    matchId: string,
  ) {
    const aglpTxs = await tx.aglpTransaction.findMany({
      where: {
        referenceId: matchId,
        type: AglpTransactionType.EARN,
        status: AglpTransactionStatus.PENDING,
      },
    });

    for (const aglpTx of aglpTxs) {
      await this.releaseEscrow(tx, aglpTx.id);
    }
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
