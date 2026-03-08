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
exports.TierPriority = {
    'Abundant Life': 5,
    Unity: 4,
    Love: 3,
    Peace: 2,
    Free: 1,
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
                walletBalance: true,
                tier: true,
                referrals: { select: { id: true } },
                referralLink: { select: { tier: true } },
            },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const tier = profile.referralLink?.tier || profile.tier || 'FREE';
        const totalSlots = this.getReferralLimit(tier);
        const usedSlots = profile.referrals.length;
        const tiers = Object.keys(exports.TierPriority);
        const currentTierIndex = tiers.indexOf(tier.charAt(0) + tier.slice(1).toLowerCase().replace('_', ' '));
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
                    ],
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const formattedHistory = history.map((log) => {
            const metadata = log.metadata;
            return {
                id: log.id,
                action: log.action,
                amount: metadata?.amount?.toString() || '0',
                type: log.action.includes('REFERRAL') ? 'Referral' : 'Commission',
                date: log.createdAt,
                description: metadata?.reason || log.action,
            };
        });
        return {
            balance: profile.walletBalance.toString(),
            usedSlots,
            totalSlots,
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
        const tier = agent.referralLink?.tier || 'FREE';
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
        const tierEnum = tier.toUpperCase().replace(' ', '_');
        if (!exports.TierPriority[tier])
            throw new Error('Invalid tier name');
        return this.prisma.referralLink.upsert({
            where: { referrerId: agentId },
            update: { tier: tierEnum },
            create: {
                referrerId: agentId,
                code: `REF-${agentId.slice(0, 5)}`,
                tier: tierEnum,
            },
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
        const tier = referrer.referralLink?.tier || 'FREE';
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map