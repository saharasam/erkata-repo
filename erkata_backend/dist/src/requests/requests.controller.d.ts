import { RequestsService, type CreateRequestDto } from './requests.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    createRequest(req: RequestWithUser, dto: CreateRequestDto): Promise<{
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
    }>;
    getQueue(zoneId: string): Promise<({
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
            createdAt: Date;
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
    })[]>;
    getMyRequests(req: RequestWithUser): Promise<({
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            type: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
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
            requestId: string;
            agentId: string;
            operatorId: string | null;
            status: string;
            assignedAt: Date;
        })[];
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
    })[]>;
    findEligibleAgents(): Promise<{
        id: string;
        fullName: string;
        isActive: boolean;
        tier: import(".prisma/client").$Enums.Tier;
        zones: string[];
    }[]>;
    getDisputeHistory(): Promise<({
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
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
            };
        } & {
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            status: string;
            assignedAt: Date;
        })[];
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
    })[]>;
    getRequest(id: string, req: RequestWithUser): Promise<({
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
            createdAt: Date;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                createdAt: Date;
                status: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            status: string;
            assignedAt: Date;
        })[];
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
    }) | {
        customer: {
            id: string;
            fullName: string;
            phone: string;
            createdAt: Date;
        };
        match: {
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl?: string | null;
            };
            transaction: {
                id: string;
                createdAt: Date;
                status: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            status: string;
            assignedAt: Date;
        } | null;
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            type: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                createdAt: Date;
                status: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            status: string;
            assignedAt: Date;
        })[];
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
    }>;
    assignAgent(id: string, agentId: string, req: RequestWithUser): Promise<{
        id: string;
        requestId: string;
        agentId: string;
        operatorId: string | null;
        status: string;
        assignedAt: Date;
    }>;
    getStatus(id: string, req: RequestWithUser): Promise<({
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
            createdAt: Date;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                createdAt: Date;
                status: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            status: string;
            assignedAt: Date;
        })[];
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
    }) | {
        customer: {
            id: string;
            fullName: string;
            phone: string;
            createdAt: Date;
        };
        match: {
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl?: string | null;
            };
            transaction: {
                id: string;
                createdAt: Date;
                status: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            status: string;
            assignedAt: Date;
        } | null;
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            type: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                createdAt: Date;
                status: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                matchId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            status: string;
            assignedAt: Date;
        })[];
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
    }>;
    confirmFulfillment(id: string, confirmed: boolean, req: RequestWithUser): Promise<{
        success: boolean;
        status: string;
    }>;
    resolveDispute(id: string, req: RequestWithUser, note?: string): Promise<{
        customer: {
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
        matches: ({
            agent: {
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
        } & {
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            status: string;
            assignedAt: Date;
        })[];
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
    }>;
    escalateDispute(id: string, req: RequestWithUser, note?: string): Promise<{
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
    }>;
    voidDispute(id: string, req: RequestWithUser, note?: string): Promise<{
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
    }>;
}
