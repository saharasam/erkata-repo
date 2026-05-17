import { PrismaService } from '../prisma/prisma.service';
import { Tier } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UsersService } from '../users/users.service';
export declare class UpgradesService {
    private prisma;
    private notifications;
    private usersService;
    constructor(prisma: PrismaService, notifications: NotificationsGateway, usersService: UsersService);
    getActiveRequestForUser(agentId: string): Promise<{
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
    createRequest(agentId: string, targetTier: Tier): Promise<{
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
    uploadProof(requestId: string, agentId: string, proofUrl: string): Promise<{
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
    getPendingForOperator(): Promise<({
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
    verifyRequest(requestId: string, operatorId: string, note: string): Promise<{
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
    getVerifiedForAdmin(): Promise<({
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
    approveRequest(requestId: string, adminId: string): Promise<{
        success: boolean;
    }>;
    rejectRequest(requestId: string, adminId: string, reason: string): Promise<{
        success: boolean;
    }>;
}
