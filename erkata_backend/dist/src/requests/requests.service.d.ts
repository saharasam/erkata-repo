import { OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { AglpService } from '../aglp/aglp.service';
import { Queue } from 'bullmq';
import { CreateRequestDto } from './dto/create-request.dto';
interface RequestCreatedPayload {
    id: string;
}
export declare class RequestsService implements OnModuleInit {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly presence;
    private readonly aglpService;
    private readonly timeoutQueue;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, presence: RedisPresenceService, aglpService: AglpService, timeoutQueue: Queue);
    onModuleInit(): Promise<void>;
    private redact;
    createRequest(customerId: string, dto: CreateRequestDto): Promise<{
        id: string;
        zoneId: string;
        createdAt: Date;
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        customerId: string;
        assignedOperatorId: string | null;
    }>;
    assignToNextReadyOperator(requestId: string): Promise<void>;
    handleOperatorReady(): Promise<void>;
    handleRequestCreatedEvent(payload: string | RequestCreatedPayload): Promise<void>;
    handleOperatorOnlineEvent(): Promise<void>;
    getOperatorQueue(filters?: {
        zoneId?: string;
        limit?: number;
        offset?: number;
    }): Promise<({
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            metadata: Prisma.JsonValue | null;
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
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        customerId: string;
        assignedOperatorId: string | null;
    })[]>;
    assignAgent(requestId: string, agentId: string, operatorId: string): Promise<{
        id: string;
        agentId: string;
        status: string;
        requestId: string;
        operatorId: string | null;
        assignedAt: Date;
    }>;
    getRequest(requestId: string, userId: string, role: UserRole): Promise<({
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            metadata: Prisma.JsonValue | null;
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
                metadata: Prisma.JsonValue | null;
                status: string;
                amount: Prisma.Decimal;
                matchId: string;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
                platformFee: Prisma.Decimal | null;
                agentEarnings: Prisma.Decimal | null;
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
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
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
                metadata: Prisma.JsonValue | null;
                status: string;
                amount: Prisma.Decimal;
                matchId: string;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
                platformFee: Prisma.Decimal | null;
                agentEarnings: Prisma.Decimal | null;
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
            metadata: Prisma.JsonValue | null;
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
                metadata: Prisma.JsonValue | null;
                status: string;
                amount: Prisma.Decimal;
                matchId: string;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
                platformFee: Prisma.Decimal | null;
                agentEarnings: Prisma.Decimal | null;
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
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        customerId: string;
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
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            metadata: Prisma.JsonValue | null;
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
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        customerId: string;
        assignedOperatorId: string | null;
    })[]>;
    confirmFulfillment(requestId: string, customerId: string, confirmed: boolean): Promise<{
        success: boolean;
        status: string;
    }>;
    resolveDispute(requestId: string, operatorId: string, note?: string): Promise<{
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
            aglpBalance: Prisma.Decimal;
            aglpWithdrawn: Prisma.Decimal;
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
                aglpBalance: Prisma.Decimal;
                aglpWithdrawn: Prisma.Decimal;
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
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        customerId: string;
        assignedOperatorId: string | null;
    }>;
    escalateDispute(requestId: string, operatorId: string, note?: string): Promise<{
        id: string;
        zoneId: string;
        createdAt: Date;
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        customerId: string;
        assignedOperatorId: string | null;
    }>;
    voidDispute(requestId: string, operatorId: string, note?: string): Promise<{
        id: string;
        zoneId: string;
        createdAt: Date;
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        customerId: string;
        assignedOperatorId: string | null;
    }>;
    getDisputeHistory(pagination?: {
        limit?: number;
        offset?: number;
    }): Promise<({
        zone: {
            id: string;
            createdAt: Date;
            name: string;
            metadata: Prisma.JsonValue | null;
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
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        customerId: string;
        assignedOperatorId: string | null;
    })[]>;
    forceComplete(requestId: string, operatorId: string, note?: string): Promise<{
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
            aglpBalance: Prisma.Decimal;
            aglpWithdrawn: Prisma.Decimal;
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
                aglpBalance: Prisma.Decimal;
                aglpWithdrawn: Prisma.Decimal;
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
        metadata: Prisma.JsonValue;
        woreda: string;
        type: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        category: string;
        budget: Prisma.Decimal | null;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        customerId: string;
        assignedOperatorId: string | null;
    }>;
}
export {};
