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
let AssignmentProcessor = AssignmentProcessor_1 = class AssignmentProcessor extends bullmq_1.WorkerHost {
    prisma;
    redis;
    eventEmitter;
    logger = new common_1.Logger(AssignmentProcessor_1.name);
    constructor(prisma, redis, eventEmitter) {
        super();
        this.prisma = prisma;
        this.redis = redis;
        this.eventEmitter = eventEmitter;
    }
    async process(job) {
        if (job.name === 'check-timeout') {
            const { requestId, operatorId } = job.data;
            this.logger.log(`[AssignmentProcessor] Checking timeout for request ${requestId} assigned to ${operatorId}`);
            const request = await this.prisma.request.findUnique({
                where: { id: requestId },
            });
            if (request && request.status === client_1.RequestStatus.pending && request.assignedOperatorId === operatorId) {
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
    }
};
exports.AssignmentProcessor = AssignmentProcessor;
exports.AssignmentProcessor = AssignmentProcessor = AssignmentProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('assignment-timeout'),
    __param(1, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_1.Redis,
        event_emitter_1.EventEmitter2])
], AssignmentProcessor);
//# sourceMappingURL=assignment.processor.js.map