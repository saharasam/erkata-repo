import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AdminPackagesController {
    private prisma;
    constructor(prisma: PrismaService);
    getAllPackages(): Promise<{
        id: string;
        name: import(".prisma/client").$Enums.Tier;
        price: Prisma.Decimal;
        referralSlots: number;
        zoneLimit: number;
        displayName: string;
    }[]>;
    getPackage(id: string): Promise<{
        id: string;
        name: import(".prisma/client").$Enums.Tier;
        price: Prisma.Decimal;
        referralSlots: number;
        zoneLimit: number;
        displayName: string;
    }>;
    updatePackage(id: string, data: {
        displayName?: string;
        price?: number;
        referralSlots?: number;
        zoneLimit?: number;
    }): Promise<{
        id: string;
        name: import(".prisma/client").$Enums.Tier;
        price: Prisma.Decimal;
        referralSlots: number;
        zoneLimit: number;
        displayName: string;
    }>;
}
