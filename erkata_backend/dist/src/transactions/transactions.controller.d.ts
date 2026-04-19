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
        requestId: string;
        agentId: string;
        operatorId: string | null;
        status: string;
        assignedAt: Date;
    }>;
    decline(id: string, req: RequestWithUser): Promise<{
        message: string;
    }>;
    transfer(id: string, toAgentId: string, req: RequestWithUser): Promise<{
        id: string;
        requestId: string;
        agentId: string;
        operatorId: string | null;
        status: string;
        assignedAt: Date;
    }>;
    complete(id: string, req: RequestWithUser): Promise<{
        agent: {
            referredBy: {
                id: string;
                email: string;
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
                aglpPending: import("@prisma/client/runtime/library").Decimal;
                aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
                referralCode: string | null;
                isOnline: boolean;
                lastAssignmentAt: Date | null;
                missedAssignments: number;
                warningCount: number;
                avatarUrl: string | null;
            } | null;
        } & {
            id: string;
            email: string;
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
            aglpPending: import("@prisma/client/runtime/library").Decimal;
            aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
            referralCode: string | null;
            isOnline: boolean;
            lastAssignmentAt: Date | null;
            missedAssignments: number;
            warningCount: number;
            avatarUrl: string | null;
        };
        request: {
            id: string;
            zoneId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.RequestStatus;
            customerId: string;
            category: string;
            type: string;
            description: string;
            budgetMin: import("@prisma/client/runtime/library").Decimal | null;
            budgetMax: import("@prisma/client/runtime/library").Decimal | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            woreda: string;
            assignedOperatorId: string | null;
            assignmentPushedAt: Date | null;
            completedAt: Date | null;
            isEscalated: boolean;
        };
    } & {
        id: string;
        requestId: string;
        agentId: string;
        operatorId: string | null;
        status: string;
        assignedAt: Date;
    }>;
    getAll(status?: string): Promise<({
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
                type: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
            status: import(".prisma/client").$Enums.RequestStatus;
            customerId: string;
            category: string;
            type: string;
            description: string;
            budgetMin: import("@prisma/client/runtime/library").Decimal | null;
            budgetMax: import("@prisma/client/runtime/library").Decimal | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            woreda: string;
            assignedOperatorId: string | null;
            assignmentPushedAt: Date | null;
            completedAt: Date | null;
            isEscalated: boolean;
        };
    } & {
        id: string;
        requestId: string;
        agentId: string;
        operatorId: string | null;
        status: string;
        assignedAt: Date;
    })[]>;
}
export {};
