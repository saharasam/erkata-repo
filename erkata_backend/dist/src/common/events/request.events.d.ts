import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationsGateway } from '../../notifications/notifications.gateway';
import { PrismaService } from '../../prisma/prisma.service';
export declare class RequestEventListener {
    private readonly notifications;
    private readonly gateway;
    private readonly prisma;
    private readonly logger;
    constructor(notifications: NotificationsService, gateway: NotificationsGateway, prisma: PrismaService);
    handleRequestCreated(payload: any): Promise<void>;
    handleRequestPushed(payload: {
        requestId: string;
        operatorId: string;
    }): Promise<void>;
    handleMatchCreated(payload: {
        match: any;
        agentId: string;
    }): Promise<void>;
    handleMatchAccepted(payload: any): Promise<void>;
    handleMatchCompleted(payload: any): Promise<void>;
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
