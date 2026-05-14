import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
interface RequestWithUser {
    user: {
        id: string;
        role: string;
    };
}
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getMyJobs(req: RequestWithUser): Promise<{
        id: string;
        status: string;
        assignedAt: Date;
        transaction: {
            id: string;
            status: string;
            amount: string;
        } | null;
        request: {
            id: string;
            category: string;
            description: string;
            budget: string;
            woreda: string;
            type: string;
            status: import(".prisma/client").$Enums.RequestStatus;
            metadata: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
            zone: string;
            customer: {
                id: string;
                fullName: string;
                phone: string;
            } | {
                id: null;
                fullName: string;
                phone: null;
            };
        };
    }[]>;
    accept(id: string, req: RequestWithUser): Promise<{
        id: string;
        agentId: string;
        status: string;
        requestId: string;
        operatorId: string | null;
        assignedAt: Date;
    }>;
    decline(id: string, req: RequestWithUser): Promise<{
        message: string;
    }>;
    transfer(id: string, body: TransferDto, req: RequestWithUser): Promise<{
        id: string;
        agentId: string;
        status: string;
        requestId: string;
        operatorId: string | null;
        assignedAt: Date;
    }>;
    complete(id: string, req: RequestWithUser): Promise<{
        agent: {
            referredBy: {
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
        };
        request: {
            id: string;
            zoneId: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            woreda: string;
            type: string;
            status: import(".prisma/client").$Enums.RequestStatus;
            description: string;
            category: string;
            budget: import("@prisma/client/runtime/library").Decimal | null;
            assignmentPushedAt: Date | null;
            completedAt: Date | null;
            isEscalated: boolean;
            customerId: string;
            assignedOperatorId: string | null;
        };
    } & {
        id: string;
        agentId: string;
        status: string;
        requestId: string;
        operatorId: string | null;
        assignedAt: Date;
    }>;
    getAll(status?: string, limit?: number, offset?: number): Promise<({
        agent: {
            id: string;
            fullName: string;
            phone: string;
        };
        request: {
            zone: {
                id: string;
                createdAt: Date;
                name: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                type: string;
            };
            customer: {
                id: string;
                fullName: string;
                phone: string;
            };
        } & {
            id: string;
            zoneId: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            woreda: string;
            type: string;
            status: import(".prisma/client").$Enums.RequestStatus;
            description: string;
            category: string;
            budget: import("@prisma/client/runtime/library").Decimal | null;
            assignmentPushedAt: Date | null;
            completedAt: Date | null;
            isEscalated: boolean;
            customerId: string;
            assignedOperatorId: string | null;
        };
    } & {
        id: string;
        agentId: string;
        status: string;
        requestId: string;
        operatorId: string | null;
        assignedAt: Date;
    })[]>;
}
export {};
