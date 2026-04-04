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
exports.MediationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const config_service_1 = require("../common/config.service");
let MediationService = class MediationService {
    prisma;
    config;
    mediationQueue;
    constructor(prisma, config, mediationQueue) {
        this.prisma = prisma;
        this.config = config;
        this.mediationQueue = mediationQueue;
    }
    async submitFeedback(transactionId, authorId, content, rating, categories = []) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { feedbacks: true },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        const author = await this.prisma.profile.findUnique({
            where: { id: authorId },
        });
        if (!author)
            throw new common_1.NotFoundException('Author not found');
        if (author.role !== client_1.UserRole.customer && author.role !== client_1.UserRole.agent) {
            throw new common_1.BadRequestException('Only Customers and Agents can submit feedback');
        }
        const existingFeedback = transaction.feedbacks.find((f) => f.authorId === authorId);
        if (existingFeedback)
            throw new common_1.BadRequestException('Feedback already submitted for this transaction');
        const feedback = await this.prisma.feedback.create({
            data: {
                transactionId,
                authorId,
                content,
                rating,
                categories,
            },
        });
        if (transaction.feedbacks.length === 0) {
            await this.mediationQueue.add('feedback-timeout', { transactionId }, { delay: 14 * 24 * 60 * 60 * 1000 });
        }
        await this.checkAndBundle(transactionId);
        return feedback;
    }
    async checkAndBundle(transactionId) {
        const feedbacks = await this.prisma.feedback.findMany({
            where: { transactionId },
            include: { author: true },
        });
        const hasCustomer = feedbacks.some((f) => f.author.role === client_1.UserRole.customer);
        const hasAgent = feedbacks.some((f) => f.author.role === client_1.UserRole.agent);
        if (hasCustomer && hasAgent) {
            await this.prisma.feedbackBundle.upsert({
                where: { transactionId },
                update: {
                    state: client_1.FeedbackBundleState.BUNDLED,
                    stateHistory: {
                        push: {
                            from: client_1.FeedbackBundleState.WAITING_BOTH,
                            to: client_1.FeedbackBundleState.BUNDLED,
                            at: new Date().toISOString(),
                            by: 'SYSTEM',
                            reason: 'Automatic bundling after both parties provided feedback',
                        },
                    },
                },
                create: {
                    transactionId,
                    state: client_1.FeedbackBundleState.BUNDLED,
                    stateHistory: [
                        {
                            from: client_1.FeedbackBundleState.WAITING_BOTH,
                            to: client_1.FeedbackBundleState.BUNDLED,
                            at: new Date().toISOString(),
                            by: 'SYSTEM',
                            reason: 'Initial automatic bundle creation',
                        },
                    ],
                },
            });
        }
    }
    async proposeResolution(bundleId, adminId, proposedText) {
        const bundle = await this.prisma.feedbackBundle.findUnique({
            where: { id: bundleId },
        });
        if (!bundle)
            throw new common_1.NotFoundException('Bundle not found');
        const proposal = await this.prisma.resolutionProposal.create({
            data: {
                bundleId,
                proposedById: adminId,
                proposedText,
            },
        });
        await this.prisma.feedbackBundle.update({
            where: { id: bundleId },
            data: {
                state: client_1.FeedbackBundleState.PROPOSED,
                stateHistory: {
                    push: {
                        from: bundle.state,
                        to: client_1.FeedbackBundleState.PROPOSED,
                        at: new Date().toISOString(),
                        by: adminId,
                        reason: 'Admin proposed resolution',
                    },
                },
            },
        });
        return proposal;
    }
    async finalizeResolution(proposalId, actorId, approved, comment) {
        const proposal = await this.prisma.resolutionProposal.findUnique({
            where: { id: proposalId },
            include: {
                bundle: true,
            },
        });
        if (!proposal)
            throw new common_1.NotFoundException('Proposal not found');
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: proposal.bundle.transactionId },
            include: { match: { include: { request: true } } },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Associated transaction not found');
        const actor = await this.prisma.profile.findUnique({
            where: { id: actorId },
        });
        if (!actor)
            throw new common_1.NotFoundException('Actor not found');
        const isEscalated = transaction.match.request.status === 'matched';
        const budget = transaction.match.request.budgetMax
            ? Number(transaction.match.request.budgetMax)
            : 0;
        const riskThreshold = this.config.get('high_risk_threshold_etb', config_service_1.ConfigService.DEFAULT_RISK_THRESHOLD);
        const isHighRisk = budget > riskThreshold;
        if ((isEscalated || isHighRisk) && actor.role !== client_1.UserRole.super_admin) {
            throw new common_1.BadRequestException('This case is escalated/high-risk and requires Super Admin finalization');
        }
        const final = await this.prisma.finalResolution.create({
            data: {
                proposalId,
                approved,
                comment,
                finalizedById: actorId,
            },
        });
        await this.prisma.feedbackBundle.update({
            where: { id: proposal.bundleId },
            data: {
                state: approved
                    ? client_1.FeedbackBundleState.RESOLVED
                    : client_1.FeedbackBundleState.REJECTED,
                stateHistory: {
                    push: {
                        from: proposal.bundle.state,
                        to: approved
                            ? client_1.FeedbackBundleState.RESOLVED
                            : client_1.FeedbackBundleState.REJECTED,
                        at: new Date().toISOString(),
                        by: actorId,
                        reason: comment || 'Final decision recorded',
                    },
                },
            },
        });
        return final;
    }
    async escalateToSuperAdmin(bundleId, adminId, reason) {
        const bundle = await this.prisma.feedbackBundle.findUnique({
            where: { id: bundleId },
        });
        if (!bundle)
            throw new common_1.NotFoundException('Bundle not found');
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: bundle.transactionId },
            include: { match: true },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        await this.prisma.request.update({
            where: { id: transaction.match.requestId },
            data: { status: 'ESCALATED' },
        });
        await this.prisma.feedbackBundle.update({
            where: { id: bundleId },
            data: {
                stateHistory: {
                    push: {
                        from: bundle.state,
                        to: bundle.state,
                        at: new Date().toISOString(),
                        by: adminId,
                        reason: `Escalated to Super Admin: ${reason}`,
                    },
                },
            },
        });
        return { escalated: true };
    }
    async overrideResolution(resolutionId, superAdminId, newApproved, comment) {
        const resolution = await this.prisma.finalResolution.findUnique({
            where: { id: resolutionId },
            include: { proposal: { include: { bundle: true } } },
        });
        if (!resolution)
            throw new common_1.NotFoundException('Resolution not found');
        const updated = await this.prisma.finalResolution.update({
            where: { id: resolutionId },
            data: {
                approved: newApproved,
                comment: `OVERRIDDEN by Super Admin: ${comment}`,
                finalizedById: superAdminId,
            },
        });
        if (newApproved !== resolution.approved) {
            await this.prisma.feedbackBundle.update({
                where: { id: resolution.proposal.bundleId },
                data: {
                    state: newApproved
                        ? client_1.FeedbackBundleState.RESOLVED
                        : client_1.FeedbackBundleState.REJECTED,
                    stateHistory: {
                        push: {
                            from: resolution.proposal.bundle.state,
                            to: newApproved
                                ? client_1.FeedbackBundleState.RESOLVED
                                : client_1.FeedbackBundleState.REJECTED,
                            at: new Date().toISOString(),
                            by: superAdminId,
                            reason: `Resolution OVERRIDDEN: ${comment}`,
                        },
                    },
                },
            });
        }
        return updated;
    }
    async getBundles(state) {
        return this.prisma.feedbackBundle.findMany({
            where: state ? { state } : {},
            include: {
                transaction: {
                    include: {
                        agent: true,
                        match: {
                            include: {
                                request: {
                                    include: {
                                        customer: true,
                                        zone: true,
                                    },
                                },
                            },
                        },
                        feedbacks: {
                            include: {
                                author: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async finalizeBundleDirectly(bundleId, actorId, resolutionText) {
        const proposal = await this.prisma.resolutionProposal.create({
            data: {
                bundleId,
                proposedById: actorId,
                proposedText: resolutionText,
            },
        });
        return this.finalizeResolution(proposal.id, actorId, true, 'Direct Admin Resolution');
    }
};
exports.MediationService = MediationService;
exports.MediationService = MediationService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('mediation')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_service_1.ConfigService,
        bullmq_2.Queue])
], MediationService);
//# sourceMappingURL=mediation.service.js.map