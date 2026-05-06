import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Redis } from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
interface AssignmentJobData {
    requestId?: string;
    operatorId?: string;
    agentId?: string;
    matchId?: string;
}
export declare class AssignmentProcessor extends WorkerHost {
    private readonly prisma;
    private readonly redis;
    private readonly eventEmitter;
    private readonly notificationsGateway;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, redis: Redis, eventEmitter: EventEmitter2, notificationsGateway: NotificationsGateway, notificationsService: NotificationsService);
    process(job: Job<AssignmentJobData, any, string>): Promise<any>;
    private handleStaleUpgradeRequests;
}
export {};
