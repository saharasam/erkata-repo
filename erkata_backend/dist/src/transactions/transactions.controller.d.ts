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
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    decline(id: string, req: RequestWithUser): Promise<{
        message: string;
    }>;
    complete(id: string, req: RequestWithUser): Promise<{
        [x: string]: never;
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
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
            customerId: string;
            type: import(".prisma/client").$Enums.RequestType;
            category: string;
            description: string | null;
            budgetMin: import("@prisma/client/runtime/library").Decimal | null;
            budgetMax: import("@prisma/client/runtime/library").Decimal | null;
            woreda: string | null;
            status: import(".prisma/client").$Enums.RequestStatus;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    })[]>;
}
export {};
