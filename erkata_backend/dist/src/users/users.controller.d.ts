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
                isActive: boolean;
                name: string;
                city: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            zoneId: string | null;
            agentId: string;
            woreda: string;
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
        createdAt: Date;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        zoneId: string | null;
        referredById: string | null;
        aglpBalance: import("@prisma/client/runtime/library").Decimal;
        aglpPending: import("@prisma/client/runtime/library").Decimal;
        aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    })[]>;
    getMe(req: AuthenticatedRequest): Promise<{
        agentZones: {
            id: string;
            createdAt: Date;
            zoneId: string | null;
            agentId: string;
            woreda: string;
            kifleKetema: string;
        }[];
        referrals: {
            id: string;
            createdAt: Date;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
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
        createdAt: Date;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        zoneId: string | null;
        referredById: string | null;
        aglpBalance: import("@prisma/client/runtime/library").Decimal;
        aglpPending: import("@prisma/client/runtime/library").Decimal;
        aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    }>;
    getFinance(req: AuthenticatedRequest): Promise<{
        balance: string;
        aglpAvailable: string;
        aglpPending: string;
        aglpWithdrawn: string;
        usedSlots: number;
        totalSlots: number;
        usedZones: number;
        totalZones: number;
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
    requestWithdrawal(req: AuthenticatedRequest, amount: number): Promise<{
        id: string;
        profileId: string;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        etbEquivalent: import("@prisma/client/runtime/library").Decimal | null;
        conversionRate: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        referenceId: string | null;
        referenceType: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateReferralCode(req: AuthenticatedRequest): Promise<{
        code: string;
        link: string;
    }>;
    assignZone(req: AuthenticatedRequest, agentId: string, body: {
        zoneId: string;
        woreda: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        zoneId: string | null;
        agentId: string;
        woreda: string;
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
    purchasePackage(req: AuthenticatedRequest, body: {
        tier: string;
        paymentMethod?: 'ETB' | 'AGLP';
    }): Promise<{
        id: string;
        createdAt: Date;
        tier: import(".prisma/client").$Enums.Tier;
        referrerId: string;
        code: string;
    }>;
    suspendUser(req: AuthenticatedRequest, userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        zoneId: string | null;
        referredById: string | null;
        aglpBalance: import("@prisma/client/runtime/library").Decimal;
        aglpPending: import("@prisma/client/runtime/library").Decimal;
        aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    }>;
    activateUser(req: AuthenticatedRequest, userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        zoneId: string | null;
        referredById: string | null;
        aglpBalance: import("@prisma/client/runtime/library").Decimal;
        aglpPending: import("@prisma/client/runtime/library").Decimal;
        aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    }>;
}
