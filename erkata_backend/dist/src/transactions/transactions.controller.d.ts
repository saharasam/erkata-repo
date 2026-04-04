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
        status: import(".prisma/client").$Enums.MatchStatus;
        assignedAt: Date;
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: string;
        } | null;
        request: {
            id: string;
            category: string;
            description: string | null;
            budgetMax: string;
            woreda: string | null;
            type: import(".prisma/client").$Enums.RequestType;
            status: import(".prisma/client").$Enums.RequestStatus;
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
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    decline(id: string, req: RequestWithUser): Promise<{
        message: string;
    }>;
    transfer(id: string, toAgentId: string, req: RequestWithUser): Promise<{
        id: string;
        agentId: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        operatorId: string;
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
        };
        request: {
            id: string;
            zoneId: string;
            createdAt: Date;
            woreda: string | null;
            type: import(".prisma/client").$Enums.RequestType;
            status: import(".prisma/client").$Enums.RequestStatus;
            category: string;
            description: string | null;
            budgetMin: import("@prisma/client/runtime/library").Decimal | null;
            budgetMax: import("@prisma/client/runtime/library").Decimal | null;
            assignmentPushedAt: Date | null;
            customerId: string;
            assignedOperatorId: string | null;
        };
    } & {
        id: string;
        agentId: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    getAll(status?: string): Promise<({
        request: {
            customer: {
                id: string;
                fullName: string;
            };
        } & {
            id: string;
            zoneId: string;
            createdAt: Date;
            woreda: string | null;
            type: import(".prisma/client").$Enums.RequestType;
            status: import(".prisma/client").$Enums.RequestStatus;
            category: string;
            description: string | null;
            budgetMin: import("@prisma/client/runtime/library").Decimal | null;
            budgetMax: import("@prisma/client/runtime/library").Decimal | null;
            assignmentPushedAt: Date | null;
            customerId: string;
            assignedOperatorId: string | null;
        };
    } & {
        id: string;
        agentId: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        operatorId: string;
        assignedAt: Date;
    })[]>;
}
export {};
