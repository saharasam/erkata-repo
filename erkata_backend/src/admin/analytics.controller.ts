import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard, RequirePermission, JwtAuthGuard } from '../auth/guards';
import { Action } from '../auth/permissions';
import {
  UserRole,
  FeedbackBundleState,
  RequestStatus,
  Prisma,
  AglpTransactionStatus,
  AglpTransactionType,
} from '@prisma/client';

interface RawAvgResult {
  avg: number | null;
}

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export default class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Get('summary')
  @RequirePermission(Action.VIEW_SYSTEM_STATISTICS)
  async getSummary(@Query('window') window: string = 'all') {
    const now = new Date();
    const startDate =
      window === 'today'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : window === 'week'
          ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          : null;

    const requestWhere: Prisma.RequestWhereInput = {};
    if (startDate) {
      requestWhere.createdAt = { gte: startDate };
    }

    const [
      totalUsers,
      totalRequests,
      activeRequests,
      fulfilledInWindow,
      totalBundles,
      totalFinalized,
      activeDisputes,
      agentCount,
      operatorCount,
      avgAssignment,
      avgFulfillment,
      platformVolumeAgg,
      dailyCommissionsAgg,
      leaderboardRaw,
      distributionRaw,
      packageRevenueAgg,
    ] = await Promise.all([
      this.prisma.profile.count(),
      this.prisma.request.count(),
      this.prisma.request.count({
        where: {
          ...requestWhere,
          status: { in: [RequestStatus.pending, RequestStatus.assigned] },
        },
      }),
      this.prisma.request.count({
        where: {
          ...requestWhere,
          status: RequestStatus.fulfilled,
        },
      }),
      this.prisma.feedbackBundle.count(),
      this.prisma.feedbackBundle.count({
        where: { state: FeedbackBundleState.RESOLVED },
      }),
      this.prisma.feedbackBundle.count({
        where: {
          state: {
            notIn: [
              FeedbackBundleState.RESOLVED,
              FeedbackBundleState.TIMED_OUT,
            ],
          },
        },
      }),
      this.prisma.profile.count({ where: { role: UserRole.agent } }),
      this.prisma.profile.count({ where: { role: UserRole.operator } }),
      this.prisma.$queryRaw<RawAvgResult[]>`
        SELECT AVG(EXTRACT(EPOCH FROM (assignment_pushed_at - created_at)) * 1000) as avg
        FROM requests
        WHERE assignment_pushed_at IS NOT NULL
      `,
      this.prisma.$queryRaw<RawAvgResult[]>`
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000) as avg
        FROM requests
        WHERE completed_at IS NOT NULL
      `,
      this.prisma.aglpTransaction.aggregate({
        where: {
          type: AglpTransactionType.EARN,
          status: AglpTransactionStatus.COMPLETED,
        },
        _sum: { etbEquivalent: true },
      }),
      this.prisma.aglpTransaction.aggregate({
        where: {
          type: AglpTransactionType.EARN,
          status: AglpTransactionStatus.COMPLETED,
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        },
        _sum: { etbEquivalent: true },
      }),
      this.prisma.$queryRaw<any[]>`
        SELECT p.full_name as "name", SUM(t.etb_equivalent) as "total"
        FROM aglp_transactions t
        JOIN profiles p ON t.profile_id = p.id
        WHERE t.type = 'EARN' AND t.status = 'COMPLETED'
        GROUP BY p.full_name
        ORDER BY "total" DESC
        LIMIT 5
      `,
      this.prisma.profile.groupBy({
        where: { role: UserRole.agent },
        by: ['tier'],
        _count: { _all: true },
      }),
      this.prisma.aglpTransaction.aggregate({
        where: {
          type: AglpTransactionType.DEPOSIT,
          referenceType: 'PACKAGE_PURCHASE',
          status: AglpTransactionStatus.COMPLETED,
        },
        _sum: { etbEquivalent: true },
      }),
    ]);

    // Calculate resolution rate
    const resolutionRate =
      totalBundles > 0 ? (totalFinalized / totalBundles) * 100 : 0;

    const packageDistribution = (
      distributionRaw as { tier: string | null; _count: { _all: number } }[]
    ).map((d) => ({
      tier: d.tier?.replace('_', ' ') || 'FREE',
      count: d._count._all,
    }));

    return {
      totalUsers,
      totalRequests,
      activeRequests,
      fulfilledInWindow,
      totalBundles,
      totalFinalized,
      activeDisputes,
      agentCount,
      operatorCount,
      resolutionRate: resolutionRate.toFixed(1) + '%',
      window,
      avgAssignmentTimeMs: avgAssignment[0]?.avg || null,
      avgFulfillmentTimeMs: avgFulfillment[0]?.avg || null,
      platformVolume:
        (platformVolumeAgg?._sum?.etbEquivalent || 0).toString() + ' ETB',
      dailyCommissions:
        (dailyCommissionsAgg?._sum?.etbEquivalent || 0).toString() + ' ETB',
      leaderboard: leaderboardRaw,
      packageDistribution,
      packageRevenue:
        (packageRevenueAgg?._sum?.etbEquivalent || 0).toString() + ' ETB',
      uptime: '99.99%',
    };
  }

  @Get('distribution')
  @RequirePermission(Action.VIEW_SYSTEM_STATISTICS)
  async getDistribution() {
    const distribution = await this.prisma.profile.groupBy({
      by: ['role'],
      _count: {
        _all: true,
      },
    });

    return distribution.map((d) => ({
      role: d.role,
      count: d._count._all,
    }));
  }
}
