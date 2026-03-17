import { MediationService } from './mediation.service';
import { FeedbackBundleState } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/guards';
export declare class MediationController {
    private readonly mediationService;
    constructor(mediationService: MediationService);
    submitFeedback(transactionId: string, req: AuthenticatedRequest, body: {
        content: string;
        rating: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        authorId: string;
        transactionId: string;
        content: string;
        rating: number;
    }>;
    proposeResolution(bundleId: string, req: AuthenticatedRequest, body: {
        proposedText: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        proposedById: string;
        proposedText: string;
        bundleId: string;
    }>;
    finalizeResolution(proposalId: string, req: AuthenticatedRequest, body: {
        approved: boolean;
        comment?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        finalizedById: string;
        approved: boolean;
        comment: string | null;
        proposalId: string;
    }>;
    finalizeBundle(bundleId: string, req: AuthenticatedRequest, body: {
        resolutionText: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        finalizedById: string;
        approved: boolean;
        comment: string | null;
        proposalId: string;
    }>;
    getBundles(state?: FeedbackBundleState): Promise<({
        [x: string]: ({
            id: string;
            createdAt: Date;
            proposedById: string;
            proposedText: string;
            bundleId: string;
        } | {
            id: string;
            createdAt: Date;
            proposedById: string;
            proposedText: string;
            bundleId: string;
        })[] | {
            id: string;
            createdAt: Date;
            proposedById: string;
            proposedText: string;
            bundleId: string;
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
