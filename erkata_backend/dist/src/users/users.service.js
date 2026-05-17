"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = exports.TierPriority = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const config_service_1 = require("../common/config.service");
const aglp_service_1 = require("../aglp/aglp.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const bcrypt = __importStar(require("bcrypt"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
exports.TierPriority = {
    ABUNDANT_LIFE: 5,
    UNITY: 4,
    LOVE: 3,
    PEACE: 2,
    FREE: 1,
};
let UsersService = class UsersService {
    prisma;
    aglpService;
    configService;
    notificationsGateway;
    jwtService;
    constructor(prisma, aglpService, configService, notificationsGateway, jwtService) {
        this.prisma = prisma;
        this.aglpService = aglpService;
        this.configService = configService;
        this.notificationsGateway = notificationsGateway;
        this.jwtService = jwtService;
    }
    async getCurrentProfile(userId, callerId, callerRole) {
        const isOwner = callerId === userId;
        const isAdmin = callerRole === client_1.UserRole.admin || callerRole === client_1.UserRole.super_admin;
        const globalOmit = {
            passwordHash: true,
        };
        const privacyOmit = !isOwner && !isAdmin
            ? {
                aglpBalance: true,
                aglpWithdrawn: true,
                warningCount: true,
                missedAssignments: true,
                tinNumber: true,
                tradeLicenseNumber: true,
            }
            : {};
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
            omit: {
                ...globalOmit,
                ...privacyOmit,
            },
            include: {
                agentZones: {
                    include: {
                        zone: true,
                    },
                },
                referralLink: true,
                package: true,
                referrals: {
                    select: {
                        id: true,
                        fullName: true,
                        createdAt: true,
                        role: true,
                        tier: true,
                        package: {
                            select: {
                                displayName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        operatorMatches: true,
                        proposals: true,
                        agentMatches: true,
                        finalResolutions: true,
                    },
                },
            },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        let performanceStats = {
            missedAssignments: profile.missedAssignments,
            warningCount: profile.warningCount,
        };
        if (profile.role === client_1.UserRole.agent) {
            const matchStats = await this.prisma.match.groupBy({
                by: ['status'],
                where: { agentId: userId },
                _count: true,
            });
            const statsMap = matchStats.reduce((acc, curr) => {
                acc[curr.status] = curr._count;
                return acc;
            }, {});
            const ratingStats = await this.prisma.feedback.aggregate({
                where: {
                    authorId: { not: userId },
                    transaction: { match: { agentId: userId } },
                },
                _avg: { rating: true },
            });
            performanceStats = {
                ...performanceStats,
                acceptedCount: statsMap['accepted'] || 0,
                rejectedCount: statsMap['rejected'] || 0,
                completedCount: statsMap['completed'] || 0,
                avgRating: ratingStats._avg.rating || 0,
            };
        }
        if (profile.role === client_1.UserRole.operator) {
            performanceStats = {
                ...performanceStats,
                assignmentCount: profile._count.operatorMatches,
                disputeResolutionCount: profile._count.proposals,
            };
        }
        if (profile.role === client_1.UserRole.admin ||
            profile.role === client_1.UserRole.super_admin) {
            performanceStats = {
                ...performanceStats,
                finalDecisionCount: profile._count.finalResolutions,
                proposalsCount: profile._count.proposals,
            };
        }
        const lastLoginLog = await this.prisma.auditLog.findFirst({
            where: {
                actorId: userId,
                action: 'USER_LOGIN',
            },
            orderBy: { createdAt: 'desc' },
        });
        const loginMetadata = lastLoginLog?.metadata || {};
        return {
            ...profile,
            aglpBalance: profile.aglpBalance?.toNumber() || 0,
            aglpWithdrawn: profile.aglpWithdrawn?.toNumber() || 0,
            performanceStats,
            lastLoginAt: lastLoginLog?.createdAt || null,
            lastLoginIp: loginMetadata.ip || null,
            lastLoginDevice: loginMetadata.userAgent || null,
        };
    }
    async isReferrerOf(referrerId, targetId) {
        const target = await this.prisma.profile.findUnique({
            where: { id: targetId },
            select: { referredById: true },
        });
        return target?.referredById === referrerId;
    }
    async getProfileRoleById(userId) {
        return this.prisma.profile.findUnique({
            where: { id: userId },
            select: { id: true, role: true },
        });
    }
    async getFinanceSummary(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
            select: {
                aglpBalance: true,
                aglpWithdrawn: true,
                tier: true,
                referrals: { select: { id: true } },
                referralLink: { select: { tier: true } },
                agentZones: { select: { id: true } },
                package: true,
            },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const tier = profile.tier || 'FREE';
        const totalSlots = await this.getReferralLimit(tier);
        const usedSlots = profile.referrals.length;
        const usedZones = profile.agentZones?.length || 0;
        const totalZones = await this.getZoneLimit(tier);
        const tiers = Object.keys(exports.TierPriority).sort((a, b) => exports.TierPriority[a] - exports.TierPriority[b]);
        const currentTierIndex = tiers.indexOf(tier);
        const nextTierEnum = currentTierIndex !== -1 && currentTierIndex < tiers.length - 1
            ? tiers[currentTierIndex + 1]
            : null;
        let nextTier = 'Maximum Tier';
        if (nextTierEnum) {
            const nextPkg = await this.prisma.package.findUnique({
                where: { name: nextTierEnum },
                select: { displayName: true },
            });
            nextTier = nextPkg?.displayName || nextTierEnum.replace('_', ' ');
        }
        const history = await this.prisma.auditLog.findMany({
            where: {
                OR: [{ actorId: userId }, { targetId: userId }],
                action: {
                    in: [
                        'COMMISSION_EARNED',
                        'REFERRAL_COMMISSION_EARNED',
                        'REFERRAL_COMMISSION_CREDITED',
                        'PAYOUT_REQUESTED',
                        'PAYOUT_COMPLETED',
                        'PACKAGE_REWARD_EARNED',
                        'PACKAGE_UPGRADE_SPENT',
                    ],
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const formattedHistory = history.map((log) => {
            const metadata = log.metadata || {};
            const type = log.action.includes('REFERRAL')
                ? 'Referral'
                : log.action.includes('PACKAGE')
                    ? 'Package'
                    : log.action.includes('PAYOUT')
                        ? 'Withdrawal'
                        : 'Commission';
            return {
                id: log.id,
                action: log.action,
                amount: metadata.amount || metadata.amountAglp || 0,
                type,
                createdAt: log.createdAt,
                metadata: {
                    ...metadata,
                    amountAglp: metadata.amountAglp || metadata.amount || 0,
                    transactionId: metadata.transactionId || metadata.aglpTxId || log.id,
                },
            };
        });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const currentWeekLogs = await this.prisma.auditLog.findMany({
            where: {
                targetId: userId,
                action: { contains: 'EARNED' },
                createdAt: { gte: sevenDaysAgo },
            },
        });
        const previousWeekLogs = await this.prisma.auditLog.findMany({
            where: {
                targetId: userId,
                action: { contains: 'EARNED' },
                createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
            },
        });
        const sumLogs = (logs) => logs.reduce((acc, log) => {
            const metadata = log.metadata || {};
            const amount = Number(metadata.amount || metadata.amountAglp || 0);
            return acc + amount;
        }, 0);
        const currentTotal = sumLogs(currentWeekLogs);
        const previousTotal = sumLogs(previousWeekLogs);
        let weeklyGrowth = 0;
        if (previousTotal > 0) {
            weeklyGrowth = ((currentTotal - previousTotal) / previousTotal) * 100;
        }
        else if (currentTotal > 0) {
            weeklyGrowth = 100;
        }
        const chartData = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStart = new Date(d.setHours(0, 0, 0, 0));
            const dayEnd = new Date(d.setHours(23, 59, 59, 999));
            const dayLogs = currentWeekLogs.filter((l) => l.createdAt >= dayStart && l.createdAt <= dayEnd);
            return sumLogs(dayLogs);
        }).reverse();
        const pendingWithdrawalsSum = await this.prisma.aglpTransaction.aggregate({
            where: {
                profileId: userId,
                type: 'WITHDRAWAL',
                status: 'PENDING',
            },
            _sum: { amount: true },
        });
        const completedWithdrawalsSum = await this.prisma.aglpTransaction.aggregate({
            where: {
                profileId: userId,
                type: 'WITHDRAWAL',
                status: 'COMPLETED',
            },
            _sum: { amount: true },
        });
        const dynamicWithdrawn = completedWithdrawalsSum._sum.amount?.toNumber() || 0;
        const dynamicPendingWithdrawals = pendingWithdrawalsSum._sum.amount?.toNumber() || 0;
        return {
            balance: profile.aglpBalance.toNumber(),
            aglpAvailable: profile.aglpBalance.toNumber(),
            aglpPending: dynamicPendingWithdrawals,
            aglpPendingWithdrawals: dynamicPendingWithdrawals,
            aglpWithdrawn: dynamicWithdrawn,
            usedSlots,
            totalSlots,
            usedZones,
            totalZones,
            currentTier: profile.package?.displayName || tier.replace('_', ' '),
            tier,
            packageDisplayName: profile.package?.displayName,
            nextTier,
            weeklyGrowth: {
                percentage: weeklyGrowth.toFixed(1),
                amount: currentTotal - previousTotal,
                chart: chartData,
            },
            totalEarnings: profile.aglpBalance.toNumber() + dynamicWithdrawn,
            history: formattedHistory,
        };
    }
    canModifyUser(callerRole, targetRole) {
        if (callerRole === client_1.UserRole.super_admin)
            return true;
        if (callerRole === client_1.UserRole.admin) {
            const targetRoles = [
                client_1.UserRole.operator,
                client_1.UserRole.financial_operator,
            ];
            return targetRoles.includes(targetRole);
        }
        return false;
    }
    getScopeFilter(userId, role) {
        if (role === client_1.UserRole.super_admin)
            return {};
        if (role === client_1.UserRole.admin) {
            return {
                role: {
                    in: [
                        client_1.UserRole.operator,
                        client_1.UserRole.agent,
                        client_1.UserRole.customer,
                        client_1.UserRole.financial_operator,
                    ],
                },
            };
        }
        if (role === client_1.UserRole.operator) {
            return {
                OR: [
                    { agentMatches: { some: { operatorId: userId } } },
                    {
                        customerRequests: {
                            some: { matches: { some: { operatorId: userId } } },
                        },
                    },
                ],
            };
        }
        return { id: userId };
    }
    async findAll(callerId, callerRole, filters) {
        if (callerRole !== client_1.UserRole.admin && callerRole !== client_1.UserRole.super_admin) {
            throw new common_1.ForbiddenException('Only admins can list all users');
        }
        const profiles = await this.prisma.profile.findMany({
            where: {
                role: filters.role,
                isActive: filters.isActive,
            },
            omit: {
                passwordHash: true,
            },
            include: {
                referredBy: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                referralLink: true,
                package: true,
                agentZones: {
                    include: {
                        zone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (filters.role === client_1.UserRole.agent && profiles.length > 0) {
            const agentIds = profiles.map((p) => p.id);
            const matchStatsRaw = await this.prisma.$queryRaw `
        SELECT 
          m.agent_id,
          COUNT(CASE WHEN m.status = 'accepted' THEN 1 END) as accepted_count,
          COUNT(CASE WHEN m.status = 'rejected' THEN 1 END) as rejected_count,
          COUNT(CASE WHEN m.status = 'accepted' AND r.status = 'disputed' THEN 1 END) as unfulfilled_count
        FROM matches m
        LEFT JOIN requests r ON m.request_id = r.id
        WHERE m.agent_id::text IN (${client_1.Prisma.join(agentIds)})
        GROUP BY m.agent_id
      `;
            const ratingStatsRaw = await this.prisma.$queryRaw `
        SELECT
          m.agent_id,
          AVG(f.rating) as avg_rating
        FROM feedbacks f
        JOIN transactions t ON f.transaction_id = t.id
        JOIN matches m ON t.match_id = m.id
        WHERE m.agent_id::text IN (${client_1.Prisma.join(agentIds)})
          AND f.author_id != m.agent_id
        GROUP BY m.agent_id
      `;
            const matchStats = new Map(matchStatsRaw.map((s) => [s.agent_id, s]));
            const ratingStats = new Map(ratingStatsRaw.map((s) => [s.agent_id, s]));
            return profiles.map((profile) => {
                const mStats = matchStats.get(profile.id);
                const rStats = ratingStats.get(profile.id);
                const acceptedCount = Number(mStats?.accepted_count || 0);
                const rejectedCount = Number(mStats?.rejected_count || 0);
                const unfulfilledCount = Number(mStats?.unfulfilled_count || 0);
                const unfulfilledRate = acceptedCount > 0 ? (unfulfilledCount / acceptedCount) * 100 : 0;
                const avgRating = rStats?.avg_rating
                    ? parseFloat(rStats.avg_rating.toString())
                    : 0;
                return {
                    ...profile,
                    acceptedCount,
                    rejectedCount,
                    unfulfilledCount,
                    unfulfilledRate,
                    avgRating,
                };
            });
        }
        return profiles;
    }
    async getAvailablePackages() {
        return this.prisma.package.findMany({
            where: {
                name: { not: 'FREE' },
            },
            orderBy: { price: 'asc' },
        });
    }
    async assignZone(callerRole, agentId, zoneId, woreda) {
        const agent = await this.prisma.profile.findUnique({
            where: { id: agentId },
            include: { referralLink: true, agentZones: true },
        });
        if (!agent || agent.role !== client_1.UserRole.agent) {
            throw new common_1.NotFoundException('Agent not found');
        }
        if (!this.canModifyUser(callerRole, agent.role)) {
            throw new common_1.ForbiddenException('Insufficient privilege to modify this agent');
        }
        const tier = agent.tier || 'FREE';
        const zoneLimit = await this.getZoneLimit(tier);
        if (agent.agentZones.length >= zoneLimit) {
            throw new Error(`Agent tier "${tier}" is limited to ${zoneLimit} zones`);
        }
        return this.prisma.agentZone.create({
            data: { agentId, zoneId, woreda, kifleKetema: 'DEPRECATED' },
        });
    }
    async getZoneLimit(tier) {
        const pkg = await this.prisma.package.findUnique({
            where: { name: tier },
        });
        if (pkg)
            return pkg.zoneLimit;
        const fallbacks = {
            ABUNDANT_LIFE: 100,
            UNITY: 5,
            LOVE: 3,
            PEACE: 2,
        };
        return fallbacks[tier] || 1;
    }
    async updateTier(callerRole, agentId, tier) {
        const agent = await this.prisma.profile.findUnique({
            where: { id: agentId },
        });
        if (!agent)
            throw new common_1.NotFoundException('Agent profile not found');
        if (!this.canModifyUser(callerRole, agent.role)) {
            throw new common_1.ForbiddenException("Insufficient privilege to change this agent's tier");
        }
        return this.applyTierUpgrade(agentId, tier, 'ADMIN');
    }
    async purchasePackage(agentId, tier, paymentMethod = 'ETB') {
        const agent = await this.prisma.profile.findUnique({
            where: { id: agentId },
        });
        if (!agent)
            throw new common_1.NotFoundException('Agent profile not found');
        if (agent.role !== client_1.UserRole.agent) {
            throw new common_1.ForbiddenException('Only agents can purchase packages');
        }
        if ((!agent.tier || agent.tier === 'FREE') && paymentMethod === 'AGLP') {
            throw new common_1.BadRequestException('Initial package purchases must be made in ETB.');
        }
        return this.applyTierUpgrade(agentId, tier, paymentMethod);
    }
    async applyTierUpgrade(agentId, tier, paymentMethod = 'ETB', txOverride) {
        const tierEnum = tier.toUpperCase().replace(' ', '_');
        if (exports.TierPriority[tierEnum] === undefined) {
            throw new Error('Invalid tier name');
        }
        const pkg = await (txOverride || this.prisma).package.findUnique({
            where: { name: tierEnum },
        });
        if (!pkg) {
            throw new common_1.NotFoundException(`Package for tier "${tier}" not found in system.`);
        }
        const run = async (tx) => {
            if (pkg.price && Number(pkg.price) > 0 && paymentMethod !== 'ADMIN') {
                if (paymentMethod === 'ETB') {
                    await this.aglpService.depositEtb(tx, agentId, Number(pkg.price), pkg.id, 'PACKAGE_PURCHASE');
                    const agent = await tx.profile.findUnique({
                        where: { id: agentId },
                        select: { referredById: true, fullName: true },
                    });
                    if (agent?.referredById) {
                        const referralCommissionConfig = this.configService.get('AGLP_COMMISSION_PACKAGE_REFERRAL', { value: 0.1 });
                        const referralCommissionRate = referralCommissionConfig.value || 0.1;
                        const referralCommissionEtb = Number(pkg.price) * referralCommissionRate;
                        await this.aglpService.earnCommission(tx, agent.referredById, referralCommissionEtb, agentId, `Referral commission for package purchase (${tierEnum}) by ${agent.fullName}`);
                    }
                }
                else if (paymentMethod === 'AGLP') {
                    const rate = this.aglpService.getConversionRate();
                    const costAglp = Number(pkg.price) * rate;
                    await this.aglpService.spendAglpForPackage(tx, agentId, costAglp, pkg.id);
                }
            }
            await tx.profile.update({
                where: { id: agentId },
                data: { tier: tierEnum },
            });
            return tx.referralLink.upsert({
                where: { referrerId: agentId },
                update: { tier: tierEnum },
                create: {
                    referrerId: agentId,
                    code: `REF-${agentId.slice(0, 5)}`,
                    tier: tierEnum,
                },
            });
        };
        if (txOverride) {
            return run(txOverride);
        }
        else {
            return this.prisma.$transaction(run);
        }
    }
    async checkReferralEligibility(referrerId) {
        const referrer = await this.prisma.profile.findUnique({
            where: { id: referrerId },
            include: {
                referralLink: true,
                referrals: true,
            },
        });
        if (!referrer)
            throw new common_1.NotFoundException('Referrer not found');
        const tier = referrer.tier || 'FREE';
        const limit = await this.getReferralLimit(tier);
        if (referrer.referrals.length >= limit) {
            throw new Error(`Referrer tier "${tier}" is limited to ${limit} referral slots`);
        }
        return true;
    }
    async getReferralLimit(tier) {
        const pkg = await this.prisma.package.findUnique({
            where: { name: tier },
        });
        if (pkg)
            return pkg.referralSlots;
        const fallbacks = {
            ABUNDANT_LIFE: 31,
            UNITY: 23,
            LOVE: 16,
            PEACE: 7,
        };
        return fallbacks[tier] || 3;
    }
    async suspendUser(callerRole, userId) {
        const user = await this.prisma.profile.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!this.canModifyUser(callerRole, user.role)) {
            throw new common_1.ForbiddenException(`Role "${callerRole}" cannot suspend role "${user.role}"`);
        }
        const result = await this.prisma.profile.update({
            where: { id: userId },
            data: { isActive: false },
        });
        this.notificationsGateway.sendToUser(userId, 'force_logout', {
            reason: 'Your account has been suspended by an administrator.',
        });
        return result;
    }
    async requestWithdrawal(userId, amountAglp, bankDetails) {
        if (amountAglp <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        const agent = await this.prisma.profile.findUnique({
            where: { id: userId },
            select: { fullName: true, phone: true },
        });
        const result = await this.prisma.$transaction(async (tx) => {
            return this.aglpService.withdrawAglp(tx, userId, amountAglp, bankDetails);
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        this.notificationsGateway.sendToRole('financial_operator', 'notification', {
            type: 'payout.requested',
            title: 'New Payout Request',
            message: `${agent?.fullName || 'An agent'} has requested a withdrawal of ${amountAglp.toLocaleString()} AGLP.`,
            agentName: agent?.fullName,
            agentPhone: agent?.phone,
            amount: amountAglp,
            bankName: bankDetails.bankName,
            bankAccountNumber: bankDetails.bankAccountNumber,
            bankAccountHolder: bankDetails.bankAccountHolder,
            read: false,
            createdAt: new Date().toISOString(),
            id: result.id,
        });
        return result;
    }
    async activateUser(callerRole, userId) {
        const user = await this.prisma.profile.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!this.canModifyUser(callerRole, user.role)) {
            throw new common_1.ForbiddenException(`Role "${callerRole}" cannot activate role "${user.role}"`);
        }
        return this.prisma.profile.update({
            where: { id: userId },
            data: { isActive: true },
        });
    }
    async generateReferralCode(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        if (profile.role !== client_1.UserRole.agent) {
            throw new common_1.ForbiddenException('Only agents can generate referral codes');
        }
        if (profile.referralCode) {
            const link = `${process.env.APP_URL || 'https://erkata.app'}/register?ref=${profile.referralCode}`;
            return { code: profile.referralCode, link };
        }
        let code;
        let isUnique = false;
        let attempts = 0;
        do {
            code = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existing = await this.prisma.profile.findUnique({
                where: { referralCode: code },
            });
            isUnique = !existing;
            attempts++;
        } while (!isUnique && attempts < 10);
        if (!isUnique) {
            throw new common_1.ConflictException('Could not generate a unique code. Please try again.');
        }
        await this.prisma.profile.update({
            where: { id: userId },
            data: { referralCode: code },
        });
        const link = `${process.env.APP_URL || 'https://erkata.app'}/register?ref=${code}`;
        return { code, link };
    }
    async updateBusinessProfile(userId, data) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        if (profile.role !== client_1.UserRole.agent) {
            throw new common_1.ForbiddenException('Only agents can update business verification details');
        }
        return this.prisma.profile.update({
            where: { id: userId },
            data: {
                tinNumber: data.tinNumber,
                tradeLicenseNumber: data.tradeLicenseNumber,
            },
        });
    }
    async updateProfile(userId, data) {
        if (!data.fullName && !data.phone) {
            throw new common_1.BadRequestException('At least one field (fullName or phone) must be provided.');
        }
        const updateData = {};
        if (data.fullName)
            updateData.fullName = data.fullName.trim();
        if (data.phone)
            updateData.phone = this.sanitizePhone(data.phone);
        const updated = await this.prisma.profile.update({
            where: { id: userId },
            data: updateData,
            select: { fullName: true, phone: true, email: true, avatarUrl: true },
        });
        return updated;
    }
    sanitizePhone(phone) {
        if (!phone)
            return '';
        const match = phone.match(/^(?:\+251|251|0)?([79]\d{8})$/);
        if (match)
            return `+251${match[1]}`;
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 9) {
            const core = digits.slice(-9);
            if (core.startsWith('9') || core.startsWith('7'))
                return `+251${core}`;
        }
        return phone.startsWith('+') ? phone : `+${digits}`;
    }
    async changePassword(userId, dto) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
            select: { passwordHash: true, email: true, role: true, tier: true },
        });
        if (!profile?.passwordHash) {
            throw new common_1.UnauthorizedException('Account is not password-authenticated.');
        }
        const isMatch = await bcrypt.compare(dto.currentPassword, profile.passwordHash);
        if (!isMatch) {
            throw new common_1.ForbiddenException('Current password is incorrect.');
        }
        const isSame = await bcrypt.compare(dto.newPassword, profile.passwordHash);
        if (isSame) {
            throw new common_1.BadRequestException('New password must be different from the current password.');
        }
        const newHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.profile.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });
        const accessToken = this.jwtService.sign({
            sub: userId,
            email: profile.email,
            role: profile.role,
            tier: profile.tier,
            tokenType: 'access',
        });
        return { accessToken };
    }
    async updateAvatar(userId, avatarUrl) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
            select: { avatarUrl: true },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        if (profile.avatarUrl) {
            const oldFileName = (0, path_1.basename)(profile.avatarUrl);
            const oldPath = (0, path_1.join)(process.cwd(), 'uploads', oldFileName);
            try {
                await (0, promises_1.unlink)(oldPath);
            }
            catch {
            }
        }
        const updated = await this.prisma.profile.update({
            where: { id: userId },
            data: { avatarUrl },
            select: { avatarUrl: true },
        });
        return updated;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        aglp_service_1.AglpService,
        config_service_1.ConfigService,
        notifications_gateway_1.NotificationsGateway,
        jwt_1.JwtService])
], UsersService);
//# sourceMappingURL=users.service.js.map