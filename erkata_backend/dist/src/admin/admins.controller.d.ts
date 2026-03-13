import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/guards';
export declare class AdminsController {
    private prisma;
    constructor(prisma: PrismaService);
    getPersonnel(role?: UserRole): Promise<{
        id: string;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
        _count: {
            operatorMatches: number;
            resolutionProposals: number;
        };
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
            createdAt: Date;
            role: import("@prisma/client").$Enums.UserRole;
            email: string;
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
        zoneId: string | null;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        tier: import("@prisma/client").$Enums.Tier;
        isActive: boolean;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
        referredById: string | null;
    }>;
}
