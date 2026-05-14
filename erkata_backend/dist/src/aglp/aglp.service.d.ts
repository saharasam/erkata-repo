import { ConfigService } from '../common/config.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AglpService {
    private readonly prisma;
    private readonly configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    private lockProfile;
    getConversionRate(): number;
    depositEtb(tx: Prisma.TransactionClient, profileId: string, amountEtb: number, referenceId?: string, referenceType?: string): Promise<{
        updatedAt: Date;
        bankName: string | null;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        amount: Prisma.Decimal;
        etbEquivalent: Prisma.Decimal | null;
        conversionRate: Prisma.Decimal | null;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        referenceId: string | null;
        referenceType: string | null;
        bankAccountHolder: string | null;
        bankAccountNumber: string | null;
        profileId: string;
    }>;
    spendAglpForPackage(tx: Prisma.TransactionClient, profileId: string, amountAglp: number, packageId: string): Promise<{
        updatedAt: Date;
        bankName: string | null;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        amount: Prisma.Decimal;
        etbEquivalent: Prisma.Decimal | null;
        conversionRate: Prisma.Decimal | null;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        referenceId: string | null;
        referenceType: string | null;
        bankAccountHolder: string | null;
        bankAccountNumber: string | null;
        profileId: string;
    }>;
    earnCommission(tx: Prisma.TransactionClient, profileId: string, amountEtb: number, referenceId: string, reason: string): Promise<void>;
    withdrawAglp(tx: Prisma.TransactionClient, profileId: string, amountAglp: number, bankDetails: {
        bankName: string;
        bankAccountNumber: string;
        bankAccountHolder: string;
    }): Promise<{
        updatedAt: Date;
        bankName: string | null;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.AglpTransactionType;
        amount: Prisma.Decimal;
        etbEquivalent: Prisma.Decimal | null;
        conversionRate: Prisma.Decimal | null;
        status: import(".prisma/client").$Enums.AglpTransactionStatus;
        referenceId: string | null;
        referenceType: string | null;
        bankAccountHolder: string | null;
        bankAccountNumber: string | null;
        profileId: string;
    }>;
    rejectWithdrawal(tx: Prisma.TransactionClient, aglpTxId: string, reason: string): Promise<void>;
    completeWithdrawal(tx: Prisma.TransactionClient, aglpTxId: string): Promise<void>;
    cancelWithdrawal(tx: Prisma.TransactionClient, aglpTxId: string, requestedByProfileId: string): Promise<void>;
}
