import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';
import { UserRole, FeedbackBundleState } from '@prisma/client';

@Controller('admin/analytics')
@UseGuards(RolesGuard)
export default class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Get('summary')
  @RequirePermission(Action.VIEW_SYSTEM_STATISTICS)
  async getSummary() {
    const [
      totalUsers,
      totalRequests,
      totalTransactions,
      totalBundles,
      totalFinalized,
      agentCount,
      operatorCount,
    ] = await Promise.all([
      this.prisma.profile.count(),
      this.prisma.request.count(),
      this.prisma.transaction.count(),
      this.prisma.feedbackBundle.count(),
      this.prisma.feedbackBundle.count({
        where: { state: FeedbackBundleState.RESOLVED },
      }),
      this.prisma.profile.count({ where: { role: UserRole.agent } }),
      this.prisma.profile.count({ where: { role: UserRole.operator } }),
    ]);

    // Calculate resolution rate
    const resolutionRate =
      totalBundles > 0 ? (totalFinalized / totalBundles) * 100 : 0;

    return {
      totalUsers,
      totalRequests,
      totalTransactions,
      totalBundles,
      totalFinalized,
      agentCount,
      operatorCount,
      resolutionRate: resolutionRate.toFixed(1) + '%',
      platformVolume: '0 ETB',
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
