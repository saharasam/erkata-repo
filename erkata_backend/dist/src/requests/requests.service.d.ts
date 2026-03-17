import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
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
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    private redact;
    createRequest(customerId: string, dto: CreateRequestDto): Promise<{
        id: string;
        zoneId: string;
        createdAt: Date;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
    }>;
    getOperatorQueue(filters?: {
        zoneId?: string;
    }): Promise<({
        zone: {
            id: string;
            name: string;
            city: string | null;
            isActive: boolean;
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
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
    })[]>;
    assignAgent(requestId: string, agentId: string, operatorId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    getRequestStatus(requestId: string, userId: string, role: UserRole): Promise<unknown>;
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
            name: string;
            city: string | null;
            isActive: boolean;
        };
        matches: {
            id: string;
            agent: {
                id: string;
                fullName: string;
            };
            status: import(".prisma/client").$Enums.MatchStatus;
        }[];
    } & {
        id: string;
        zoneId: string;
        createdAt: Date;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
    })[]>;
}
