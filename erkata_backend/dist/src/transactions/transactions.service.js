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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TransactionsService = class TransactionsService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async acceptAssignment(matchId, agentId) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
            include: { request: true },
        });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        if (match.agentId !== agentId) {
            throw new common_1.ForbiddenException('This assignment does not belong to you');
        }
        if (match.status !== 'assigned') {
            throw new common_1.BadRequestException(`Assignment is already "${match.status}" and cannot be accepted`);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const matchResult = await tx.match.update({
                where: { id: matchId },
                data: {
                    status: 'accepted',
                },
            });
            await tx.request.update({
                where: { id: match.requestId },
                data: { status: client_1.RequestStatus.in_progress },
            });
            await tx.transaction.upsert({
                where: { matchId: matchId },
                update: {},
                create: {
                    matchId,
                    amount: match.request.budgetMax || new client_1.Prisma.Decimal(0),
                    currency: 'ETB',
                    status: 'pending',
                },
            });
            return matchResult;
        }, {
            timeout: 15000,
        });
        this.eventEmitter.emit('match.accepted', updated);
        return updated;
    }
    async declineAssignment(matchId, agentId) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
        });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        if (match.agentId !== agentId) {
            throw new common_1.ForbiddenException('This assignment does not belong to you');
        }
        if (match.status !== 'assigned') {
            throw new common_1.BadRequestException('Cannot decline a match that is already processed');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.match.update({
                where: { id: matchId },
                data: { status: 'rejected' },
            });
            await tx.request.update({
                where: { id: match.requestId },
                data: {
                    status: client_1.RequestStatus.pending,
                },
            });
        });
        this.eventEmitter.emit('match.rejected', { matchId, agentId });
        return { message: 'Assignment rejected. Request returned to queue.' };
    }
    async markComplete(matchId, agentId) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
        });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        if (match.agentId !== agentId) {
            throw new common_1.ForbiddenException('This match does not belong to you');
        }
        if (match.status !== 'accepted') {
            throw new common_1.BadRequestException('Only accepted matches can be marked complete');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const matchResult = await tx.match.update({
                where: { id: matchId },
                data: {
                    status: 'completed',
                },
                include: {
                    agent: {
                        include: {
                            referredBy: true,
                        },
                    },
                    request: true,
                },
            });
            await tx.request.update({
                where: { id: match.requestId },
                data: { status: client_1.RequestStatus.completed },
            });
            const res = matchResult;
            const budget = res.request?.budgetMax || res.request?.budgetMin || 0;
            if (budget > 0 && res.agent?.referredBy) {
                const commissionAmount = budget * 0.05;
                await tx.profile.update({
                    where: { id: res.agent.referredById },
                    data: {
                        walletBalance: {
                            increment: commissionAmount,
                        },
                    },
                });
                await tx.auditLog.create({
                    data: {
                        actorId: agentId,
                        action: 'REFERRAL_COMMISSION_CREDITED',
                        targetTable: 'profiles',
                        targetId: res.agent.referredById,
                        metadata: {
                            matchId,
                            amount: commissionAmount,
                            reason: `Referral commission from agent ${res.agent.fullName}`,
                        },
                    },
                });
            }
            return matchResult;
        });
        this.eventEmitter.emit('match.completed', result);
        return result;
    }
    async getAgentJobs(agentId) {
        const matches = await this.prisma.match.findMany({
            where: { agentId },
            include: {
                transaction: true,
                request: {
                    include: {
                        zone: true,
                        customer: {
                            select: { id: true, fullName: true, phone: true },
                        },
                    },
                },
            },
            orderBy: { assignedAt: 'desc' },
        });
        return matches.map((m) => {
            const isAccepted = m.status !== 'assigned';
            const req = m.request;
            return {
                id: m.id,
                status: m.status,
                assignedAt: m.assignedAt,
                transaction: m.transaction
                    ? {
                        id: m.transaction.id,
                        status: m.transaction.status,
                        amount: m.transaction.amount?.toString() || '0',
                    }
                    : null,
                request: {
                    id: req.id,
                    category: req.category,
                    description: req.description,
                    budgetMax: req.budgetMax?.toString() || '0',
                    woreda: req.woreda,
                    type: req.type,
                    status: req.status,
                    zone: req.zone?.name || 'Unknown',
                    customer: isAccepted
                        ? {
                            id: req.customer?.id,
                            fullName: req.customer?.fullName,
                            phone: req.customer?.phone,
                        }
                        : {
                            id: null,
                            fullName: 'Accept this assignment to reveal customer details.',
                            phone: null,
                        },
                },
            };
        });
    }
    async getOperatorTransactions(query) {
        return this.prisma.match.findMany({
            where: query?.status ? { status: query.status } : {},
            include: {
                request: {
                    include: {
                        customer: {
                            select: { id: true, fullName: true },
                        },
                    },
                },
            },
            orderBy: { assignedAt: 'desc' },
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map