import { RequestsService, type CreateRequestDto } from './requests.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    createRequest(req: RequestWithUser, dto: CreateRequestDto): Promise<{
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
    }>;
    getQueue(zoneId: string): Promise<({
        customer: {
            id: string;
            fullName: string;
            createdAt: Date;
        };
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
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
            agentId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
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
    })[]>;
    findEligibleAgents(): Promise<{
        id: string;
        fullName: string;
        isActive: boolean;
        tier: import(".prisma/client").$Enums.Tier;
        zones: string[];
    }[]>;
    getRequest(id: string, req: RequestWithUser): Promise<({
        customer: {
            id: string;
            fullName: string;
            phone: string;
            createdAt: Date;
        };
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
                createdAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            agentId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
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
    }) | {
        customer: {
            id: string;
            fullName: string;
            phone: string;
            createdAt: Date;
        };
        match: {
            agent: any;
            transaction: {
                id: string;
                createdAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            agentId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
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
                createdAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            agentId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
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
    }>;
    assignAgent(id: string, agentId: string, req: RequestWithUser): Promise<{
        id: string;
        agentId: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    getStatus(id: string, req: RequestWithUser): Promise<({
        customer: {
            id: string;
            fullName: string;
            phone: string;
            createdAt: Date;
        };
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
                createdAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            agentId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
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
    }) | {
        customer: {
            id: string;
            fullName: string;
            phone: string;
            createdAt: Date;
        };
        match: {
            agent: any;
            transaction: {
                id: string;
                createdAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            agentId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
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
                createdAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            agentId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
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
    }>;
}
