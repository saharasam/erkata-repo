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
exports.UsersService = exports.TierPriority = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const config_service_1 = require("../common/config.service");
const aglp_service_1 = require("../aglp/aglp.service");
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
    constructor(prisma, aglpService, configService) {
        this.prisma = prisma;
        this.aglpService = aglpService;
        this.configService = configService;
    }
    async getCurrentProfile(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
            include: {
                agentZones: true,
                referralLink: true,
                referrals: {
                    select: {
                        id: true,
                        fullName: true,
                        createdAt: true,
                        role: true,
                    },
                },
            },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        return profile;
    }
    async getFinanceSummary(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: userId },
            select: {
                aglpBalance: true,
                aglpPending: true,
                aglpWithdrawn: true,
                tier: true,
                referrals: { select: { id: true } },
                referralLink: { select: { tier: true } },
                agentZones: { select: { id: true } },
            },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const tier = profile.tier || 'FREE';
        const totalSlots = this.getReferralLimit(tier);
        const usedSlots = profile.referrals.length;
        const usedZones = profile.agentZones?.length || 0;
        const totalZones = this.getZoneLimit(tier);
        const tiers = Object.keys(exports.TierPriority).sort((a, b) => exports.TierPriority[a] - exports.TierPriority[b]);
        const currentTierIndex = tiers.indexOf(tier);
        const nextTier = currentTierIndex !== -1 && currentTierIndex < tiers.length - 1
            ? tiers[currentTierIndex + 1]
            : 'Maximum Tier';
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
            const metadata = log.metadata;
            const type = log.action.includes('REFERRAL')
                ? 'Referral'
                : log.action.includes('PACKAGE')
                    ? 'Package'
                    : 'Commission';
            const rawAmount = metadata?.amount ?? metadata?.amountAglp ?? '0';
            return {
                id: log.id,
                action: log.action,
                amount: rawAmount.toString(),
                type,
                date: log.createdAt,
                description: metadata?.reason || log.action,
            };
        });
        return {
            balance: profile.aglpBalance.toString(),
            aglpAvailable: profile.aglpBalance.toString(),
            aglpPending: profile.aglpPending.toString(),
            aglpWithdrawn: profile.aglpWithdrawn.toString(),
            usedSlots,
            totalSlots,
            usedZones,
            totalZones,
            currentTier: tier.replace('_', ' '),
            nextTier,
            history: formattedHistory,
        };
    }
    canModifyUser(callerRole, targetRole) {
        if (callerRole === client_1.UserRole.super_admin)
            return true;
        if (callerRole === client_1.UserRole.admin) {
            const targetRoles = [client_1.UserRole.operator, client_1.UserRole.agent];
            return targetRoles.includes(targetRole);
        }
        return false;
    }
    getScopeFilter(userId, role) {
        if (role === client_1.UserRole.super_admin)
            return {};
        if (role === client_1.UserRole.admin) {
            return {
                role: { in: [client_1.UserRole.operator, client_1.UserRole.agent, client_1.UserRole.customer] },
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
    async findAll(callerRole, filters) {
        if (callerRole !== client_1.UserRole.admin && callerRole !== client_1.UserRole.super_admin) {
            throw new common_1.ForbiddenException('Only admins can list all users');
        }
        return this.prisma.profile.findMany({
            where: {
                role: filters.role,
                isActive: filters.isActive,
            },
            include: {
                referralLink: true,
                agentZones: {
                    include: {
                        zone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
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
        const zoneLimit = this.getZoneLimit(tier);
        if (agent.agentZones.length >= zoneLimit) {
            throw new Error(`Agent tier "${tier}" is limited to ${zoneLimit} zones`);
        }
        return this.prisma.agentZone.create({
            data: { agentId, zoneId, woreda, kifleKetema: 'DEPRECATED' },
        });
    }
    getZoneLimit(tier) {
        switch (tier) {
            case 'ABUNDANT_LIFE':
                return 100;
            case 'UNITY':
                return 5;
            case 'LOVE':
                return 3;
            case 'PEACE':
                return 2;
            default:
                return 1;
        }
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
    async applyTierUpgrade(agentId, tier, paymentMethod = 'ETB') {
        const tierEnum = tier.toUpperCase().replace(' ', '_');
        if (exports.TierPriority[tierEnum] === undefined) {
            throw new Error('Invalid tier name');
        }
        const pkg = await this.prisma.package.findUnique({
            where: { name: tierEnum },
        });
        if (!pkg) {
            throw new common_1.NotFoundException(`Package for tier "${tier}" not found in system.`);
        }
        return this.prisma.$transaction(async (tx) => {
            if (pkg.price && Number(pkg.price) > 0 && paymentMethod !== 'ADMIN') {
                if (paymentMethod === 'ETB') {
                    await this.aglpService.depositEtb(tx, agentId, Number(pkg.price), pkg.id, 'PACKAGE_PURCHASE');
                    const agent = await tx.profile.findUnique({
                        where: { id: agentId },
                        select: { referredById: true, fullName: true },
                    });
                    if (agent?.referredById) {
                        const referralCommissionRate = 0.1;
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
        });
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
        const limit = this.getReferralLimit(tier);
        if (referrer.referrals.length >= limit) {
            throw new Error(`Referrer tier "${tier}" is limited to ${limit} referral slots`);
        }
        return true;
    }
    getReferralLimit(tier) {
        switch (tier) {
            case 'ABUNDANT_LIFE':
                return 31;
            case 'UNITY':
                return 23;
            case 'LOVE':
                return 16;
            case 'PEACE':
                return 7;
            default:
                return 3;
        }
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
        return this.prisma.profile.update({
            where: { id: userId },
            data: { isActive: false },
        });
    }
    async requestWithdrawal(userId, amountAglp) {
        if (amountAglp <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        return this.prisma.$transaction(async (tx) => {
            return this.aglpService.withdrawAglp(tx, userId, amountAglp);
        });
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
    async findByReferralCode(code) {
        const referrer = await this.prisma.profile.findUnique({
            where: { referralCode: code },
            include: { referralLink: true, referrals: { select: { id: true } } },
        });
        if (!referrer)
            throw new common_1.BadRequestException('Invalid referral code');
        return referrer;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        aglp_service_1.AglpService,
        config_service_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map