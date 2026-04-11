import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AglpService } from '../aglp/aglp.service';
import { ConfigService } from '../common/config.service';
export declare class TransactionsService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly aglpService;
    private readonly configService;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, aglpService: AglpService, configService: ConfigService);
    acceptAssignment(matchId: string, agentId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    declineAssignment(matchId: string, agentId: string): Promise<{
        message: string;
    }>;
    transferAssignment(matchId: string, fromAgentId: string, toAgentId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    markComplete(matchId: string, agentId: string): Promise<{
        agent: {
            referredBy: {
                id: string;
                createdAt: Date;
                email: string;
                passwordHash: string | null;
                fullName: string;
                phone: string;
                role: import(".prisma/client").$Enums.UserRole;
                tier: import(".prisma/client").$Enums.Tier;
                isActive: boolean;
                zoneId: string | null;
                referredById: string | null;
                warningCount: number;
                missedAssignments: number;
                aglpBalance: Prisma.Decimal;
                aglpPending: Prisma.Decimal;
                aglpWithdrawn: Prisma.Decimal;
                referralCode: string | null;
                isOnline: boolean;
                lastAssignmentAt: Date | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string | null;
            fullName: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            tier: import(".prisma/client").$Enums.Tier;
            isActive: boolean;
            zoneId: string | null;
            referredById: string | null;
            warningCount: number;
            missedAssignments: number;
            aglpBalance: Prisma.Decimal;
            aglpPending: Prisma.Decimal;
            aglpWithdrawn: Prisma.Decimal;
            referralCode: string | null;
            isOnline: boolean;
            lastAssignmentAt: Date | null;
        };
        request: {
            id: string;
            type: import(".prisma/client").$Enums.RequestType;
            status: import(".prisma/client").$Enums.RequestStatus;
            createdAt: Date;
            zoneId: string;
            description: string | null;
            customerId: string;
            category: string;
            budgetMin: Prisma.Decimal | null;
            budgetMax: Prisma.Decimal | null;
            woreda: string | null;
            assignedOperatorId: string | null;
            assignmentPushedAt: Date | null;
            completedAt: Date | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    getAgentJobs(agentId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        assignedAt: Date;
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: string;
        } | null;
        request: {
            id: string;
            category: string;
            description: string | null;
            budgetMax: string;
            woreda: string | null;
            type: import(".prisma/client").$Enums.RequestType;
            status: import(".prisma/client").$Enums.RequestStatus;
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
        request: {
            customer: {
                id: string;
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
            budgetMin: Prisma.Decimal | null;
            budgetMax: Prisma.Decimal | null;
            woreda: string | null;
            assignedOperatorId: string | null;
            assignmentPushedAt: Date | null;
            completedAt: Date | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    })[]>;
}
