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
                createdAt: Date;
                name: string;
                type: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
        } & {
            id: string;
            zoneId: string | null;
            createdAt: Date;
            agentId: string;
            kifleKetema: string;
            woreda: string;
        })[];
        package: {
            id: string;
            name: import(".prisma/client").$Enums.Tier;
            price: import("@prisma/client/runtime/library").Decimal;
            referralSlots: number;
            zoneLimit: number;
            displayName: string;
        };
        referralLink: {
            id: string;
            tier: import(".prisma/client").$Enums.Tier;
            createdAt: Date;
            referrerId: string;
            code: string;
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
        tinNumber: string | null;
        tradeLicenseNumber: string | null;
        isVerified: boolean;
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
            tier: import(".prisma/client").$Enums.Tier;
            createdAt: Date;
            package: {
                displayName: string;
            };
        }[];
        package: {
            id: string;
            name: import(".prisma/client").$Enums.Tier;
            price: import("@prisma/client/runtime/library").Decimal;
            referralSlots: number;
            zoneLimit: number;
            displayName: string;
        };
        referralLink: {
            id: string;
            tier: import(".prisma/client").$Enums.Tier;
            createdAt: Date;
            referrerId: string;
            code: string;
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
        tinNumber: string | null;
        tradeLicenseNumber: string | null;
        isVerified: boolean;
    }>;
    getFinance(req: AuthenticatedRequest): Promise<{
        balance: number;
        aglpAvailable: number;
        aglpPending: number;
        aglpWithdrawn: number;
        usedSlots: number;
        totalSlots: number;
        usedZones: number;
        totalZones: number;
        currentTier: string;
        tier: import(".prisma/client").$Enums.Tier;
        packageDisplayName: string;
        nextTier: string;
        weeklyGrowth: {
            percentage: string;
            amount: number;
            chart: number[];
        };
        totalEarnings: number;
        history: {
            id: string;
            action: string;
            amount: number;
            type: string;
            createdAt: Date;
            metadata: {
                transactionId: string;
                amount?: number;
                amountAglp?: number;
                amountEtb?: number;
                aglpTxId?: string;
                referenceId?: string;
                reason?: string;
            };
        }[];
    }>;
    getAvailablePackages(): Promise<{
        id: string;
        name: import(".prisma/client").$Enums.Tier;
        price: import("@prisma/client/runtime/library").Decimal;
        referralSlots: number;
        zoneLimit: number;
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
        profileId: string;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        etbEquivalent: import("@prisma/client/runtime/library").Decimal | null;
        conversionRate: import("@prisma/client/runtime/library").Decimal | null;
        referenceId: string | null;
        referenceType: string | null;
        updatedAt: Date;
        bankAccountHolder: string | null;
        bankAccountNumber: string | null;
        bankName: string | null;
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
        tinNumber: string | null;
        tradeLicenseNumber: string | null;
        isVerified: boolean;
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
        tinNumber: string | null;
        tradeLicenseNumber: string | null;
        isVerified: boolean;
    }>;
    updateBusinessProfile(req: AuthenticatedRequest, body: {
        tinNumber: string;
        tradeLicenseNumber: string;
    }): Promise<{
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
        tinNumber: string | null;
        tradeLicenseNumber: string | null;
        isVerified: boolean;
    }>;
    getUserProfile(userId: string): Promise<{
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
            tier: import(".prisma/client").$Enums.Tier;
            createdAt: Date;
            package: {
                displayName: string;
            };
        }[];
        package: {
            id: string;
            name: import(".prisma/client").$Enums.Tier;
            price: import("@prisma/client/runtime/library").Decimal;
            referralSlots: number;
            zoneLimit: number;
            displayName: string;
        };
        referralLink: {
            id: string;
            tier: import(".prisma/client").$Enums.Tier;
            createdAt: Date;
            referrerId: string;
            code: string;
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
        tinNumber: string | null;
        tradeLicenseNumber: string | null;
        isVerified: boolean;
    }>;
    getUserFinance(userId: string): Promise<{
        balance: number;
        aglpAvailable: number;
        aglpPending: number;
        aglpWithdrawn: number;
        usedSlots: number;
        totalSlots: number;
        usedZones: number;
        totalZones: number;
        currentTier: string;
        tier: import(".prisma/client").$Enums.Tier;
        packageDisplayName: string;
        nextTier: string;
        weeklyGrowth: {
            percentage: string;
            amount: number;
            chart: number[];
        };
        totalEarnings: number;
        history: {
            id: string;
            action: string;
            amount: number;
            type: string;
            createdAt: Date;
            metadata: {
                transactionId: string;
                amount?: number;
                amountAglp?: number;
                amountEtb?: number;
                aglpTxId?: string;
                referenceId?: string;
                reason?: string;
            };
        }[];
    }>;
}
