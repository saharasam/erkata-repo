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
        createdAt: Date;
        agentId: string;
        operatorId: string | null;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        updatedAt: Date;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        proofUrl: string | null;
        internalNote: string | null;
        adminId: string | null;
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
        createdAt: Date;
        agentId: string;
        operatorId: string | null;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        updatedAt: Date;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        proofUrl: string | null;
        internalNote: string | null;
        adminId: string | null;
    })[]>;
    getVerifiedRequests(): Promise<({
        operator: {
            id: string;
            fullName: string;
        } | null;
        agent: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        agentId: string;
        operatorId: string | null;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        updatedAt: Date;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        proofUrl: string | null;
        internalNote: string | null;
        adminId: string | null;
    })[]>;
    createRequest(req: AuthenticatedRequest, body: {
        targetTier: Tier;
    }): Promise<{
        id: string;
        createdAt: Date;
        agentId: string;
        operatorId: string | null;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        updatedAt: Date;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        proofUrl: string | null;
        internalNote: string | null;
        adminId: string | null;
    }>;
    uploadProof(req: AuthenticatedRequest, id: string, body: {
        proofUrl: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        agentId: string;
        operatorId: string | null;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        updatedAt: Date;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        proofUrl: string | null;
        internalNote: string | null;
        adminId: string | null;
    }>;
    verifyRequest(req: AuthenticatedRequest, id: string, body: {
        internalNote: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        agentId: string;
        operatorId: string | null;
        status: import(".prisma/client").$Enums.UpgradeRequestStatus;
        updatedAt: Date;
        currentTier: import(".prisma/client").$Enums.Tier;
        targetTier: import(".prisma/client").$Enums.Tier;
        proofUrl: string | null;
        internalNote: string | null;
        adminId: string | null;
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
