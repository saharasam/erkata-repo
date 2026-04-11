import { RequestsService, type CreateRequestDto } from './requests.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    createRequest(req: RequestWithUser, dto: CreateRequestDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        zoneId: string;
        description: string | null;
        customerId: string;
        category: string;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
    }>;
    getQueue(zoneId: string): Promise<({
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
        };
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        zoneId: string;
        description: string | null;
        customerId: string;
        category: string;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
    })[]>;
    getMyRequests(req: RequestWithUser): Promise<({
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
            };
            transaction: {
                id: string;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            agentId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        zoneId: string;
        description: string | null;
        customerId: string;
        category: string;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
    })[]>;
    findEligibleAgents(): Promise<{
        id: string;
        fullName: string;
        isActive: boolean;
        tier: import(".prisma/client").$Enums.Tier;
        zones: string[];
    }[]>;
    getRequest(id: string, req: RequestWithUser): Promise<({
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
        };
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
            };
            transaction: {
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            agentId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        zoneId: string;
        description: string | null;
        customerId: string;
        category: string;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
    }) | {
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
        };
        match: {
            agent: any;
            transaction: {
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            agentId: string;
            operatorId: string;
            assignedAt: Date;
        } | null;
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
            };
            transaction: {
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            agentId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        zoneId: string;
        description: string | null;
        customerId: string;
        category: string;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
    }>;
    assignAgent(id: string, agentId: string, req: RequestWithUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    getStatus(id: string, req: RequestWithUser): Promise<({
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
        };
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
            };
            transaction: {
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            agentId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        zoneId: string;
        description: string | null;
        customerId: string;
        category: string;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
    }) | {
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
        };
        match: {
            agent: any;
            transaction: {
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            agentId: string;
            operatorId: string;
            assignedAt: Date;
        } | null;
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
            };
            transaction: {
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            agentId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        zoneId: string;
        description: string | null;
        customerId: string;
        category: string;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
    }>;
}
