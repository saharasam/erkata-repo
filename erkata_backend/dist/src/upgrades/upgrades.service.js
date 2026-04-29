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
exports.UpgradesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const users_service_1 = require("../users/users.service");
let UpgradesService = class UpgradesService {
    prisma;
    notifications;
    usersService;
    constructor(prisma, notifications, usersService) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.usersService = usersService;
    }
    async getActiveRequestForUser(agentId) {
        return this.prisma.upgradeRequest.findFirst({
            where: {
                agentId,
                status: { in: ['SUBMITTED', 'OPERATOR_VERIFIED'] },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createRequest(agentId, targetTier) {
        const agent = await this.prisma.profile.findUnique({
            where: { id: agentId },
            include: { package: true },
        });
        if (!agent)
            throw new common_1.NotFoundException('Agent not found');
        const existing = await this.prisma.upgradeRequest.findFirst({
            where: {
                agentId,
                status: { in: ['SUBMITTED', 'OPERATOR_VERIFIED'] },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('You already have a pending upgrade request.');
        }
        return this.prisma.upgradeRequest.create({
            data: {
                agentId,
                currentTier: agent.tier,
                targetTier,
                status: 'SUBMITTED',
            },
        });
    }
    async uploadProof(requestId, agentId, proofUrl) {
        const request = await this.prisma.upgradeRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        if (request.agentId !== agentId) {
            throw new common_1.ForbiddenException('Not your request');
        }
        const updated = await this.prisma.upgradeRequest.update({
            where: { id: requestId },
            data: { proofUrl },
        });
        this.notifications.sendToRole('financial_operator', 'notification', {
            type: 'upgrade.submitted',
            title: 'New Upgrade Proof',
            message: `Agent has uploaded proof for ${request.targetTier} upgrade.`,
            requestId: request.id,
        });
        return updated;
    }
    async getPendingForOperator() {
        return this.prisma.upgradeRequest.findMany({
            where: { status: 'SUBMITTED', proofUrl: { not: null } },
            include: {
                agent: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async verifyRequest(requestId, operatorId, note) {
        const request = await this.prisma.upgradeRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        const updated = await this.prisma.upgradeRequest.update({
            where: { id: requestId },
            data: {
                status: 'OPERATOR_VERIFIED',
                internalNote: note,
                operatorId,
            },
        });
        this.notifications.sendToRole('super_admin', 'notification', {
            type: 'upgrade.verified',
            title: 'Upgrade Verified by Operator',
            message: `A request for ${request.targetTier} has been verified and is ready for approval.`,
            requestId: request.id,
        });
        return updated;
    }
    async getVerifiedForAdmin() {
        return this.prisma.upgradeRequest.findMany({
            where: { status: 'OPERATOR_VERIFIED' },
            include: {
                agent: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                operator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async approveRequest(requestId, adminId) {
        const request = await this.prisma.upgradeRequest.findUnique({
            where: { id: requestId },
            include: { agent: true },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        if (request.status !== 'OPERATOR_VERIFIED') {
            throw new common_1.BadRequestException('Request must be verified by an operator first');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.upgradeRequest.update({
                where: { id: requestId },
                data: {
                    status: 'APPROVED',
                    adminId,
                },
            });
            await this.usersService.applyTierUpgrade(request.agentId, request.targetTier, 'ETB', tx);
            await tx.notification.create({
                data: {
                    userId: request.agentId,
                    type: 'upgrade.approved',
                    title: 'Upgrade Approved!',
                    message: `Your account has been upgraded to ${request.targetTier}.`,
                },
            });
            this.notifications.sendToUser(request.agentId, 'notification', {
                type: 'upgrade.approved',
                title: 'Upgrade Approved!',
                message: `Your account has been upgraded to ${request.targetTier}.`,
            });
            return { success: true };
        });
    }
    async rejectRequest(requestId, adminId, reason) {
        const request = await this.prisma.upgradeRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        await this.prisma.upgradeRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                internalNote: `REJECTED: ${reason}. ${request.internalNote || ''}`,
                adminId,
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: request.agentId,
                type: 'upgrade.rejected',
                title: 'Upgrade Request Denied',
                message: `Your upgrade request was rejected. Reason: ${reason}`,
            },
        });
        this.notifications.sendToUser(request.agentId, 'notification', {
            type: 'upgrade.rejected',
            title: 'Upgrade Request Denied',
            message: `Your upgrade request was rejected. Reason: ${reason}`,
        });
        if (request.operatorId) {
            this.notifications.sendToUser(request.operatorId, 'notification', {
                type: 'upgrade.rejected',
                title: 'Request Denied by Admin',
                message: `The request you verified for agent ${request.agentId} was rejected by Super Admin.`,
            });
        }
        return { success: true };
    }
};
exports.UpgradesService = UpgradesService;
exports.UpgradesService = UpgradesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationsGateway,
        users_service_1.UsersService])
], UpgradesService);
//# sourceMappingURL=upgrades.service.js.map