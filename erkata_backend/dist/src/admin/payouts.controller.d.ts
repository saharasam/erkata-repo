import { PrismaService } from '../prisma/prisma.service';
import { AglpTransactionStatus, AglpTransactionType } from '@prisma/client';
import { AglpService } from '../aglp/aglp.service';
export declare class PayoutsController {
    private prisma;
    private aglpService;
    constructor(prisma: PrismaService, aglpService: AglpService);
    getPendingPayouts(): Promise<({
        profile: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
        };
    } & {
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
    })[]>;
    approvePayout(id: string): Promise<{
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
    rejectPayout(id: string, reason: string): Promise<void>;
    getPendingEscrow(): Promise<({
        profile: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
        };
    } & {
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
    })[]>;
    releaseEscrow(id: string): Promise<void>;
    getGlobalLedger(type?: AglpTransactionType, status?: AglpTransactionStatus, profileId?: string): Promise<({
        profile: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            fullName: string;
        };
    } & {
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
    })[]>;
}
