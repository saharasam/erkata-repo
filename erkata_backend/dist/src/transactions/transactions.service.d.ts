import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class TransactionsService {
    private readonly prisma;
    private readonly eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
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
    markComplete(matchId: string, agentId: string): Promise<{
        [x: string]: never;
        [x: number]: never;
        [x: symbol]: never;
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
            zoneId: string;
            createdAt: Date;
            customerId: string;
            type: import(".prisma/client").$Enums.RequestType;
            category: string;
            description: string | null;
            budgetMin: Prisma.Decimal | null;
            budgetMax: Prisma.Decimal | null;
            woreda: string | null;
            status: import(".prisma/client").$Enums.RequestStatus;
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
