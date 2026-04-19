import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationsGateway } from '../../notifications/notifications.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { Match } from '@prisma/client';
interface RequestCreatedPayload {
    id: string;
}
interface MatchCreatedPayload {
    match: Partial<Match>;
    agentId: string;
}
interface RequestIdPayload {
    requestId: string;
}
export declare class RequestEventListener {
    private readonly notifications;
    private readonly gateway;
    private readonly prisma;
    private readonly logger;
    constructor(notifications: NotificationsService, gateway: NotificationsGateway, prisma: PrismaService);
    handleRequestCreated(payload: RequestCreatedPayload): void;
    handleRequestPushed(payload: {
        requestId: string;
        operatorId: string;
    }): Promise<void>;
    handleMatchCreated(payload: MatchCreatedPayload): Promise<void>;
    handleMatchAccepted(payload: RequestIdPayload): Promise<void>;
    handleMatchCompleted(payload: RequestIdPayload): Promise<void>;
    handleRequestDisputed(payload: {
        requestId: string;
        customerId: string;
    }): Promise<void>;
    handleRequestEscalated(payload: {
        requestId: string;
        operatorId: string;
        note?: string;
    }): Promise<void>;
    handleRequestResolved(payload: {
        requestId: string;
        operatorId: string;
        note?: string;
    }): Promise<void>;
    handleRequestVoided(payload: {
        requestId: string;
        operatorId: string;
        note?: string;
    }): Promise<void>;
}
export {};
