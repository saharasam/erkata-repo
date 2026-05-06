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
var AssignmentProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const event_emitter_1 = require("@nestjs/event-emitter");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
let AssignmentProcessor = AssignmentProcessor_1 = class AssignmentProcessor extends bullmq_1.WorkerHost {
    prisma;
    redis;
    eventEmitter;
    notificationsGateway;
    notificationsService;
    logger = new common_1.Logger(AssignmentProcessor_1.name);
    constructor(prisma, redis, eventEmitter, notificationsGateway, notificationsService) {
        super();
        this.prisma = prisma;
        this.redis = redis;
        this.eventEmitter = eventEmitter;
        this.notificationsGateway = notificationsGateway;
        this.notificationsService = notificationsService;
    }
    async process(job) {
        if (job.name === 'check-timeout') {
            const { requestId, operatorId } = job.data;
            this.logger.log(`[AssignmentProcessor] Checking timeout for request ${requestId} assigned to ${operatorId}`);
            const request = await this.prisma.request.findUnique({
                where: { id: requestId },
            });
            if (request &&
                request.status === client_1.RequestStatus.pending &&
                request.assignedOperatorId === operatorId) {
                this.logger.warn(`[AssignmentProcessor] Request ${requestId} timed out for operator ${operatorId}. Reclaiming...`);
                await this.prisma.$transaction(async (tx) => {
                    await tx.request.update({
                        where: { id: requestId },
                        data: {
                            assignedOperatorId: null,
                            assignmentPushedAt: null,
                        },
                    });
                    const profile = await tx.profile.update({
                        where: { id: operatorId },
                        data: {
                            missedAssignments: { increment: 1 },
                        },
                    });
                    if (profile.missedAssignments >= 3) {
                        this.logger.warn(`[AssignmentProcessor] Operator ${operatorId} reached ${profile.missedAssignments} misses. Marking offline.`);
                        await tx.profile.update({
                            where: { id: operatorId },
                            data: { isOnline: false },
                        });
                        await this.redis.del(`presence:operator:${operatorId}`);
                    }
                    else {
                        this.logger.log(`[AssignmentProcessor] Operator ${operatorId} missed assignment (${profile.missedAssignments}/3). Remaining online.`);
                    }
                });
                this.logger.log(`[AssignmentProcessor] Request ${requestId} reclaimed. Triggering re-assignment.`);
                this.eventEmitter.emit('request.created', { id: requestId });
            }
        }
        if (job.name === 'check-agent-timeout') {
            const { requestId, matchId, agentId } = job.data;
            this.logger.log(`[AssignmentProcessor] Checking agent timeout for match ${matchId} (Request: ${requestId})`);
            const match = await this.prisma.match.findUnique({
                where: { id: matchId },
            });
            if (match && match.status === 'assigned') {
                this.logger.warn(`[AssignmentProcessor] Agent ${agentId} timed out on match ${matchId}. Returning request to operator.`);
                await this.prisma.$transaction(async (tx) => {
                    await tx.match.update({
                        where: { id: matchId },
                        data: { status: 'rejected' },
                    });
                    const currentRequest = await tx.request.findUnique({
                        where: { id: requestId },
                    });
                    await tx.request.update({
                        where: { id: requestId },
                        data: {
                            status: client_1.RequestStatus.pending,
                            metadata: {
                                ...(typeof currentRequest?.metadata === 'object'
                                    ? currentRequest.metadata
                                    : {}),
                                agentTimeoutAt: new Date().toISOString(),
                                lastTimedOutAgentId: agentId,
                            },
                        },
                    });
                });
                this.eventEmitter.emit('request.updated', { id: requestId });
            }
        }
        if (job.name === 'check-fulfillment-timeout') {
            const { requestId } = job.data;
            this.logger.log(`[AssignmentProcessor] Checking fulfillment auto-confirm for request ${requestId}`);
            const request = await this.prisma.request.findUnique({
                where: { id: requestId },
            });
            if (request &&
                request.status === client_1.RequestStatus.fulfilled &&
                !request.completedAt) {
                this.logger.log(`[AssignmentProcessor] Auto-confirming request ${requestId} after 72h window.`);
                await this.prisma.request.update({
                    where: { id: requestId },
                    data: {
                        status: client_1.RequestStatus.fulfilled,
                        completedAt: new Date(),
                        metadata: {
                            ...(typeof request.metadata === 'object' ? request.metadata : {}),
                            autoConfirmedAt: new Date().toISOString(),
                        },
                    },
                });
            }
        }
        if (job.name === 'queue-sweeper') {
            this.logger.log('[AssignmentProcessor] Running Queue Sweeper...');
            const unassignedRequests = await this.prisma.request.findMany({
                where: {
                    status: client_1.RequestStatus.pending,
                    assignedOperatorId: null,
                },
                take: 10,
                orderBy: { createdAt: 'asc' },
            });
            if (unassignedRequests.length > 0) {
                this.logger.log(`[AssignmentProcessor] Sweeper found ${unassignedRequests.length} unassigned requests. Re-triggering...`);
                for (const req of unassignedRequests) {
                    this.eventEmitter.emit('request.created', { id: req.id });
                }
            }
        }
        if (job.name === 'upgrade-sweeper') {
            await this.handleStaleUpgradeRequests();
        }
    }
    async handleStaleUpgradeRequests() {
        this.logger.log('[AssignmentProcessor] Running Upgrade Sweeper...');
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const staleRequests = await this.prisma.upgradeRequest.findMany({
            where: {
                status: client_1.UpgradeRequestStatus.SUBMITTED,
                createdAt: {
                    lt: fortyEightHoursAgo,
                },
            },
        });
        if (staleRequests.length === 0) {
            return;
        }
        this.logger.log(`[AssignmentProcessor] Found ${staleRequests.length} stale upgrade requests. Auto-rejecting...`);
        let cleanedUpCount = 0;
        for (const req of staleRequests) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    await tx.upgradeRequest.update({
                        where: { id: req.id },
                        data: {
                            status: client_1.UpgradeRequestStatus.REJECTED,
                            internalNote: 'Auto-rejected: No operator action within 48h.',
                        },
                    });
                    await tx.auditLog.create({
                        data: {
                            action: 'UPGRADE_AUTO_REJECTED',
                            targetTable: 'upgrade_requests',
                            targetId: req.id,
                            metadata: {
                                reason: 'No operator action within 48h',
                                previousStatus: req.status,
                            },
                        },
                    });
                    await tx.notification.create({
                        data: {
                            userId: req.agentId,
                            title: 'Upgrade Request Expired',
                            message: 'Your upgrade request has expired because it was not verified within 48 hours. Please submit a new request if needed.',
                            type: 'upgrade.rejected',
                            link: '/agent/upgrade',
                        },
                    });
                });
                this.notificationsGateway.sendToUser(req.agentId, 'notification', {
                    title: 'Upgrade Request Expired',
                    message: 'Your upgrade request has expired because it was not verified within 48 hours.',
                    type: 'upgrade.rejected',
                });
                cleanedUpCount++;
            }
            catch (error) {
                this.logger.error(`[AssignmentProcessor] Failed to auto-reject upgrade request ${req.id}:`, error);
            }
        }
        this.logger.log(`[AssignmentProcessor] Successfully auto-rejected ${cleanedUpCount} stale upgrade requests.`);
    }
};
exports.AssignmentProcessor = AssignmentProcessor;
exports.AssignmentProcessor = AssignmentProcessor = AssignmentProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('assignment-timeout'),
    __param(1, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_1.Redis,
        event_emitter_1.EventEmitter2,
        notifications_gateway_1.NotificationsGateway,
        notifications_service_1.NotificationsService])
], AssignmentProcessor);
//# sourceMappingURL=assignment.processor.js.map