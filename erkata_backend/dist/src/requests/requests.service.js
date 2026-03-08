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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RequestsService = class RequestsService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
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
        return request;
    }
    async getOperatorQueue(filters) {
        const whereClause = {
            status: { in: [client_1.RequestStatus.pending] },
        };
        if (filters?.zoneId) {
            whereClause.zoneId = filters.zoneId;
        }
        const requests = await this.prisma.request.findMany({
            where: whereClause,
            include: {
                customer: {
                    select: { id: true, fullName: true, createdAt: true },
                },
                zone: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return requests;
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
            include: { agentZones: true, referralLink: true },
        });
        if (!agent || agent.role !== client_1.UserRole.agent) {
            throw new common_1.BadRequestException('Invalid agent');
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
    async getRequestStatus(requestId, userId, role) {
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
        const activeMatch = request.matches[0];
        if (role === client_1.UserRole.customer) {
            if (request.customerId !== userId)
                throw new common_1.ForbiddenException();
            let agentInfo = activeMatch?.agent;
            if (activeMatch && activeMatch.status === 'assigned') {
                agentInfo = this.redact({ id: '', fullName: '', phone: '' }, 'An agent has been assigned — details will be visible once they accept.');
            }
            const response = {
                id: request.id,
                category: request.category,
                description: request.description,
                zone: request.zone,
                status: request.status,
                createdAt: request.createdAt,
                match: activeMatch
                    ? {
                        id: activeMatch.id,
                        status: activeMatch.status,
                        agent: agentInfo,
                    }
                    : null,
            };
            return response;
        }
        if (role === client_1.UserRole.agent) {
            if (activeMatch?.agentId !== userId)
                throw new common_1.ForbiddenException();
            let customerInfo = request.customer;
            if (activeMatch.status === 'assigned') {
                customerInfo = this.redact(request.customer, 'Customer details will be revealed once you accept the assignment.');
            }
            return {
                ...request,
                customer: customerInfo,
            };
        }
        return request;
    }
    async findEligibleAgents() {
        console.log(`[RequestsService] findEligibleAgents called — fetching all active agents`);
        const agents = await this.prisma.profile.findMany({
            where: {
                role: client_1.UserRole.agent,
                isActive: true,
            },
            select: {
                id: true,
                fullName: true,
                isActive: true,
                referralLink: { select: { tier: true } },
                agentZones: {
                    include: { zone: { select: { id: true, name: true } } },
                },
            },
        });
        console.log(`[RequestsService] Found ${agents.length} active agents.`);
        const tierPriority = {
            ABUNDANT_LIFE: 5,
            UNITY: 4,
            LOVE: 3,
            PEACE: 2,
            FREE: 1,
        };
        const enriched = agents.map((agent) => ({
            id: agent.id,
            fullName: agent.fullName,
            isActive: agent.isActive,
            tier: agent.referralLink?.tier ?? 'FREE',
            zones: agent.agentZones.length > 0
                ? agent.agentZones.map((az) => az.zone?.name ?? 'Unknown Zone')
                : ['Unknown Zone'],
        }));
        return enriched.sort((a, b) => {
            const tA = tierPriority[a.tier] ?? 1;
            const tB = tierPriority[b.tier] ?? 1;
            if (tB !== tA)
                return tB - tA;
            return a.zones[0].localeCompare(b.zones[0]);
        });
    }
    async getCustomerRequests(customerId) {
        return this.prisma.request.findMany({
            where: { customerId },
            include: {
                zone: true,
                matches: {
                    select: {
                        id: true,
                        status: true,
                        agent: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], RequestsService);
//# sourceMappingURL=requests.service.js.map