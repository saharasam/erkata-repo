import { RequestsService, type CreateRequestDto } from './requests.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    createRequest(req: RequestWithUser, dto: CreateRequestDto): Promise<{
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
    getQueue(zoneId: string): Promise<({
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
    getMyRequests(req: RequestWithUser): Promise<({
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
