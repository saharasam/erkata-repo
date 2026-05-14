import { UsersService } from './users.service';
import type { AuthenticatedRequest } from '../auth/guards';
import { UserRole } from '@prisma/client';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUsers(req: AuthenticatedRequest, role?: UserRole, isActive?: string): Promise<({
        agentZones: ({
            zone: {
                id: string;
                createdAt: Date;
                name: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                type: string;
            } | null;
        } & {
            id: string;
            zoneId: string | null;
            createdAt: Date;
            agentId: string;
            kifleKetema: string;
            woreda: string;
        })[];
        referredBy: {
            id: string;
            fullName: string;
        } | null;
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
        performanceStats: import("./users.service").PerformanceStats;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        lastLoginDevice: string | null;
        agentZones: ({
            zone: {
                id: string;
                createdAt: Date;
                name: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                type: string;
            } | null;
        } & {
            id: string;
            zoneId: string | null;
            createdAt: Date;
            agentId: string;
            kifleKetema: string;
            woreda: string;
        })[];
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
        _count: {
            finalResolutions: number;
            agentMatches: number;
            operatorMatches: number;
            proposals: number;
        };
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
        aglpPendingWithdrawals: number;
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
                amountAglp: number;
                transactionId: string;
                amount?: number;
                amountEtb?: number;
                aglpTxId?: string;
                referenceId?: string;
                reason?: string;
                ip?: string;
                userAgent?: string;
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
    requestWithdrawal(req: AuthenticatedRequest, body: WithdrawalDto): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        profileId: string;
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
    updateBusinessProfile(req: AuthenticatedRequest, body: UpdateBusinessProfileDto): Promise<{
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
    getUserProfile(req: AuthenticatedRequest, userId: string): Promise<{
        performanceStats: import("./users.service").PerformanceStats;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        lastLoginDevice: string | null;
        agentZones: ({
            zone: {
                id: string;
                createdAt: Date;
                name: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                type: string;
            } | null;
        } & {
            id: string;
            zoneId: string | null;
            createdAt: Date;
            agentId: string;
            kifleKetema: string;
            woreda: string;
        })[];
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
        _count: {
            finalResolutions: number;
            agentMatches: number;
            operatorMatches: number;
            proposals: number;
        };
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
        aglpPendingWithdrawals: number;
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
                amountAglp: number;
                transactionId: string;
                amount?: number;
                amountEtb?: number;
                aglpTxId?: string;
                referenceId?: string;
                reason?: string;
                ip?: string;
                userAgent?: string;
            };
        }[];
    }>;
}
