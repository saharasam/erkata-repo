import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma, Tier } from '@prisma/client';
import { ConfigService } from '../common/config.service';
import { AglpService } from '../aglp/aglp.service';

export const TierPriority: Record<string, number> = {
  ABUNDANT_LIFE: 5,
  UNITY: 4,
  LOVE: 3,
  PEACE: 2,
  FREE: 1,
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aglpService: AglpService,
    private readonly configService: ConfigService,
  ) {}

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
        aglpBalance: true,
        aglpPending: true,
        aglpWithdrawn: true,
        tier: true,
        referrals: { select: { id: true } },
        referralLink: { select: { tier: true } },
        agentZones: { select: { id: true } },
      },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const tier = profile.tier || 'FREE';
    const totalSlots = this.getReferralLimit(tier);
    const usedSlots = profile.referrals.length;

    const usedZones = profile.agentZones?.length || 0;
    const totalZones = this.getZoneLimit(tier);

    const tiers = Object.keys(TierPriority).sort(
      (a, b) => TierPriority[a] - TierPriority[b],
    );
    const currentTierIndex = tiers.indexOf(tier);
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
            'PACKAGE_REWARD_EARNED',
            'PACKAGE_UPGRADE_SPENT',
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
        amountAglp?: string | number;
        reason?: string;
      } | null;

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
      balance: profile.aglpBalance.toString(), // Kept for backwards compatibility temporarily
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

    const tier = agent.tier || 'FREE';
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

    return this.applyTierUpgrade(agentId, tier, 'ADMIN');
  }

  async purchasePackage(
    agentId: string,
    tier: string,
    paymentMethod: 'ETB' | 'AGLP' = 'ETB',
  ) {
    const agent = await this.prisma.profile.findUnique({
      where: { id: agentId },
    });
    if (!agent) throw new NotFoundException('Agent profile not found');
    if (agent.role !== UserRole.agent) {
      throw new ForbiddenException('Only agents can purchase packages');
    }

    if ((!agent.tier || agent.tier === 'FREE') && paymentMethod === 'AGLP') {
      throw new BadRequestException(
        'Initial package purchases must be made in ETB.',
      );
    }

    return this.applyTierUpgrade(agentId, tier, paymentMethod);
  }

  private async applyTierUpgrade(
    agentId: string,
    tier: string,
    paymentMethod: 'ETB' | 'AGLP' | 'ADMIN' = 'ETB',
  ) {
    const tierEnum = tier.toUpperCase().replace(' ', '_') as Tier;
    if (TierPriority[tierEnum] === undefined) {
      throw new Error('Invalid tier name');
    }

    // Fetch the package price
    const pkg = await this.prisma.package.findUnique({
      where: { name: tierEnum },
    });

    if (!pkg) {
      throw new NotFoundException(
        `Package for tier "${tier}" not found in system.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (pkg.price && Number(pkg.price) > 0 && paymentMethod !== 'ADMIN') {
        if (paymentMethod === 'ETB') {
          // Explicit cash purchase: Agent deposits ETB and gets the equivalent AGLP as a reward.
          await this.aglpService.depositEtb(
            tx,
            agentId,
            Number(pkg.price),
            pkg.id,
            'PACKAGE_PURCHASE',
          );

          // AWARD REFERRAL COMMISSION IF APPLICABLE (10%)
          const agent = await tx.profile.findUnique({
            where: { id: agentId },
            select: { referredById: true, fullName: true },
          });

          if (agent?.referredById) {
            const referralCommissionRate = 0.1; // 10%
            const referralCommissionEtb =
              Number(pkg.price) * referralCommissionRate;

            await this.aglpService.earnCommission(
              tx,
              agent.referredById,
              referralCommissionEtb,
              agentId, // referenceId is the buyer's ID
              `Referral commission for package purchase (${tierEnum}) by ${agent.fullName}`,
            );
          }
        } else if (paymentMethod === 'AGLP') {
          // Agent is using their existing AGLP to upgrade.
          const rate = this.aglpService.getConversionRate();
          const costAglp = Number(pkg.price) * rate;

          await this.aglpService.spendAglpForPackage(
            tx,
            agentId,
            costAglp,
            pkg.id,
          );
        }
      }

      // Synchronize Profile tier
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

  async checkReferralEligibility(referrerId: string) {
    const referrer = await this.prisma.profile.findUnique({
      where: { id: referrerId },
      include: {
        referralLink: true,
        referrals: true,
      },
    });

    if (!referrer) throw new NotFoundException('Referrer not found');

    const tier = referrer.tier || 'FREE';
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

  async requestWithdrawal(userId: string, amountAglp: number) {
    if (amountAglp <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      return this.aglpService.withdrawAglp(tx, userId, amountAglp);
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

  /**
   * Generates a unique referral code for the calling agent.
   * The code can be triggered on-demand from the Agent Dashboard.
   */
  async generateReferralCode(
    userId: string,
  ): Promise<{ code: string; link: string }> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.role !== UserRole.agent) {
      throw new ForbiddenException('Only agents can generate referral codes');
    }
    if (profile.referralCode) {
      // Re-return the existing code if already generated
      const link = `${process.env.APP_URL || 'https://erkata.app'}/register?ref=${profile.referralCode}`;
      return { code: profile.referralCode, link };
    }

    // Generate a unique 8-char alphanumeric code
    let code: string;
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
      throw new ConflictException(
        'Could not generate a unique code. Please try again.',
      );
    }

    await this.prisma.profile.update({
      where: { id: userId },
      data: { referralCode: code },
    });

    const link = `${process.env.APP_URL || 'https://erkata.app'}/register?ref=${code}`;
    return { code, link };
  }

  /**
   * Looks up a referrer by their referral code.
   * Used during registration to attribute new users.
   */
  async findByReferralCode(code: string) {
    const referrer = await this.prisma.profile.findUnique({
      where: { referralCode: code },
      include: { referralLink: true, referrals: { select: { id: true } } },
    });
    if (!referrer) throw new BadRequestException('Invalid referral code');
    return referrer;
  }
}
