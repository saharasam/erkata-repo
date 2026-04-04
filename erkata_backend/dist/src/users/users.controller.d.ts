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
            zoneId: string | null;
            createdAt: Date;
            agentId: string;
            kifleKetema: string;
            woreda: string;
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
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        tier: import(".prisma/client").$Enums.Tier;
        zoneId: string | null;
        referredById: string | null;
        createdAt: Date;
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
            zoneId: string | null;
            createdAt: Date;
            agentId: string;
            kifleKetema: string;
            woreda: string;
        }[];
        referrals: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            fullName: string;
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
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        tier: import(".prisma/client").$Enums.Tier;
        zoneId: string | null;
        referredById: string | null;
        createdAt: Date;
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
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        etbEquivalent: import("@prisma/client/runtime/library").Decimal | null;
        conversionRate: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        referenceId: string | null;
        referenceType: string | null;
        updatedAt: Date;
        profileId: string;
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
        zoneId: string | null;
        createdAt: Date;
        agentId: string;
        kifleKetema: string;
        woreda: string;
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
    purchasePackage(req: AuthenticatedRequest, body: {
        tier: string;
        paymentMethod?: 'ETB' | 'AGLP';
    }): Promise<{
        id: string;
        tier: import(".prisma/client").$Enums.Tier;
        createdAt: Date;
        referrerId: string;
        code: string;
    }>;
    suspendUser(req: AuthenticatedRequest, userId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        tier: import(".prisma/client").$Enums.Tier;
        zoneId: string | null;
        referredById: string | null;
        createdAt: Date;
        aglpBalance: import("@prisma/client/runtime/library").Decimal;
        aglpPending: import("@prisma/client/runtime/library").Decimal;
        aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    }>;
    activateUser(req: AuthenticatedRequest, userId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        tier: import(".prisma/client").$Enums.Tier;
        zoneId: string | null;
        referredById: string | null;
        createdAt: Date;
        aglpBalance: import("@prisma/client/runtime/library").Decimal;
        aglpPending: import("@prisma/client/runtime/library").Decimal;
        aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    }>;
}
