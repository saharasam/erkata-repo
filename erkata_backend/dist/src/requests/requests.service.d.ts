import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { Queue } from 'bullmq';
export interface CreateRequestDto {
    category: string;
    details: Record<string, any>;
    locationZone: {
        kifleKetema: string;
        woreda: string;
    };
}
export declare class RequestsService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly presence;
    private readonly timeoutQueue;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, presence: RedisPresenceService, timeoutQueue: Queue);
    private redact;
    createRequest(customerId: string, dto: CreateRequestDto): Promise<{
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
    }>;
    assignToNextReadyOperator(requestId: string): Promise<void>;
    handleOperatorReady(operatorId: string): Promise<void>;
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
    })[]>;
    confirmFulfillment(requestId: string, customerId: string, confirmed: boolean): Promise<{
        success: boolean;
        status: string;
    }>;
}
