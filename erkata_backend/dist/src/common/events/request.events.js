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
var RequestEventListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestEventListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const notifications_service_1 = require("../../notifications/notifications.service");
const notifications_gateway_1 = require("../../notifications/notifications.gateway");
const prisma_service_1 = require("../../prisma/prisma.service");
let RequestEventListener = RequestEventListener_1 = class RequestEventListener {
    notifications;
    gateway;
    prisma;
    logger = new common_1.Logger(RequestEventListener_1.name);
    constructor(notifications, gateway, prisma) {
        this.notifications = notifications;
        this.gateway = gateway;
        this.prisma = prisma;
    }
    handleRequestCreated(payload) {
        this.logger.log(`[EVENT] request.created → id=${payload.id}`);
    }
    async handleRequestPushed(payload) {
        this.logger.log(`[EVENT] request.pushed → requestId=${payload.requestId}, operatorId=${payload.operatorId}`);
        const notification = await this.notifications.create({
            userId: payload.operatorId,
            title: 'New Request Assigned',
            message: `A new request has been pushed to your queue. Accept it before it times out.`,
            type: 'request.pushed',
            link: `/operator/requests/${payload.requestId}`,
        });
        this.gateway.sendToUser(payload.operatorId, 'notification', notification);
    }
    async handleMatchCreated(payload) {
        this.logger.log(`[EVENT] match.created → agentId=${payload.agentId}`);
        const notification = await this.notifications.create({
            userId: payload.agentId,
            title: 'New Lead Assignment',
            message: 'An operator has assigned a new lead to you. Accept it to see details.',
            type: 'match.created',
            link: `/agent/tasks/${payload.match.id}`,
        });
        this.gateway.sendToUser(payload.agentId, 'notification', notification);
    }
    async handleMatchAccepted(payload) {
        this.logger.log(`[EVENT] match.accepted → requestId=${payload.requestId}`);
        const request = await this.prisma.request.findUnique({
            where: { id: payload.requestId },
            include: { customer: true },
        });
        if (request) {
            const notification = await this.notifications.create({
                userId: request.customerId,
                title: 'Request has been assigned',
                message: 'An agent has accepted your request and will contact you soon.',
                type: 'match.accepted',
                link: `/dashboard/requests/${request.id}`,
            });
            this.gateway.sendToUser(request.customerId, 'notification', notification);
        }
    }
    async handleMatchCompleted(payload) {
        this.logger.log(`[EVENT] match.completed → requestId=${payload.requestId}`);
        const request = await this.prisma.request.findUnique({
            where: { id: payload.requestId },
            include: { customer: true },
        });
        if (request) {
            const notification = await this.notifications.create({
                userId: request.customerId,
                title: 'Job Delivered',
                message: 'The agent has marked your request as delivered. Please confirm fulfillment.',
                type: 'match.completed',
                link: `/dashboard/requests/${request.id}`,
            });
            this.gateway.sendToUser(request.customerId, 'notification', notification);
        }
    }
    async handleRequestDisputed(payload) {
        this.logger.log(`[EVENT] request.disputed → requestId=${payload.requestId}`);
        const request = await this.prisma.request.findUnique({
            where: { id: payload.requestId },
            include: { assignedOperator: true },
        });
        const admins = await this.prisma.profile.findMany({
            where: { role: 'admin' },
            select: { id: true },
        });
        const targets = new Set(admins.map((a) => a.id));
        if (request?.assignedOperatorId)
            targets.add(request.assignedOperatorId);
        for (const targetId of targets) {
            const notification = await this.notifications.create({
                userId: targetId,
                title: 'Lead Disputed',
                message: `A customer has marked a lead as NOT fulfilled. Immediate intervention required.`,
                type: 'request.disputed',
                link: `/operator/requests/${payload.requestId}`,
            });
            this.gateway.sendToUser(targetId, 'notification', notification);
        }
    }
    async handleRequestEscalated(payload) {
        this.logger.log(`[EVENT] request.escalated → requestId=${payload.requestId}`);
        await this.notifications.markRelatedAsRead(payload.requestId, [
            'request.disputed',
        ]);
        const admins = await this.prisma.profile.findMany({
            where: { role: 'admin' },
            select: { id: true },
        });
        for (const admin of admins) {
            const notification = await this.notifications.create({
                userId: admin.id,
                title: 'Dispute Escalated',
                message: `Operator escalated a dispute. Note: ${payload.note || 'None'}`,
                type: 'request.escalated',
                link: `/admin?view=disputes&requestId=${payload.requestId}`,
            });
            this.gateway.sendToUser(admin.id, 'notification', notification);
        }
    }
    async handleRequestResolved(payload) {
        this.logger.log(`[EVENT] request.resolved → requestId=${payload.requestId}`);
        await this.notifications.markRelatedAsRead(payload.requestId, [
            'request.disputed',
            'request.escalated',
        ]);
        const request = await this.prisma.request.findUnique({
            where: { id: payload.requestId },
        });
        if (request) {
            const notification = await this.notifications.create({
                userId: request.customerId,
                title: 'Dispute Resolved',
                message: `Your dispute has been resolved. Note: ${payload.note || 'Resolved by operator.'}`,
                type: 'request.resolved',
                link: `/dashboard/requests/${request.id}`,
            });
            this.gateway.sendToUser(request.customerId, 'notification', notification);
        }
    }
    async handleRequestVoided(payload) {
        this.logger.log(`[EVENT] request.voided → requestId=${payload.requestId}`);
        const request = await this.prisma.request.findUnique({
            where: { id: payload.requestId },
            include: {
                matches: { where: { status: 'assigned' }, include: { agent: true } },
            },
        });
        const agent = request?.matches[0]?.agent;
        if (agent) {
            const notification = await this.notifications.create({
                userId: agent.id,
                title: 'Fulfillment Voided',
                message: `A fulfillment was voided by an operator (redo required). Note: ${payload.note || 'None'}`,
                type: 'request.voided',
                link: '/agent?view=focus',
            });
            this.gateway.sendToUser(agent.id, 'notification', notification);
        }
    }
};
exports.RequestEventListener = RequestEventListener;
__decorate([
    (0, event_emitter_1.OnEvent)('request.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestEventListener.prototype, "handleRequestCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('request.pushed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestEventListener.prototype, "handleRequestPushed", null);
__decorate([
    (0, event_emitter_1.OnEvent)('match.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestEventListener.prototype, "handleMatchCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('match.accepted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestEventListener.prototype, "handleMatchAccepted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('match.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestEventListener.prototype, "handleMatchCompleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('request.disputed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestEventListener.prototype, "handleRequestDisputed", null);
__decorate([
    (0, event_emitter_1.OnEvent)('request.escalated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestEventListener.prototype, "handleRequestEscalated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('request.resolved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestEventListener.prototype, "handleRequestResolved", null);
__decorate([
    (0, event_emitter_1.OnEvent)('request.voided'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestEventListener.prototype, "handleRequestVoided", null);
exports.RequestEventListener = RequestEventListener = RequestEventListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        notifications_gateway_1.NotificationsGateway,
        prisma_service_1.PrismaService])
], RequestEventListener);
//# sourceMappingURL=request.events.js.map