import { PrismaService } from '../prisma/prisma.service';
import { AglpTransactionStatus, AglpTransactionType } from '@prisma/client';
import { AglpService } from '../aglp/aglp.service';
export declare class PayoutsController {
    private prisma;
    private aglpService;
    constructor(prisma: PrismaService, aglpService: AglpService);
    getPendingPayouts(limit?: number, offset?: number): Promise<({
        profile: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
        };
    } & {
        updatedAt: Date;
        bankName: string | null;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        etbEquivalent: import("@prisma/client/runtime/library").Decimal | null;
        conversionRate: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        referenceId: string | null;
        referenceType: string | null;
        bankAccountHolder: string | null;
        bankAccountNumber: string | null;
        profileId: string;
    })[]>;
    approvePayout(id: string): Promise<void>;
    rejectPayout(id: string, reason: string): Promise<void>;
    getGlobalLedger(type?: AglpTransactionType, status?: AglpTransactionStatus, profileId?: string, limit?: number, offset?: number): Promise<({
        profile: {
            id: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        updatedAt: Date;
        bankName: string | null;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        etbEquivalent: import("@prisma/client/runtime/library").Decimal | null;
        conversionRate: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        referenceId: string | null;
        referenceType: string | null;
        bankAccountHolder: string | null;
        bankAccountNumber: string | null;
        profileId: string;
    })[]>;
}
