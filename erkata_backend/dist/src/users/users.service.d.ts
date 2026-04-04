import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';
import { ConfigService } from '../common/config.service';
import { AglpService } from '../aglp/aglp.service';
export declare const TierPriority: Record<string, number>;
export declare class UsersService {
    private readonly prisma;
    private readonly aglpService;
    private readonly configService;
    constructor(prisma: PrismaService, aglpService: AglpService, configService: ConfigService);
    getCurrentProfile(userId: string): Promise<{
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
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    }>;
    getFinanceSummary(userId: string): Promise<{
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
    canModifyUser(callerRole: UserRole, targetRole: UserRole): boolean;
    getScopeFilter(userId: string, role: UserRole): Prisma.ProfileWhereInput;
    findAll(callerRole: UserRole, filters: {
        role?: UserRole;
        isActive?: boolean;
    }): Promise<({
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
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    })[]>;
    assignZone(callerRole: UserRole, agentId: string, zoneId: string, woreda: string): Promise<{
        id: string;
        createdAt: Date;
        zoneId: string | null;
        agentId: string;
        woreda: string;
        kifleKetema: string;
    }>;
    private getZoneLimit;
    updateTier(callerRole: UserRole, agentId: string, tier: string): Promise<{
        id: string;
        createdAt: Date;
        tier: import(".prisma/client").$Enums.Tier;
        referrerId: string;
        code: string;
    }>;
    purchasePackage(agentId: string, tier: string, paymentMethod?: 'ETB' | 'AGLP'): Promise<{
        id: string;
        createdAt: Date;
        tier: import(".prisma/client").$Enums.Tier;
        referrerId: string;
        code: string;
    }>;
    private applyTierUpgrade;
    checkReferralEligibility(referrerId: string): Promise<boolean>;
    private getReferralLimit;
    suspendUser(callerRole: UserRole, userId: string): Promise<{
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
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    }>;
    requestWithdrawal(userId: string, amountAglp: number): Promise<{
        id: string;
        profileId: string;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        amount: Prisma.Decimal;
        etbEquivalent: Prisma.Decimal | null;
        conversionRate: Prisma.Decimal | null;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        referenceId: string | null;
        referenceType: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    activateUser(callerRole: UserRole, userId: string): Promise<{
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
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
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
        aglpBalance: Prisma.Decimal;
        aglpPending: Prisma.Decimal;
        aglpWithdrawn: Prisma.Decimal;
        referralCode: string | null;
        isOnline: boolean;
        lastAssignmentAt: Date | null;
    }>;
}
