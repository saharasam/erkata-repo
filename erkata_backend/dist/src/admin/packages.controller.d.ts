import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AdminPackagesController {
    private prisma;
    constructor(prisma: PrismaService);
    getAllPackages(): Promise<{
        id: string;
        createdAt: Date;
        name: import(".prisma/client").$Enums.Tier;
        description: string | null;
        updatedAt: Date;
        price: Prisma.Decimal;
        referralSlots: number;
        zoneLimit: number;
        requiresApproval: boolean;
        displayName: string;
    }[]>;
    getPackage(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: import(".prisma/client").$Enums.Tier;
        description: string | null;
        updatedAt: Date;
        price: Prisma.Decimal;
        referralSlots: number;
        zoneLimit: number;
        requiresApproval: boolean;
        displayName: string;
    }>;
    updatePackage(id: string, data: {
        displayName?: string;
        price?: number;
        referralSlots?: number;
        zoneLimit?: number;
        description?: string;
        requiresApproval?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: import(".prisma/client").$Enums.Tier;
        description: string | null;
        updatedAt: Date;
        price: Prisma.Decimal;
        referralSlots: number;
        zoneLimit: number;
        requiresApproval: boolean;
        displayName: string;
    }>;
}
