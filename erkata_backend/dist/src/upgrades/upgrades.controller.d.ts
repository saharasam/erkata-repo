import { UpgradesService } from './upgrades.service';
import { ConfigService } from '../common/config.service';
import type { AuthenticatedRequest } from '../auth/guards';
import { Tier } from '@prisma/client';
export declare class UpgradesController {
    private readonly upgradesService;
    private readonly configService;
    constructor(upgradesService: UpgradesService, configService: ConfigService);
    getMyActiveRequest(req: AuthenticatedRequest): Promise<{
        id: string;
        agentId: string;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        proofUrl: string | null;
        internalNote: string | null;
        operatorId: string | null;
        adminId: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getBankDetails(): Promise<unknown>;
    getPendingRequests(): Promise<({
        agent: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
        };
    } & {
        id: string;
        agentId: string;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        proofUrl: string | null;
        internalNote: string | null;
        operatorId: string | null;
        adminId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getVerifiedRequests(): Promise<({
        agent: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
        };
        operator: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        agentId: string;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        proofUrl: string | null;
        internalNote: string | null;
        operatorId: string | null;
        adminId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createRequest(req: AuthenticatedRequest, body: {
        targetTier: Tier;
    }): Promise<{
        id: string;
        agentId: string;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        proofUrl: string | null;
        internalNote: string | null;
        operatorId: string | null;
        adminId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadProof(req: AuthenticatedRequest, id: string, body: {
        proofUrl: string;
    }): Promise<{
        id: string;
        agentId: string;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        proofUrl: string | null;
        internalNote: string | null;
        operatorId: string | null;
        adminId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    verifyRequest(req: AuthenticatedRequest, id: string, body: {
        internalNote: string;
    }): Promise<{
        id: string;
        agentId: string;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        proofUrl: string | null;
        internalNote: string | null;
        operatorId: string | null;
        adminId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    approveRequest(req: AuthenticatedRequest, id: string): Promise<{
        success: boolean;
    }>;
    rejectRequest(req: AuthenticatedRequest, id: string, body: {
        reason: string;
    }): Promise<{
        success: boolean;
    }>;
}
