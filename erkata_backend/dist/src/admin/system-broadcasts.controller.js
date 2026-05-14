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
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
let SystemBroadcastsController = class SystemBroadcastsController {
    prisma;
    broadcastQueue;
    constructor(prisma, broadcastQueue) {
        this.prisma = prisma;
        this.broadcastQueue = broadcastQueue;
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
        if (user.role === 'financial_operator')
            allowedTargets.push('FINANCE_OP');
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
        await this.broadcastQueue.add('send-broadcast', {
            broadcastId: broadcast.id,
            title: data.title,
            content: data.content,
            target: data.target,
        });
        return {
            message: 'Broadcast scheduled for distribution',
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
    __param(1, (0, bullmq_1.InjectQueue)('broadcast')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], SystemBroadcastsController);
exports.default = SystemBroadcastsController;
//# sourceMappingURL=system-broadcasts.controller.js.map