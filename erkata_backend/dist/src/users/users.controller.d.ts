import { UsersService } from './users.service';
import type { AuthenticatedRequest } from '../auth/guards';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUsers(req: AuthenticatedRequest, role?: UserRole, isActive?: string): Promise<({
        agentZones: ({
            zone: {
                id: string;
                name: string;
                city: string | null;
                isActive: boolean;
            } | null;
        } & {
            id: string;
            zoneId: string | null;
            createdAt: Date;
            woreda: string;
            agentId: string;
            kifleKetema: string;
        })[];
        referralLink: {
            id: string;
            tier: import(".prisma/client").$Enums.Tier;
            createdAt: Date;
            referrerId: string;
            code: string;
        } | null;
    } & {
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
    })[]>;
    getMe(req: AuthenticatedRequest): Promise<{
        agentZones: {
            id: string;
            zoneId: string | null;
            createdAt: Date;
            woreda: string;
            agentId: string;
            kifleKetema: string;
        }[];
        referrals: {
            id: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        }[];
        referralLink: {
            id: string;
            tier: import(".prisma/client").$Enums.Tier;
            createdAt: Date;
            referrerId: string;
            code: string;
        } | null;
    } & {
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
    getFinance(req: AuthenticatedRequest): Promise<{
        balance: string;
        usedSlots: number;
        totalSlots: number;
        currentTier: string;
        nextTier: string;
        history: {
            id: string;
            action: string;
            amount: string;
            type: string;
            date: Date;
            description: string;
        }[];
    }>;
    assignZone(req: AuthenticatedRequest, agentId: string, body: {
        zoneId: string;
        woreda: string;
    }): Promise<{
        id: string;
        zoneId: string | null;
        createdAt: Date;
        woreda: string;
        agentId: string;
        kifleKetema: string;
    }>;
    updateTier(req: AuthenticatedRequest, agentId: string, body: {
        tier: string;
    }): Promise<{
        id: string;
        tier: import(".prisma/client").$Enums.Tier;
        createdAt: Date;
        referrerId: string;
        code: string;
    }>;
    suspendUser(req: AuthenticatedRequest, userId: string): Promise<{
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
    activateUser(req: AuthenticatedRequest, userId: string): Promise<{
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
