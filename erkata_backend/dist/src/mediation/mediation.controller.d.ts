import { MediationService } from './mediation.service';
import { FeedbackBundleState } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/guards';
export declare class MediationController {
    private readonly mediationService;
    constructor(mediationService: MediationService);
    submitFeedback(transactionId: string, req: AuthenticatedRequest, body: {
        content: string;
        rating: number;
        categories?: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        transactionId: string;
        authorId: string;
        content: string;
        rating: number;
        categories: string[];
    }>;
    proposeResolution(bundleId: string, req: AuthenticatedRequest, body: {
        proposedText: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        proposedText: string;
        bundleId: string;
        proposedById: string;
    }>;
    finalizeResolution(proposalId: string, req: AuthenticatedRequest, body: {
        approved: boolean;
        comment?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        approved: boolean;
        comment: string | null;
        proposalId: string;
        finalizedById: string;
    }>;
    finalizeBundle(bundleId: string, req: AuthenticatedRequest, body: {
        resolutionText: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        approved: boolean;
        comment: string | null;
        proposalId: string;
        finalizedById: string;
    }>;
    getBundles(state?: FeedbackBundleState): Promise<({
        [x: string]: ({
            id: string;
            createdAt: Date;
            proposedText: string;
            bundleId: string;
            proposedById: string;
        } | {
            id: string;
            createdAt: Date;
            proposedText: string;
            bundleId: string;
            proposedById: string;
        })[] | {
            id: string;
            createdAt: Date;
            proposedText: string;
            bundleId: string;
            proposedById: string;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: string;
        createdAt: Date;
        transactionId: string;
        state: import(".prisma/client").$Enums.FeedbackBundleState;
        stateHistory: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
