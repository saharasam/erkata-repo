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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const redis_presence_service_1 = require("../common/redis/redis-presence.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let RequestsService = class RequestsService {
    prisma;
    eventEmitter;
    presence;
    timeoutQueue;
    constructor(prisma, eventEmitter, presence, timeoutQueue) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.presence = presence;
        this.timeoutQueue = timeoutQueue;
    }
    redact(user, message) {
        return {
            id: '00000000-0000-0000-0000-000000000000',
            fullName: message,
            phone: '',
            createdAt: user.createdAt || new Date(),
        };
    }
    async createRequest(customerId, dto) {
        const zone = await this.prisma.zone.findFirst({
            where: { name: dto.locationZone.kifleKetema },
        });
        if (!zone)
            throw new common_1.BadRequestException('Invalid zone');
        const request = await this.prisma.request.create({
            data: {
                customerId,
                category: dto.category,
                description: dto.details.description,
                budgetMin: dto.details.budgetMin,
                budgetMax: dto.details.budgetMax,
                zoneId: zone.id,
                woreda: dto.locationZone.woreda,
                status: client_1.RequestStatus.pending,
            },
        });
        this.eventEmitter.emit('request.created', request);
        await this.assignToNextReadyOperator(request.id);
        return request;
    }
    async assignToNextReadyOperator(requestId) {
        const request = await this.prisma.request.findUnique({
            where: { id: requestId },
            include: { zone: true },
        });
        if (!request || request.status !== client_1.RequestStatus.pending || request.assignedOperatorId) {
            return;
        }
        const operator = await this.prisma.profile.findFirst({
            where: {
                role: client_1.UserRole.operator,
                isOnline: true,
                assignedRequests: {
                    none: {
                        status: client_1.RequestStatus.pending,
                    },
                },
            },
            orderBy: { lastAssignmentAt: 'asc' },
        });
        if (!operator)
            return;
        await this.prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.request.update({
                where: { id: requestId, assignedOperatorId: null },
                data: {
                    assignedOperatorId: operator.id,
                    assignmentPushedAt: new Date(),
                },
            });
            await tx.profile.update({
                where: { id: operator.id },
                data: { lastAssignmentAt: new Date() },
            });
            await this.timeoutQueue.add('check-timeout', { requestId: updatedRequest.id, operatorId: operator.id }, { delay: 5 * 60 * 1000, jobId: `timeout-${updatedRequest.id}` });
        });
        this.eventEmitter.emit('request.pushed', { requestId, operatorId: operator.id });
    }
    async handleOperatorReady(operatorId) {
        const oldestRequest = await this.prisma.request.findFirst({
            where: {
                status: client_1.RequestStatus.pending,
                assignedOperatorId: null,
            },
            orderBy: { createdAt: 'asc' },
        });
        if (oldestRequest) {
            await this.assignToNextReadyOperator(oldestRequest.id);
        }
    }
    async getOperatorQueue(filters) {
        const whereClause = {
            status: client_1.RequestStatus.pending,
        };
        if (filters?.zoneId) {
            whereClause.zoneId = filters.zoneId;
        }
        return await this.prisma.request.findMany({
            where: whereClause,
            include: {
                customer: {
                    select: { id: true, fullName: true, createdAt: true },
                },
                zone: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async assignAgent(requestId, agentId, operatorId) {
        const request = await this.prisma.request.findUnique({
            where: { id: requestId },
            include: { zone: true },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        if (request.status !== client_1.RequestStatus.pending) {
            throw new common_1.BadRequestException(`Request status "${request.status}" does not allow assignment`);
        }
        const agent = await this.prisma.profile.findUnique({
            where: { id: agentId },
            include: { agentZones: true },
        });
        if (!agent || agent.role !== client_1.UserRole.agent) {
            throw new common_1.BadRequestException('Invalid agent');
        }
        if (!agent.isActive) {
            throw new common_1.ForbiddenException('Cannot assign a suspended agent.');
        }
        const operator = await this.prisma.profile.findUnique({
            where: { id: operatorId },
            select: { isActive: true },
        });
        if (!operator || !operator.isActive) {
            throw new common_1.ForbiddenException('Your account is suspended.');
        }
        const match = await this.prisma.$transaction(async (tx) => {
            await tx.request.update({
                where: { id: requestId },
                data: {
                    status: client_1.RequestStatus.matched,
                },
            });
            return tx.match.create({
                data: {
                    requestId,
                    agentId,
                    operatorId,
                    status: 'assigned',
                },
            });
        });
        this.eventEmitter.emit('match.created', { match, agentId });
        return match;
    }
    async getRequest(requestId, userId, role) {
        const request = await this.prisma.request.findUnique({
            where: { id: requestId },
            include: {
                customer: {
                    select: { id: true, fullName: true, phone: true, createdAt: true },
                },
                matches: {
                    include: {
                        agent: {
                            select: { id: true, fullName: true, phone: true },
                        },
                        transaction: true,
                    },
                },
                zone: true,
            },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        if (role === client_1.UserRole.customer) {
            if (request.customerId !== userId)
                throw new common_1.ForbiddenException();
            const activeMatch = request.matches[0];
            let agentInfo = activeMatch?.agent;
            if (activeMatch && activeMatch.status === 'assigned') {
                agentInfo = this.redact({ id: '', fullName: '', phone: '' }, 'An agent has been assigned — details will be visible once they accept.');
            }
            return {
                ...request,
                customer: request.customer,
                match: activeMatch ? { ...activeMatch, agent: agentInfo } : null,
            };
        }
        if (role === client_1.UserRole.operator) {
            const isAssigned = request.assignedOperatorId === userId;
            const isPending = request.status === client_1.RequestStatus.pending;
            if (!isAssigned && !isPending) {
                throw new common_1.ForbiddenException('No access to this request');
            }
            return {
                ...request,
                customer: this.redact(request.customer, 'Customer PII is hidden until assignment.'),
            };
        }
        return request;
    }
    async findEligibleAgents() {
        const agents = await this.prisma.profile.findMany({
            where: {
                role: client_1.UserRole.agent,
                isActive: true,
            },
            include: {
                agentZones: {
                    include: { zone: { select: { id: true, name: true } } },
                },
            },
        });
        const tierPriority = {
            ABUNDANT_LIFE: 5, UNITY: 4, LOVE: 3, PEACE: 2, FREE: 1,
        };
        return agents
            .map((agent) => ({
            id: agent.id,
            fullName: agent.fullName,
            isActive: agent.isActive,
            tier: agent.tier ?? 'FREE',
            zones: agent.agentZones.map((az) => az.zone?.name ?? 'Unknown Zone'),
        }))
            .sort((a, b) => {
            const tA = tierPriority[a.tier] ?? 1;
            const tB = tierPriority[b.tier] ?? 1;
            if (tB !== tA)
                return tB - tA;
            return (a.zones[0] || '').localeCompare(b.zones[0] || '');
        });
    }
    async getCustomerRequests(customerId) {
        return this.prisma.request.findMany({
            where: { customerId },
            include: {
                zone: true,
                matches: {
                    include: {
                        agent: { select: { id: true, fullName: true } },
                        transaction: { select: { id: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async confirmFulfillment(requestId, customerId, confirmed) {
        const request = await this.prisma.request.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        if (request.customerId !== customerId)
            throw new common_1.ForbiddenException('Not your request');
        if (request.status !== client_1.RequestStatus.delivered) {
            throw new common_1.BadRequestException('Request is not in a confirmable state');
        }
        if (confirmed) {
            await this.prisma.request.update({
                where: { id: requestId },
                data: { status: client_1.RequestStatus.completed },
            });
        }
        else {
            await this.prisma.request.update({
                where: { id: requestId },
                data: { status: 'DISPUTED' },
            });
            this.eventEmitter.emit('request.disputed', { requestId, customerId });
        }
        return { success: true, status: confirmed ? 'completed' : 'disputed' };
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)('assignment-timeout')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2,
        redis_presence_service_1.RedisPresenceService,
        bullmq_2.Queue])
], RequestsService);
//# sourceMappingURL=requests.service.js.map