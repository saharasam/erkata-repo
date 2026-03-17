import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/guards';
export declare class AdminsController {
    private prisma;
    constructor(prisma: PrismaService);
    getPersonnel(role?: UserRole): Promise<{
        id: string;
        isActive: boolean;
        _count: {
            operatorMatches: number;
            resolutionProposals: number;
        };
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }[]>;
    createInvite(req: AuthenticatedRequest, body: {
        email: string;
        role: UserRole;
        fullName: string;
    }): Promise<{
        message: string;
        inviteUrl: string;
        invite: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            token: string;
            expiresAt: Date;
            usedAt: Date | null;
            createdById: string;
        };
    }>;
    updateStatus(id: string, body: {
        isActive: boolean;
    }): Promise<{
        id: string;
        isActive: boolean;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        zoneId: string | null;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
        referredById: string | null;
        createdAt: Date;
    }>;
}
