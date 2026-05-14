import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
interface BroadcastJobData {
    broadcastId: string;
    title: string;
    content?: string;
    target: string;
}
export declare class BroadcastProcessor extends WorkerHost {
    private readonly prisma;
    private readonly notificationsGateway;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsGateway: NotificationsGateway);
    process(job: Job<BroadcastJobData, any, string>): Promise<any>;
}
export {};
