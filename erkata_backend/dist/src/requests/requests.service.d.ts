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
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        zoneId: string;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
    }>;
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
            isActive: boolean;
            city: string | null;
        };
    } & {
        id: string;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        zoneId: string;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
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
            isActive: boolean;
            city: string | null;
        };
        matches: {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            agent: {
                id: string;
                fullName: string;
            };
        }[];
    } & {
        id: string;
        customerId: string;
        type: import(".prisma/client").$Enums.RequestType;
        category: string;
        description: string | null;
        budgetMin: import("@prisma/client/runtime/library").Decimal | null;
        budgetMax: import("@prisma/client/runtime/library").Decimal | null;
        zoneId: string;
        woreda: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
    })[]>;
}
