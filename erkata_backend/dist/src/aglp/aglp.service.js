"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AglpService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../common/config.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AglpService = class AglpService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    getConversionRate() {
        const config = this.configService.get('AGLP_TO_ETB_RATE', {
            rate: 1.0,
        });
        return Number(config.rate || 1.0);
    }
    async depositEtb(tx, profileId, amountEtb, referenceId, referenceType = 'DEPOSIT') {
        const rate = this.getConversionRate();
        const amountAglp = amountEtb * rate;
        await tx.profile.update({
            where: { id: profileId },
            data: { aglpBalance: { increment: amountAglp } },
        });
        const aglpTx = await tx.aglpTransaction.create({
            data: {
                profileId,
                type: client_1.AglpTransactionType.DEPOSIT,
                amount: amountAglp,
                etbEquivalent: amountEtb,
                conversionRate: rate,
                status: client_1.AglpTransactionStatus.COMPLETED,
                referenceId,
                referenceType,
            },
        });
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
    async spendAglpForPackage(tx, profileId, amountAglp, packageId) {
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
                type: client_1.AglpTransactionType.SPEND_PACKAGE,
                amount: amountAglp,
                status: client_1.AglpTransactionStatus.COMPLETED,
                referenceId: packageId,
                referenceType: 'PACKAGE_UPGRADE',
            },
        });
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
    async earnCommission(tx, profileId, amountEtb, referenceId, reason) {
        const rate = this.getConversionRate();
        const amountAglp = amountEtb * rate;
        const thresholdConfig = this.configService.get('alert_commission_spike_threshold', { value: 10000 });
        const threshold = Number(thresholdConfig.value);
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const recentEarnings = await tx.aglpTransaction.aggregate({
            where: {
                profileId,
                type: client_1.AglpTransactionType.EARN,
                status: client_1.AglpTransactionStatus.COMPLETED,
                createdAt: { gte: twentyFourHoursAgo },
            },
            _sum: {
                etbEquivalent: true,
            },
        });
        const totalWithCurrent = Number(recentEarnings._sum.etbEquivalent || 0) + amountEtb;
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
        await tx.profile.update({
            where: { id: profileId },
            data: { aglpBalance: { increment: amountAglp } },
        });
        await tx.aglpTransaction.create({
            data: {
                profileId,
                type: client_1.AglpTransactionType.EARN,
                amount: amountAglp,
                etbEquivalent: amountEtb,
                conversionRate: rate,
                status: client_1.AglpTransactionStatus.COMPLETED,
                referenceId,
                referenceType: 'COMMISSION_OR_REWARD',
            },
        });
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
    async withdrawAglp(tx, profileId, amountAglp) {
        const profile = await tx.profile.findUnique({ where: { id: profileId } });
        if (!profile || Number(profile.aglpBalance) < amountAglp) {
            throw new Error('Insufficient AGLP balance');
        }
        const minAmount = this.configService.get('withdrawal_min_amount', 100);
        if (amountAglp < minAmount) {
            throw new Error(`Minimum withdrawal amount is ${minAmount} AGLP`);
        }
        const maxDaily = this.configService.get('withdrawal_max_amount_daily', 50000);
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const recentWithdrawals = await tx.aglpTransaction.aggregate({
            where: {
                profileId,
                type: client_1.AglpTransactionType.WITHDRAWAL,
                status: { not: client_1.AglpTransactionStatus.REJECTED },
                createdAt: { gte: twentyFourHoursAgo },
            },
            _sum: { amount: true },
        });
        const totalWithdrawn24h = Number(recentWithdrawals._sum.amount || 0);
        if (totalWithdrawn24h + amountAglp > maxDaily) {
            throw new Error(`Daily withdrawal limit reached. Max: ${maxDaily} AGLP. Already withdrawn in 24h: ${totalWithdrawn24h} AGLP.`);
        }
        const feePct = this.configService.get('withdrawal_fee_percentage', 0.05);
        const feeAmountAglp = amountAglp * feePct;
        const netAglp = amountAglp - feeAmountAglp;
        const rate = this.getConversionRate();
        const netEtb = netAglp / rate;
        await tx.profile.update({
            where: { id: profileId },
            data: {
                aglpBalance: { decrement: amountAglp },
                aglpWithdrawn: { increment: amountAglp },
            },
        });
        const aglpTx = await tx.aglpTransaction.create({
            data: {
                profileId,
                type: client_1.AglpTransactionType.WITHDRAWAL,
                amount: amountAglp,
                etbEquivalent: netEtb,
                conversionRate: rate,
                status: client_1.AglpTransactionStatus.PENDING,
                referenceType: 'PAYOUT',
            },
        });
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
    async rejectWithdrawal(tx, aglpTxId, reason) {
        const aglpTx = await tx.aglpTransaction.findUnique({
            where: { id: aglpTxId },
            include: { profile: true },
        });
        if (!aglpTx || aglpTx.type !== client_1.AglpTransactionType.WITHDRAWAL) {
            throw new Error('Withdrawal transaction not found');
        }
        if (aglpTx.status !== client_1.AglpTransactionStatus.PENDING) {
        }
        await tx.profile.update({
            where: { id: aglpTx.profileId },
            data: {
                aglpBalance: { increment: aglpTx.amount },
                aglpWithdrawn: { decrement: aglpTx.amount },
            },
        });
        await tx.aglpTransaction.update({
            where: { id: aglpTxId },
            data: { status: client_1.AglpTransactionStatus.REJECTED },
        });
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
    async lockCommission(tx, profileId, amountEtb, referenceId, reason) {
        const rate = this.getConversionRate();
        const amountAglp = amountEtb * rate;
        await tx.profile.update({
            where: { id: profileId },
            data: { aglpPending: { increment: amountAglp } },
        });
        const aglpTx = await tx.aglpTransaction.create({
            data: {
                profileId,
                type: client_1.AglpTransactionType.EARN,
                amount: amountAglp,
                etbEquivalent: amountEtb,
                conversionRate: rate,
                status: client_1.AglpTransactionStatus.PENDING,
                referenceId,
                referenceType: 'COMMISSION_ESCROW',
            },
        });
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
    async releaseEscrow(tx, aglpTxId) {
        const aglpTx = await tx.aglpTransaction.findUnique({
            where: { id: aglpTxId },
            include: { profile: true },
        });
        if (!aglpTx ||
            aglpTx.status !== client_1.AglpTransactionStatus.PENDING ||
            aglpTx.type !== client_1.AglpTransactionType.EARN) {
            throw new Error('Valid pending escrow transaction not found');
        }
        await tx.profile.update({
            where: { id: aglpTx.profileId },
            data: {
                aglpPending: { decrement: aglpTx.amount },
                aglpBalance: { increment: aglpTx.amount },
            },
        });
        await tx.aglpTransaction.update({
            where: { id: aglpTxId },
            data: { status: client_1.AglpTransactionStatus.COMPLETED },
        });
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
    async cancelWithdrawal(tx, aglpTxId, requestedByProfileId) {
        const aglpTx = await tx.aglpTransaction.findUnique({
            where: { id: aglpTxId },
        });
        if (!aglpTx ||
            aglpTx.type !== client_1.AglpTransactionType.WITHDRAWAL ||
            aglpTx.profileId !== requestedByProfileId ||
            aglpTx.status !== client_1.AglpTransactionStatus.PENDING) {
            throw new Error('Cannot cancel this withdrawal');
        }
        await tx.profile.update({
            where: { id: requestedByProfileId },
            data: {
                aglpBalance: { increment: aglpTx.amount },
                aglpWithdrawn: { decrement: aglpTx.amount },
            },
        });
        await tx.aglpTransaction.update({
            where: { id: aglpTxId },
            data: { status: client_1.AglpTransactionStatus.REJECTED },
        });
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
};
exports.AglpService = AglpService;
exports.AglpService = AglpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_service_1.ConfigService])
], AglpService);
//# sourceMappingURL=aglp.service.js.map