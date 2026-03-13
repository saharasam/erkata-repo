import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';
export declare const TierPriority: Record<string, number>;
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentProfile(userId: string): Promise<{
        referrals: {
            id: string;
            createdAt: Date;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
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
            tier: import("@prisma/client").$Enums.Tier;
            referrerId: string;
            code: string;
        } | null;
    } & {
        id: string;
        zoneId: string | null;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        tier: import("@prisma/client").$Enums.Tier;
        isActive: boolean;
        walletBalance: Prisma.Decimal;
        referredById: string | null;
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
            tier: import("@prisma/client").$Enums.Tier;
            referrerId: string;
            code: string;
        } | null;
    } & {
        id: string;
        zoneId: string | null;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        tier: import("@prisma/client").$Enums.Tier;
        isActive: boolean;
        walletBalance: Prisma.Decimal;
        referredById: string | null;
    })[]>;
    assignZone(callerRole: UserRole, agentId: string, zoneId: string, woreda: string): Promise<{
        id: string;
        zoneId: string | null;
        woreda: string;
        createdAt: Date;
        agentId: string;
        kifleKetema: string;
    }>;
    private getZoneLimit;
    updateTier(callerRole: UserRole, agentId: string, tier: string): Promise<{
        id: string;
        createdAt: Date;
        tier: import("@prisma/client").$Enums.Tier;
        referrerId: string;
        code: string;
    }>;
    checkReferralEligibility(referrerId: string): Promise<boolean>;
    private getReferralLimit;
    suspendUser(callerRole: UserRole, userId: string): Promise<{
        id: string;
        zoneId: string | null;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        tier: import("@prisma/client").$Enums.Tier;
        isActive: boolean;
        walletBalance: Prisma.Decimal;
        referredById: string | null;
    }>;
    activateUser(callerRole: UserRole, userId: string): Promise<{
        id: string;
        zoneId: string | null;
        createdAt: Date;
        fullName: string;
        phone: string;
        role: import("@prisma/client").$Enums.UserRole;
        tier: import("@prisma/client").$Enums.Tier;
        isActive: boolean;
        walletBalance: Prisma.Decimal;
        referredById: string | null;
    }>;
}
