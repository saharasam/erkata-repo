import { PrismaService } from '../prisma/prisma.service';
import { FeedbackBundleState } from '@prisma/client';
import { Queue } from 'bullmq';
import { ConfigService } from '../common/config.service';
export declare class MediationService {
    private prisma;
    private config;
    private mediationQueue;
    constructor(prisma: PrismaService, config: ConfigService, mediationQueue: Queue);
    submitFeedback(transactionId: string, authorId: string, content: string, rating: number, categories?: string[]): Promise<{
        id: string;
        transactionId: string;
        createdAt: Date;
        rating: number;
        authorId: string;
        comment: string | null;
        categories: string[];
        content: string;
    }>;
    private checkAndBundle;
    proposeResolution(bundleId: string, adminId: string, proposedText: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        matchId: string | null;
        proposedText: string;
        bundleId: string;
        proposedById: string;
    }>;
    finalizeResolution(proposalId: string, actorId: string, approved: boolean, comment?: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        comment: string | null;
        approved: boolean;
        finalDecision: string | null;
        proposalId: string;
        finalizedById: string;
    }>;
    escalateToSuperAdmin(bundleId: string, adminId: string, reason: string): Promise<{
        escalated: boolean;
    }>;
    overrideResolution(resolutionId: string, superAdminId: string, newApproved: boolean, comment: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        comment: string | null;
        approved: boolean;
        finalDecision: string | null;
        proposalId: string;
        finalizedById: string;
    }>;
    getBundles(state?: FeedbackBundleState): Promise<({
        [x: string]: ({
            id: string;
            createdAt: Date;
            status: string;
            matchId: string | null;
            proposedText: string;
            bundleId: string;
            proposedById: string;
        } | {
            id: string;
            createdAt: Date;
            status: string;
            matchId: string | null;
            proposedText: string;
            bundleId: string;
            proposedById: string;
        })[] | {
            id: string;
            createdAt: Date;
            status: string;
            matchId: string | null;
            proposedText: string;
            bundleId: string;
            proposedById: string;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: string;
        transactionId: string;
        createdAt: Date;
        state: import(".prisma/client").$Enums.FeedbackBundleState;
        stateHistory: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    finalizeBundleDirectly(bundleId: string, actorId: string, resolutionText: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        comment: string | null;
        approved: boolean;
        finalDecision: string | null;
        proposalId: string;
        finalizedById: string;
    }>;
}
