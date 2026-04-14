import { OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { Queue } from 'bullmq';
export interface CreateRequestDto {
    category: string;
    type?: 'real_estate' | 'furniture';
    details: Record<string, any>;
    metadata?: Record<string, any>;
    locationZone: {
        kifleKetema: string;
        woreda: string;
    };
}
interface RequestCreatedPayload {
    id: string;
}
export declare class RequestsService implements OnModuleInit {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly presence;
    private readonly timeoutQueue;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, presence: RedisPresenceService, timeoutQueue: Queue);
    onModuleInit(): Promise<void>;
    private redact;
    createRequest(customerId: string, dto: CreateRequestDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    assignToNextReadyOperator(requestId: string): Promise<void>;
    handleOperatorReady(): Promise<void>;
    handleRequestCreatedEvent(payload: string | RequestCreatedPayload): Promise<void>;
    handleOperatorOnlineEvent(payload: {
        operatorId: string;
    }): Promise<void>;
    getOperatorQueue(filters?: {
        zoneId?: string;
    }): Promise<({
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
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    })[]>;
    assignAgent(requestId: string, agentId: string, operatorId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    getRequest(requestId: string, userId: string, role: UserRole): Promise<({
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
                amount: Prisma.Decimal;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
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
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
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
                amount: Prisma.Decimal;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
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
                amount: Prisma.Decimal;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
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
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    findEligibleAgents(): Promise<{
        id: string;
        fullName: string;
        isActive: boolean;
        tier: import(".prisma/client").$Enums.Tier;
        zones: string[];
    }[]>;
    getCustomerRequests(customerId: string): Promise<({
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
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    })[]>;
    confirmFulfillment(requestId: string, customerId: string, confirmed: boolean): Promise<{
        success: boolean;
        status: string;
    }>;
    resolveDispute(requestId: string, operatorId: string, note?: string): Promise<{
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
                aglpBalance: Prisma.Decimal;
                aglpPending: Prisma.Decimal;
                aglpWithdrawn: Prisma.Decimal;
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
            aglpBalance: Prisma.Decimal;
            aglpPending: Prisma.Decimal;
            aglpWithdrawn: Prisma.Decimal;
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
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    escalateDispute(requestId: string, operatorId: string, note?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    voidDispute(requestId: string, operatorId: string, note?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
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
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    })[]>;
}
export {};
