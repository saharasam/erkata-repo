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
    async getSummary() {
        const [totalUsers, totalRequests, totalTransactions, totalBundles, totalFinalized, agentCount, operatorCount,] = await Promise.all([
            this.prisma.profile.count(),
            this.prisma.request.count(),
            this.prisma.transaction.count(),
            this.prisma.feedbackBundle.count(),
            this.prisma.feedbackBundle.count({
                where: { state: client_1.FeedbackBundleState.RESOLVED },
            }),
            this.prisma.profile.count({ where: { role: client_1.UserRole.agent } }),
            this.prisma.profile.count({ where: { role: client_1.UserRole.operator } }),
        ]);
        const resolutionRate = totalBundles > 0 ? (totalFinalized / totalBundles) * 100 : 0;
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
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
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsController);
exports.default = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map