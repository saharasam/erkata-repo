import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    createRequest(req: RequestWithUser, dto: CreateRequestDto): Promise<{
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
    }>;
    getQueue(zoneId?: string, limit?: number, offset?: number): Promise<({
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
            createdAt: Date;
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
    })[]>;
    getMyRequests(req: RequestWithUser): Promise<({
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            type: string;
        };
        matches: ({
            agent: {
                id: string;
                fullName: string;
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                feedbacks: {
                    authorId: string;
                }[];
            } | null;
        } & {
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
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
    })[]>;
    findEligibleAgents(): Promise<{
        id: string;
        fullName: string;
        isActive: boolean;
        tier: import(".prisma/client").$Enums.Tier;
        zones: string[];
    }[]>;
    getDisputeHistory(limit?: number, offset?: number): Promise<({
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
        matches: ({
            agent: {
                id: string;
                fullName: string;
                phone: string;
            };
        } & {
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
        assignedOperator: {
            id: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
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
    })[]>;
    getRequest(id: string, req: RequestWithUser): Promise<({
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
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
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
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        } | null;
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            type: string;
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
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
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
    }>;
    assignAgent(id: string, agentId: string, req: RequestWithUser): Promise<{
        id: string;
        agentId: string;
        status: string;
        requestId: string;
        operatorId: string | null;
        assignedAt: Date;
    }>;
    getStatus(id: string, req: RequestWithUser): Promise<({
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
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
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
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        } | null;
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            type: string;
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
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                matchId: string;
                currency: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
                platformFee: import("@prisma/client/runtime/library").Decimal | null;
                agentEarnings: import("@prisma/client/runtime/library").Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
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
    }>;
    confirmFulfillment(id: string, confirmed: boolean, req: RequestWithUser): Promise<{
        success: boolean;
        status: string;
    }>;
    resolveDispute(id: string, req: RequestWithUser, note?: string): Promise<{
        customer: {
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
        matches: ({
            agent: {
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
        } & {
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
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
    }>;
    escalateDispute(id: string, req: RequestWithUser, note?: string): Promise<{
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
    }>;
    voidDispute(id: string, req: RequestWithUser, note?: string): Promise<{
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
    }>;
    forceComplete(id: string, req: RequestWithUser, note?: string): Promise<{
        customer: {
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
        matches: ({
            agent: {
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
        } & {
            id: string;
            agentId: string;
            status: string;
            requestId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
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
    }>;
}
