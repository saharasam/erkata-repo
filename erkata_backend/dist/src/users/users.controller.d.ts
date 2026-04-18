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
        package: {
            id: string;
            createdAt: Date;
            name: import(".prisma/client").$Enums.Tier;
            price: import("@prisma/client/runtime/library").Decimal;
            referralSlots: number;
            zoneLimit: number;
            description: string | null;
            requiresApproval: boolean;
            updatedAt: Date;
            displayName: string;
        } | null;
    } & {
        id: string;
        email: string;
        referralCode: string | null;
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
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
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
        package: {
            id: string;
            createdAt: Date;
            name: import(".prisma/client").$Enums.Tier;
            price: import("@prisma/client/runtime/library").Decimal;
            referralSlots: number;
            zoneLimit: number;
            description: string | null;
            requiresApproval: boolean;
            updatedAt: Date;
            displayName: string;
        } | null;
    } & {
        id: string;
        email: string;
        referralCode: string | null;
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
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
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
        tier: import(".prisma/client").$Enums.Tier;
        packageDisplayName: string | undefined;
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
    getAvailablePackages(): Promise<{
        id: string;
        createdAt: Date;
        name: import(".prisma/client").$Enums.Tier;
        price: import("@prisma/client/runtime/library").Decimal;
        referralSlots: number;
        zoneLimit: number;
        description: string | null;
        requiresApproval: boolean;
        updatedAt: Date;
        displayName: string;
    }[]>;
    requestWithdrawal(req: AuthenticatedRequest, body: {
        amount: number;
        bankName: string;
        bankAccountNumber: string;
        bankAccountHolder: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        etbEquivalent: import("@prisma/client/runtime/library").Decimal | null;
        conversionRate: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        referenceId: string | null;
        referenceType: string | null;
        bankName: string | null;
        bankAccountNumber: string | null;
        bankAccountHolder: string | null;
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
        email: string;
        referralCode: string | null;
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
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
    }>;
    activateUser(req: AuthenticatedRequest, userId: string): Promise<{
        id: string;
        email: string;
        referralCode: string | null;
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
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
    }>;
}
