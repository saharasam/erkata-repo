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
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    assignToNextReadyOperator(requestId: string): Promise<void>;
    handleOperatorReady(operatorId: string): Promise<void>;
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
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        assignmentPushedAt: Date | null;
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
            agent: any;
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
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    })[]>;
}
