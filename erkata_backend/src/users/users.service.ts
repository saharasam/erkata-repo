import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma, Tier } from '@prisma/client';

export const TierPriority: Record<string, number> = {
  'Abundant Life': 5,
  Unity: 4,
  Love: 3,
  Peace: 2,
  Free: 1,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getCurrentProfile(userId: string) {
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

    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async getFinanceSummary(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: {
        walletBalance: true,
        tier: true,
        referrals: { select: { id: true } },
        referralLink: { select: { tier: true } },
      },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const tier = profile.referralLink?.tier || profile.tier || 'FREE';
    const totalSlots = this.getReferralLimit(tier);
    const usedSlots = profile.referrals.length;

    const tiers = Object.keys(TierPriority);
    const currentTierIndex = tiers.indexOf(
      tier.charAt(0) + tier.slice(1).toLowerCase().replace('_', ' '),
    );
    const nextTier =
      currentTierIndex !== -1 && currentTierIndex < tiers.length - 1
        ? tiers[currentTierIndex + 1]
        : 'Maximum Tier';

    // Fetch audit logs related to commissions and payouts for this user
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

    // Format history for the UI
    const formattedHistory = history.map((log) => {
      const metadata = log.metadata as {
        amount?: string | number;
        reason?: string;
      } | null;

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

  /**
   * ENFORCEMENT: Write/Destructive Actions Guard
   * Prevents roles from modifying those above or at their same level.
   * Admin can only affect Operators and Agents.
   */
  canModifyUser(callerRole: UserRole, targetRole: UserRole): boolean {
    if (callerRole === UserRole.super_admin) return true;
    if (callerRole === UserRole.admin) {
      // Admin cannot target Super Admin or other Admins
      const targetRoles: UserRole[] = [UserRole.operator, UserRole.agent];
      return targetRoles.includes(targetRole);
    }
    // Operators, Agents, and Customers have zero write authority over others
    return false;
  }

  /**
   * ENFORCEMENT: Hierarchy-aware Scope Filtering
   * Generates a Prisma 'where' clause based on the caller's role and scope.
   */
  getScopeFilter(userId: string, role: UserRole): Prisma.ProfileWhereInput {
    if (role === UserRole.super_admin) return {};

    if (role === UserRole.admin) {
      // Admin sees Operators/Agents (could be filtered by region if managedBy exists)
      return {
        role: { in: [UserRole.operator, UserRole.agent, UserRole.customer] },
      };
    }

    if (role === UserRole.operator) {
      // Operator sees parties in their mediated transactions
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

    // Agent & Customer only see themselves
    return { id: userId };
  }

  async findAll(
    callerRole: UserRole,
    filters: { role?: UserRole; isActive?: boolean },
  ) {
    if (callerRole !== UserRole.admin && callerRole !== UserRole.super_admin) {
      throw new ForbiddenException('Only admins can list all users');
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

  async assignZone(
    callerRole: UserRole,
    agentId: string,
    zoneId: string,
    woreda: string,
  ) {
    const agent = await this.prisma.profile.findUnique({
      where: { id: agentId },
      include: { referralLink: true, agentZones: true },
    });

    if (!agent || agent.role !== UserRole.agent) {
      throw new NotFoundException('Agent not found');
    }

    // CHECK: Permission to modify this agent
    if (!this.canModifyUser(callerRole, agent.role)) {
      throw new ForbiddenException(
        'Insufficient privilege to modify this agent',
      );
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

  private getZoneLimit(tier: string): number {
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

  async updateTier(callerRole: UserRole, agentId: string, tier: string) {
    const agent = await this.prisma.profile.findUnique({
      where: { id: agentId },
    });
    if (!agent) throw new NotFoundException('Agent profile not found');

    // CHECK: Permission to modify this agent
    if (!this.canModifyUser(callerRole, agent.role)) {
      throw new ForbiddenException(
        "Insufficient privilege to change this agent's tier",
      );
    }

    const tierEnum = tier.toUpperCase().replace(' ', '_') as Tier;
    if (!TierPriority[tier]) throw new Error('Invalid tier name');

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

  async checkReferralEligibility(referrerId: string) {
    const referrer = await this.prisma.profile.findUnique({
      where: { id: referrerId },
      include: {
        referralLink: true,
        referrals: true,
      },
    });

    if (!referrer) throw new NotFoundException('Referrer not found');

    const tier = referrer.referralLink?.tier || 'FREE';
    const limit = this.getReferralLimit(tier);

    if (referrer.referrals.length >= limit) {
      throw new Error(
        `Referrer tier "${tier}" is limited to ${limit} referral slots`,
      );
    }

    return true;
  }

  private getReferralLimit(tier: string): number {
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

  async suspendUser(callerRole: UserRole, userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    if (!this.canModifyUser(callerRole, user.role)) {
      throw new ForbiddenException(
        `Role "${callerRole}" cannot suspend role "${user.role}"`,
      );
    }

    return this.prisma.profile.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async activateUser(callerRole: UserRole, userId: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    if (!this.canModifyUser(callerRole, user.role)) {
      throw new ForbiddenException(
        `Role "${callerRole}" cannot activate role "${user.role}"`,
      );
    }

    return this.prisma.profile.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }
}
