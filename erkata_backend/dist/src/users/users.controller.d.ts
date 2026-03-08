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
                isActive: boolean;
                city: string | null;
            } | null;
        } & {
            id: string;
            zoneId: string | null;
            woreda: string;
            createdAt: Date;
            agentId: string;
            kifleKetema: string;
        })[];
        referralLink: {
            id: string;
            createdAt: Date;
            tier: import(".prisma/client").$Enums.Tier;
            referrerId: string;
            code: string;
        } | null;
    } & {
        id: string;
        zoneId: string | null;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
        referredById: string | null;
    })[]>;
    getMe(req: AuthenticatedRequest): Promise<{
        referrals: {
            id: string;
            createdAt: Date;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        agentZones: {
            id: string;
            zoneId: string | null;
            woreda: string;
            createdAt: Date;
            agentId: string;
            kifleKetema: string;
        }[];
        referralLink: {
            id: string;
            createdAt: Date;
            tier: import(".prisma/client").$Enums.Tier;
            referrerId: string;
            code: string;
        } | null;
    } & {
        id: string;
        zoneId: string | null;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
        referredById: string | null;
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
        woreda: string;
        createdAt: Date;
        agentId: string;
        kifleKetema: string;
    }>;
    updateTier(req: AuthenticatedRequest, agentId: string, body: {
        tier: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        tier: import(".prisma/client").$Enums.Tier;
        referrerId: string;
        code: string;
    }>;
    suspendUser(req: AuthenticatedRequest, userId: string): Promise<{
        id: string;
        zoneId: string | null;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
        referredById: string | null;
    }>;
    activateUser(req: AuthenticatedRequest, userId: string): Promise<{
        id: string;
        zoneId: string | null;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
        referredById: string | null;
    }>;
}
