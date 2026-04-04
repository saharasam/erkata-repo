import { OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
export declare class RedisPresenceService implements OnModuleInit {
    private readonly redis;
    private readonly subscriber;
    private readonly prisma;
    private readonly logger;
    constructor(redis: Redis, subscriber: Redis, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private startBackupSync;
    private handleExpiredKey;
    heartbeat(operatorId: string): Promise<void>;
    getOnlineOperatorIds(): Promise<string[]>;
}
