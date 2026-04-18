import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Redis } from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
    private readonly logger;
    constructor(prisma: PrismaService, redis: Redis, eventEmitter: EventEmitter2);
    process(job: Job<AssignmentJobData, any, string>): Promise<any>;
}
export {};
