import { Queue } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AglpService } from '../aglp/aglp.service';
import { ConfigService } from '../common/config.service';
export declare class TransactionsService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly aglpService;
    private readonly configService;
    private readonly timeoutQueue;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, aglpService: AglpService, configService: ConfigService, timeoutQueue: Queue);
    acceptAssignment(matchId: string, agentId: string): Promise<{
        id: string;
        requestId: string;
        agentId: string;
        operatorId: string | null;
        status: string;
        assignedAt: Date;
    }>;
    declineAssignment(matchId: string, agentId: string): Promise<{
        message: string;
    }>;
    transferAssignment(matchId: string, fromAgentId: string, toAgentId: string): Promise<{
        id: string;
        requestId: string;
        agentId: string;
        operatorId: string | null;
        status: string;
        assignedAt: Date;
    }>;
    markComplete(matchId: string, agentId: string): Promise<{
        agent: {
            referredBy: {
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
                aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
                referralCode: string | null;
                isOnline: boolean;
                lastAssignmentAt: Date | null;
                missedAssignments: number;
                warningCount: number;
                avatarUrl: string | null;
                tinNumber: string | null;
                tradeLicenseNumber: string | null;
                isVerified: boolean;
            } | null;
        } & {
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
            aglpWithdrawn: import("@prisma/client/runtime/library").Decimal;
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
        request: {
            id: string;
            zoneId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.RequestStatus;
            customerId: string;
            category: string;
            type: string;
            description: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            budget: import("@prisma/client/runtime/library").Decimal | null;
            woreda: string;
            assignedOperatorId: string | null;
            assignmentPushedAt: Date | null;
            completedAt: Date | null;
            isEscalated: boolean;
        };
    } & {
        id: string;
        requestId: string;
        agentId: string;
        operatorId: string | null;
        status: string;
        assignedAt: Date;
    }>;
    getAgentJobs(agentId: string): Promise<{
        id: string;
        status: string;
        assignedAt: Date;
        transaction: {
            id: string;
            status: string;
            amount: string;
        } | null;
        request: {
            id: string;
            category: string;
            description: string;
            budget: string;
            woreda: string;
            type: string;
            status: import(".prisma/client").$Enums.RequestStatus;
            metadata: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
            zone: string;
            customer: {
                id: string;
                fullName: string;
                phone: string;
            } | {
                id: null;
                fullName: string;
                phone: null;
            };
        };
    }[]>;
    getOperatorTransactions(query?: {
        status?: string;
    }): Promise<({
        agent: {
            id: string;
            fullName: string;
            phone: string;
        };
        request: {
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
        } & {
            id: string;
            zoneId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.RequestStatus;
            customerId: string;
            category: string;
            type: string;
            description: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            budget: import("@prisma/client/runtime/library").Decimal | null;
            woreda: string;
            assignedOperatorId: string | null;
            assignmentPushedAt: Date | null;
            completedAt: Date | null;
            isEscalated: boolean;
        };
    } & {
        id: string;
        requestId: string;
        agentId: string;
        operatorId: string | null;
        status: string;
        assignedAt: Date;
    })[]>;
}
