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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
const client_1 = require("@prisma/client");
let AnalyticsController = class AnalyticsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(window = 'all') {
        const now = new Date();
        const startDate = window === 'today'
            ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
            : window === 'week'
                ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                : null;
        const requestWhere = {};
        if (startDate) {
            requestWhere.createdAt = { gte: startDate };
        }
        const [totalUsers, totalRequests, activeRequests, fulfilledInWindow, totalBundles, totalFinalized, activeDisputes, agentCount, operatorCount, avgAssignment, avgFulfillment, platformVolumeAgg, dailyCommissionsAgg, leaderboardRaw,] = await Promise.all([
            this.prisma.profile.count(),
            this.prisma.request.count(),
            this.prisma.request.count({
                where: {
                    ...requestWhere,
                    status: { in: [client_1.RequestStatus.pending, client_1.RequestStatus.assigned] },
                },
            }),
            this.prisma.request.count({
                where: {
                    ...requestWhere,
                    status: client_1.RequestStatus.fulfilled,
                },
            }),
            this.prisma.feedbackBundle.count(),
            this.prisma.feedbackBundle.count({
                where: { state: client_1.FeedbackBundleState.RESOLVED },
            }),
            this.prisma.feedbackBundle.count({
                where: {
                    state: {
                        notIn: [
                            client_1.FeedbackBundleState.RESOLVED,
                            client_1.FeedbackBundleState.TIMED_OUT,
                        ],
                    },
                },
            }),
            this.prisma.profile.count({ where: { role: client_1.UserRole.agent } }),
            this.prisma.profile.count({ where: { role: client_1.UserRole.operator } }),
            this.prisma.$queryRaw `
        SELECT AVG(EXTRACT(EPOCH FROM (assignment_pushed_at - created_at)) * 1000) as avg
        FROM requests
        WHERE assignment_pushed_at IS NOT NULL
      `,
            this.prisma.$queryRaw `
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000) as avg
        FROM requests
        WHERE completed_at IS NOT NULL
      `,
            this.prisma.aglpTransaction.aggregate({
                where: {
                    type: client_1.AglpTransactionType.EARN,
                    status: client_1.AglpTransactionStatus.COMPLETED,
                },
                _sum: { etbEquivalent: true },
            }),
            this.prisma.aglpTransaction.aggregate({
                where: {
                    type: client_1.AglpTransactionType.EARN,
                    status: client_1.AglpTransactionStatus.COMPLETED,
                    createdAt: {
                        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                    },
                },
                _sum: { etbEquivalent: true },
            }),
            this.prisma.$queryRaw `
        SELECT p.full_name as "name", SUM(t.etb_equivalent) as "total"
        FROM aglp_transactions t
        JOIN profiles p ON t.profile_id = p.id
        WHERE t.type = 'EARN' AND t.status = 'COMPLETED'
        GROUP BY p.full_name
        ORDER BY "total" DESC
        LIMIT 5
      `,
        ]);
        const resolutionRate = totalBundles > 0 ? (totalFinalized / totalBundles) * 100 : 0;
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
            platformVolume: (platformVolumeAgg?._sum?.etbEquivalent || 0).toString() + ' ETB',
            dailyCommissions: (dailyCommissionsAgg?._sum?.etbEquivalent || 0).toString() + ' ETB',
            leaderboard: leaderboardRaw,
            uptime: '99.99%',
        };
    }
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
};
__decorate([
    (0, common_1.Get)('summary'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_SYSTEM_STATISTICS),
    __param(0, (0, common_1.Query)('window')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('distribution'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_SYSTEM_STATISTICS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDistribution", null);
AnalyticsController = __decorate([
    (0, common_1.Controller)('admin/analytics'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsController);
exports.default = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map