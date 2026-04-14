import { RequestsService, type CreateRequestDto } from './requests.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    createRequest(req: RequestWithUser, dto: CreateRequestDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    getQueue(zoneId: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
        };
        zone: {
            id: string;
            name: string;
            city: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    })[]>;
    getMyRequests(req: RequestWithUser): Promise<({
        matches: ({
            agent: {
                id: string;
                fullName: string;
                avatarUrl: string | null;
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
        zone: {
            id: string;
            name: string;
            city: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    })[]>;
    findEligibleAgents(): Promise<{
        id: string;
        fullName: string;
        isActive: boolean;
        tier: import(".prisma/client").$Enums.Tier;
        zones: string[];
    }[]>;
    getDisputeHistory(): Promise<({
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            agentId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
        customer: {
            id: string;
            fullName: string;
            phone: string;
        };
        zone: {
            id: string;
            name: string;
            city: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    })[]>;
    getRequest(id: string, req: RequestWithUser): Promise<({
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
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
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
        };
        zone: {
            id: string;
            name: string;
            city: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }) | {
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
        };
        match: {
            agent: {
                id: string;
                fullName: string;
                phone: string;
            } | null;
            transaction: {
                id: string;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
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
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
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
        zone: {
            id: string;
            name: string;
            city: string | null;
            isActive: boolean;
        };
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
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
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
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
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
        };
        zone: {
            id: string;
            name: string;
            city: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }) | {
        customer: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
        };
        match: {
            agent: {
                id: string;
                fullName: string;
                phone: string;
            } | null;
            transaction: {
                id: string;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
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
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                status: import(".prisma/client").$Enums.TransactionStatus;
                createdAt: Date;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
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
        zone: {
            id: string;
            name: string;
            city: string | null;
            isActive: boolean;
        };
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    confirmFulfillment(id: string, confirmed: boolean, req: RequestWithUser): Promise<{
        success: boolean;
        status: string;
    }>;
    resolveDispute(id: string, req: RequestWithUser, note?: string): Promise<{
        matches: ({
            agent: {
                id: string;
                createdAt: Date;
                zoneId: string | null;
                isActive: boolean;
                email: string;
                passwordHash: string | null;
                fullName: string;
                phone: string;
                role: import(".prisma/client").$Enums.UserRole;
                tier: import(".prisma/client").$Enums.Tier;
                referredById: string | null;
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
        } & {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            requestId: string;
            agentId: string;
            operatorId: string;
            assignedAt: Date;
        })[];
        customer: {
            id: string;
            createdAt: Date;
            zoneId: string | null;
            isActive: boolean;
            email: string;
            passwordHash: string | null;
            fullName: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            tier: import(".prisma/client").$Enums.Tier;
            referredById: string | null;
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
    } & {
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    escalateDispute(id: string, req: RequestWithUser, note?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    voidDispute(id: string, req: RequestWithUser, note?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
}
