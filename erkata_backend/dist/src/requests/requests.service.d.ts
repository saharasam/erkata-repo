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
        zoneId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RequestStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
    }>;
    assignToNextReadyOperator(requestId: string): Promise<void>;
    handleOperatorReady(): Promise<void>;
    handleRequestCreatedEvent(payload: string | RequestCreatedPayload): Promise<void>;
    handleOperatorOnlineEvent(): Promise<void>;
    getOperatorQueue(filters?: {
        zoneId?: string;
    }): Promise<({
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
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
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
    })[]>;
    assignAgent(requestId: string, agentId: string, operatorId: string): Promise<{
        id: string;
        requestId: string;
        agentId: string;
        operatorId: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        assignedAt: Date;
    }>;
    getRequest(requestId: string, userId: string, role: UserRole): Promise<({
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
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
                status: import(".prisma/client").$Enums.TransactionStatus;
                matchId: string;
                amount: Prisma.Decimal;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        zoneId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RequestStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
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
                status: import(".prisma/client").$Enums.TransactionStatus;
                matchId: string;
                amount: Prisma.Decimal;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
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
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.TransactionStatus;
                matchId: string;
                amount: Prisma.Decimal;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            assignedAt: Date;
        })[];
        id: string;
        zoneId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RequestStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
    }>;
    findEligibleAgents(): Promise<{
        id: string;
        fullName: string;
        isActive: boolean;
        tier: import(".prisma/client").$Enums.Tier;
        zones: string[];
    }[]>;
    getCustomerRequests(customerId: string): Promise<({
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
                avatarUrl: string | null;
            };
            transaction: {
                id: string;
            } | null;
        } & {
            id: string;
            requestId: string;
            agentId: string;
            operatorId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        zoneId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RequestStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
    })[]>;
    confirmFulfillment(requestId: string, customerId: string, confirmed: boolean): Promise<{
        success: boolean;
        status: string;
    }>;
    resolveDispute(requestId: string, operatorId: string, note?: string): Promise<{
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
            requestId: string;
            agentId: string;
            operatorId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        zoneId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RequestStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
    }>;
    escalateDispute(requestId: string, operatorId: string, note?: string): Promise<{
        id: string;
        zoneId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RequestStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
    }>;
    voidDispute(requestId: string, operatorId: string, note?: string): Promise<{
        id: string;
        zoneId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RequestStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
    }>;
    getDisputeHistory(): Promise<({
        zone: {
            id: string;
            isActive: boolean;
            name: string;
            city: string | null;
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
            operatorId: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        zoneId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RequestStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: Prisma.Decimal | null;
        budgetMax: Prisma.Decimal | null;
        woreda: string | null;
        assignedOperatorId: string | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        metadata: Prisma.JsonValue | null;
        isEscalated: boolean;
    })[]>;
}
export {};
