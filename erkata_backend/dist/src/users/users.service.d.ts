import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';
import { ConfigService } from '../common/config.service';
import { AglpService } from '../aglp/aglp.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare const TierPriority: Record<string, number>;
export declare class UsersService {
    private readonly prisma;
    private readonly aglpService;
    private readonly configService;
    private readonly notificationsGateway;
    constructor(prisma: PrismaService, aglpService: AglpService, configService: ConfigService, notificationsGateway: NotificationsGateway);
    getCurrentProfile(userId: string): Promise<{
        agentZones: {
            id: string;
            zoneId: string | null;
            createdAt: Date;
            agentId: string;
            woreda: string;
            kifleKetema: string;
        }[];
        referrals: {
            id: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        }[];
        package: {
            id: string;
            name: import(".prisma/client").$Enums.Tier;
            price: Prisma.Decimal;
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
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        zoneId: string | null;
        referredById: string | null;
        createdAt: Date;
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
    }>;
    getFinanceSummary(userId: string): Promise<{
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
    canModifyUser(callerRole: UserRole, targetRole: UserRole): boolean;
    getScopeFilter(userId: string, role: UserRole): Prisma.ProfileWhereInput;
    findAll(callerRole: UserRole, filters: {
        role?: UserRole;
        isActive?: boolean;
    }): Promise<({
        agentZones: ({
            zone: {
                id: string;
                createdAt: Date;
                name: string;
                type: string;
                metadata: Prisma.JsonValue | null;
            } | null;
        } & {
            id: string;
            zoneId: string | null;
            createdAt: Date;
            agentId: string;
            woreda: string;
            kifleKetema: string;
        })[];
        package: {
            id: string;
            name: import(".prisma/client").$Enums.Tier;
            price: Prisma.Decimal;
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
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        isActive: boolean;
        zoneId: string | null;
        referredById: string | null;
        createdAt: Date;
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
    })[]>;
    getAvailablePackages(): Promise<{
        id: string;
        name: import(".prisma/client").$Enums.Tier;
        price: Prisma.Decimal;
        referralSlots: number;
        zoneLimit: number;
        displayName: string;
    }[]>;
    assignZone(callerRole: UserRole, agentId: string, zoneId: string, woreda: string): Promise<{
        id: string;
        zoneId: string | null;
        createdAt: Date;
        agentId: string;
        woreda: string;
        kifleKetema: string;
    }>;
    private getZoneLimit;
    updateTier(callerRole: UserRole, agentId: string, tier: string): Promise<{
        id: string;
        tier: import(".prisma/client").$Enums.Tier;
        createdAt: Date;
        referrerId: string;
        code: string;
    }>;
    purchasePackage(agentId: string, tier: string, paymentMethod?: 'ETB' | 'AGLP'): Promise<{
        id: string;
        tier: import(".prisma/client").$Enums.Tier;
        createdAt: Date;
        referrerId: string;
        code: string;
    }>;
    private applyTierUpgrade;
    checkReferralEligibility(referrerId: string): Promise<boolean>;
    private getReferralLimit;
    suspendUser(callerRole: UserRole, userId: string): Promise<{
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
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
    }>;
    requestWithdrawal(userId: string, amountAglp: number, bankDetails: {
        bankName: string;
        bankAccountNumber: string;
        bankAccountHolder: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        amount: Prisma.Decimal;
        etbEquivalent: Prisma.Decimal | null;
        conversionRate: Prisma.Decimal | null;
        referenceId: string | null;
        referenceType: string | null;
        updatedAt: Date;
        bankAccountHolder: string | null;
        bankAccountNumber: string | null;
        bankName: string | null;
        profileId: string;
    }>;
    activateUser(callerRole: UserRole, userId: string): Promise<{
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
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
    }>;
    generateReferralCode(userId: string): Promise<{
        code: string;
        link: string;
    }>;
    findByReferralCode(code: string): Promise<{
        referrals: {
            id: string;
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
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
        missedAssignments: number;
        warningCount: number;
        avatarUrl: string | null;
    }>;
}
