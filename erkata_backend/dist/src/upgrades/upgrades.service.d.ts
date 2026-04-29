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
    createRequest(agentId: string, targetTier: Tier): Promise<{
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
    uploadProof(requestId: string, agentId: string, proofUrl: string): Promise<{
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
    getPendingForOperator(): Promise<({
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
    verifyRequest(requestId: string, operatorId: string, note: string): Promise<{
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
    getVerifiedForAdmin(): Promise<({
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
    approveRequest(requestId: string, adminId: string): Promise<{
        success: boolean;
    }>;
    rejectRequest(requestId: string, adminId: string, reason: string): Promise<{
        success: boolean;
    }>;
}
