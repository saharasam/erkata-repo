import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/guards';
import { InviteService } from '../auth/invite/invite.service';
export declare class AdminsController {
    private prisma;
    private inviteService;
    private usersService;
    constructor(prisma: PrismaService, inviteService: InviteService, usersService: UsersService);
    getPersonnel(role?: string): Promise<{
        id: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        missedAssignments: number;
        _count: {
            operatorMatches: number;
            proposals: number;
        };
    }[]>;
    createInvite(req: AuthenticatedRequest, body: {
        email: string;
        fullName: string;
        phone: string;
        role: UserRole;
    }): Promise<{
        message: string;
        inviteUrl: string;
        invite: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            token: string;
            expiresAt: Date;
            usedAt: Date | null;
            createdById: string;
        };
    }>;
    getInvites(req: AuthenticatedRequest): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdById: string;
    }[]>;
    cancelInvite(req: AuthenticatedRequest, inviteId: string): Promise<{
        message: string;
    }>;
    updateStatus(req: AuthenticatedRequest, id: string, body: {
        isActive: boolean;
    }): Promise<{
        id: string;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        zoneId: string | null;
        referredById: string | null;
        createdAt: Date;
        aglpBalance: import("@prisma/client/runtime/library").Decimal;
        aglpPending: import("@prisma/client/runtime/library").Decimal;
        aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
    }>;
}
