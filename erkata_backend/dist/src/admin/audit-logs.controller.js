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
exports.AuditLogsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
let AuditLogsController = class AuditLogsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAuditLogs(limit = 50, offset = 0, action) {
        const logs = await this.prisma.auditLog.findMany({
            where: action ? { action } : {},
            take: Number(limit),
            skip: Number(offset),
            orderBy: { createdAt: 'desc' },
            include: {
                actor: {
                    select: {
                        fullName: true,
                        role: true,
                    },
                },
            },
        });
        return logs.map((log) => ({
            ...log,
            entityType: log.targetTable,
            entityId: log.targetId,
        }));
    }
};
exports.AuditLogsController = AuditLogsController;
__decorate([
    (0, common_1.Get)(),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_FULL_AUDIT_LOGS),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuditLogsController.prototype, "getAuditLogs", null);
exports.AuditLogsController = AuditLogsController = __decorate([
    (0, common_1.Controller)('admin/audit-logs'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogsController);
//# sourceMappingURL=audit-logs.controller.js.map