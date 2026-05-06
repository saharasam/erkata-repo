import { OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';
import { RedisPresenceService } from '../common/redis/redis-presence.service';
import { AglpService } from '../aglp/aglp.service';
import { Queue } from 'bullmq';
export interface CreateRequestDto {
    category: string;
    type?: 'real_estate' | 'furniture';
    details: {
        description: string;
        budget?: number;
        [key: string]: any;
    };
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
    private readonly aglpService;
    private readonly timeoutQueue;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, presence: RedisPresenceService, aglpService: AglpService, timeoutQueue: Queue);
    onModuleInit(): Promise<void>;
    private redact;
    createRequest(customerId: string, dto: CreateRequestDto): Promise<{
        id: string;
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    assignToNextReadyOperator(requestId: string): Promise<void>;
    handleOperatorReady(): Promise<void>;
    handleRequestCreatedEvent(payload: string | RequestCreatedPayload): Promise<void>;
    handleOperatorOnlineEvent(): Promise<void>;
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
            type: string;
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            name: string;
        };
    } & {
        id: string;
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    })[]>;
    assignAgent(requestId: string, agentId: string, operatorId: string): Promise<{
        id: string;
        status: string;
        requestId: string;
        agentId: string;
        operatorId: string | null;
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
                metadata: Prisma.JsonValue | null;
                status: string;
                createdAt: Date;
                matchId: string;
                amount: Prisma.Decimal;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
                platformFee: Prisma.Decimal | null;
                agentEarnings: Prisma.Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            status: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
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
            type: string;
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            name: string;
        };
    } & {
        id: string;
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
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
                avatarUrl?: string | null;
            };
            transaction: {
                id: string;
                metadata: Prisma.JsonValue | null;
                status: string;
                createdAt: Date;
                matchId: string;
                amount: Prisma.Decimal;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
                platformFee: Prisma.Decimal | null;
                agentEarnings: Prisma.Decimal | null;
                paymentProofUrl: string | null;
            } | null;
            id: string;
            status: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
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
                metadata: Prisma.JsonValue | null;
                status: string;
                createdAt: Date;
                matchId: string;
                amount: Prisma.Decimal;
                currency: string;
                commissionRate: Prisma.Decimal;
                commissionAmount: Prisma.Decimal | null;
                platformFee: Prisma.Decimal | null;
                agentEarnings: Prisma.Decimal | null;
                paymentProofUrl: string | null;
            } | null;
        } & {
            id: string;
            status: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
        zone: {
            id: string;
            type: string;
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            name: string;
        };
        id: string;
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
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
                feedbacks: {
                    authorId: string;
                }[];
            } | null;
        } & {
            id: string;
            status: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
        zone: {
            id: string;
            type: string;
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            name: string;
        };
    } & {
        id: string;
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
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
                email: string;
                passwordHash: string | null;
                fullName: string;
                phone: string;
                role: import(".prisma/client").$Enums.UserRole;
                tier: import(".prisma/client").$Enums.Tier;
                isActive: boolean;
                referredById: string | null;
                aglpBalance: Prisma.Decimal;
                aglpWithdrawn: Prisma.Decimal;
                referralCode: string | null;
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
            status: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
        customer: {
            id: string;
            createdAt: Date;
            zoneId: string | null;
            email: string;
            passwordHash: string | null;
            fullName: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            tier: import(".prisma/client").$Enums.Tier;
            isActive: boolean;
            referredById: string | null;
            aglpBalance: Prisma.Decimal;
            aglpWithdrawn: Prisma.Decimal;
            referralCode: string | null;
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
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    escalateDispute(requestId: string, operatorId: string, note?: string): Promise<{
        id: string;
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
    voidDispute(requestId: string, operatorId: string, note?: string): Promise<{
        id: string;
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
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
            status: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
        assignedOperator: {
            id: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        customer: {
            id: string;
            fullName: string;
            phone: string;
        };
        zone: {
            id: string;
            type: string;
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
            name: string;
        };
    } & {
        id: string;
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    })[]>;
    forceComplete(requestId: string, operatorId: string, note?: string): Promise<{
        matches: ({
            agent: {
                id: string;
                createdAt: Date;
                zoneId: string | null;
                email: string;
                passwordHash: string | null;
                fullName: string;
                phone: string;
                role: import(".prisma/client").$Enums.UserRole;
                tier: import(".prisma/client").$Enums.Tier;
                isActive: boolean;
                referredById: string | null;
                aglpBalance: Prisma.Decimal;
                aglpWithdrawn: Prisma.Decimal;
                referralCode: string | null;
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
            status: string;
            requestId: string;
            agentId: string;
            operatorId: string | null;
            assignedAt: Date;
        })[];
        customer: {
            id: string;
            createdAt: Date;
            zoneId: string | null;
            email: string;
            passwordHash: string | null;
            fullName: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            tier: import(".prisma/client").$Enums.Tier;
            isActive: boolean;
            referredById: string | null;
            aglpBalance: Prisma.Decimal;
            aglpWithdrawn: Prisma.Decimal;
            referralCode: string | null;
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
        category: string;
        type: string;
        description: string;
        metadata: Prisma.JsonValue;
        budget: Prisma.Decimal | null;
        woreda: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        assignmentPushedAt: Date | null;
        completedAt: Date | null;
        isEscalated: boolean;
        createdAt: Date;
        customerId: string;
        zoneId: string;
        assignedOperatorId: string | null;
    }>;
}
export {};
