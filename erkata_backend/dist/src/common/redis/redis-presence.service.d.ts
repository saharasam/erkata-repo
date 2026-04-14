import { OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class RedisPresenceService implements OnModuleInit {
    private readonly redis;
    private readonly subscriber;
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(redis: Redis, subscriber: Redis, prisma: PrismaService, eventEmitter: EventEmitter2);
    onModuleInit(): Promise<void>;
    private startBackupSync;
    private handleExpiredKey;
    heartbeat(operatorId: string): Promise<void>;
    getOnlineOperatorIds(): Promise<string[]>;
}
