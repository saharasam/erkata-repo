import { TransactionsService } from './transactions.service';
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
            budgetMax: string;
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
    transfer(id: string, toAgentId: string, req: RequestWithUser): Promise<{
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
                role: import(".prisma/client").$Enums.UserRole;
                isActive: boolean;
                email: string;
                passwordHash: string | null;
                fullName: string;
                phone: string;
                tier: import(".prisma/client").$Enums.Tier;
                zoneId: string | null;
                referredById: string | null;
                createdAt: Date;
                aglpBalance: import("@prisma/client/runtime/library").Decimal;
                aglpPending: import("@prisma/client/runtime/library").Decimal;
                aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
                referralCode: string | null;
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
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            email: string;
            passwordHash: string | null;
            fullName: string;
            phone: string;
            tier: import(".prisma/client").$Enums.Tier;
            zoneId: string | null;
            referredById: string | null;
            createdAt: Date;
            aglpBalance: import("@prisma/client/runtime/library").Decimal;
            aglpPending: import("@prisma/client/runtime/library").Decimal;
            aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
            referralCode: string | null;
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
            woreda: string;
            type: string;
            status: import(".prisma/client").$Enums.RequestStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            category: string;
            description: string;
            budgetMin: import("@prisma/client/runtime/library").Decimal | null;
            budgetMax: import("@prisma/client/runtime/library").Decimal | null;
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
    getAll(status?: string): Promise<({
        agent: {
            id: string;
            fullName: string;
            phone: string;
        };
        request: {
            customer: {
                id: string;
                fullName: string;
                phone: string;
            };
            zone: {
                id: string;
                createdAt: Date;
                name: string;
                type: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            zoneId: string;
            createdAt: Date;
            woreda: string;
            type: string;
            status: import(".prisma/client").$Enums.RequestStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            category: string;
            description: string;
            budgetMin: import("@prisma/client/runtime/library").Decimal | null;
            budgetMax: import("@prisma/client/runtime/library").Decimal | null;
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
