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
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
let SystemBroadcastsController = class SystemBroadcastsController {
    prisma;
    notificationsGateway;
    notificationsService;
    constructor(prisma, notificationsGateway, notificationsService) {
        this.prisma = prisma;
        this.notificationsGateway = notificationsGateway;
        this.notificationsService = notificationsService;
    }
    async getBroadcasts(req) {
        const user = req.user;
        if (user.role === 'super_admin') {
            return await this.prisma.systemBroadcast.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }
        const allowedTargets = ['EVERYONE'];
        if (user.role === 'admin')
            allowedTargets.push('ADMIN');
        if (user.role === 'operator')
            allowedTargets.push('OPERATOR');
        if (user.role === 'agent')
            allowedTargets.push('AGENT');
        return await this.prisma.systemBroadcast.findMany({
            where: {
                target: { in: allowedTargets },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createBroadcast(data) {
        const broadcast = await this.prisma.systemBroadcast.create({
            data: {
                title: data.title,
                content: data.content,
                target: data.target,
            },
        });
        const userWhere = {};
        if (data.target === 'AGENT')
            userWhere.role = 'agent';
        else if (data.target === 'OPERATOR')
            userWhere.role = 'operator';
        else if (data.target === 'ADMIN')
            userWhere.role = 'admin';
        const users = await this.prisma.profile.findMany({
            where: userWhere,
            select: { id: true, role: true },
        });
        await this.prisma.notification.createMany({
            data: users.map((u) => ({
                userId: u.id,
                title: `System Broadcast: ${data.title}`,
                message: data.content || 'New system announcement published.',
                type: 'SYSTEM_BROADCAST',
                link: '/dashboard/notices',
            })),
            skipDuplicates: true,
        });
        if (data.target === 'EVERYONE') {
            this.notificationsGateway.server.emit('notification', {
                type: 'system_broadcast',
                title: data.title,
                message: data.content,
            });
        }
        else {
            const targetRole = data.target.toLowerCase();
            this.notificationsGateway.sendToRole(targetRole, 'notification', {
                type: 'system_broadcast',
                title: data.title,
                message: data.content,
            });
        }
        return {
            message: 'Broadcast dispatched successfully',
            broadcast,
        };
    }
    async deleteBroadcast(id) {
        await this.prisma.systemBroadcast.delete({
            where: { id },
        });
        return { message: 'Broadcast deleted successfully' };
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_BROADCASTS),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemBroadcastsController.prototype, "getBroadcasts", null);
__decorate([
    (0, common_1.Post)(),
    (0, guards_1.RequirePermission)(permissions_1.Action.MODIFY_GOVERNANCE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemBroadcastsController.prototype, "createBroadcast", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, guards_1.RequirePermission)(permissions_1.Action.MODIFY_GOVERNANCE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemBroadcastsController.prototype, "deleteBroadcast", null);
SystemBroadcastsController = __decorate([
    (0, common_1.Controller)('admin/broadcasts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationsGateway,
        notifications_service_1.NotificationsService])
], SystemBroadcastsController);
exports.default = SystemBroadcastsController;
//# sourceMappingURL=system-broadcasts.controller.js.map