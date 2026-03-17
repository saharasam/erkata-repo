import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';
export declare const TierPriority: Record<string, number>;
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentProfile(userId: string): Promise<{
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
        walletBalance: Prisma.Decimal;
        referredById: string | null;
        createdAt: Date;
    }>;
    getFinanceSummary(userId: string): Promise<{
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
    canModifyUser(callerRole: UserRole, targetRole: UserRole): boolean;
    getScopeFilter(userId: string, role: UserRole): Prisma.ProfileWhereInput;
    findAll(callerRole: UserRole, filters: {
        role?: UserRole;
        isActive?: boolean;
    }): Promise<({
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
        walletBalance: Prisma.Decimal;
        referredById: string | null;
        createdAt: Date;
    })[]>;
    assignZone(callerRole: UserRole, agentId: string, zoneId: string, woreda: string): Promise<{
        id: string;
        zoneId: string | null;
        createdAt: Date;
        woreda: string;
        agentId: string;
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
    checkReferralEligibility(referrerId: string): Promise<boolean>;
    private getReferralLimit;
    suspendUser(callerRole: UserRole, userId: string): Promise<{
        id: string;
        isActive: boolean;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        zoneId: string | null;
        walletBalance: Prisma.Decimal;
        referredById: string | null;
        createdAt: Date;
    }>;
    activateUser(callerRole: UserRole, userId: string): Promise<{
        id: string;
        isActive: boolean;
        email: string;
        passwordHash: string | null;
        fullName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        tier: import(".prisma/client").$Enums.Tier;
        zoneId: string | null;
        walletBalance: Prisma.Decimal;
        referredById: string | null;
        createdAt: Date;
    }>;
}
