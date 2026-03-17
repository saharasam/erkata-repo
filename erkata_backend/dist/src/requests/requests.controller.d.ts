import { RequestsService, type CreateRequestDto } from './requests.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    createRequest(req: RequestWithUser, dto: CreateRequestDto): Promise<{
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
    getQueue(zoneId: string): Promise<({
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
    getMyRequests(req: RequestWithUser): Promise<({
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
    findEligibleAgents(): Promise<{
        id: string;
        fullName: string;
        isActive: boolean;
        tier: import(".prisma/client").$Enums.Tier;
        zones: string[];
    }[]>;
    assignAgent(id: string, agentId: string, req: RequestWithUser): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        requestId: string;
        agentId: string;
        operatorId: string;
        assignedAt: Date;
    }>;
    getStatus(id: string, req: RequestWithUser): Promise<unknown>;
}
