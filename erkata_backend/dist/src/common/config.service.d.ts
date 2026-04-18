import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ConfigService implements OnModuleInit {
    private prisma;
    static readonly DEFAULT_RISK_THRESHOLD = 100000;
    private readonly logger;
    private configs;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    refreshConfigs(): Promise<void>;
    get<T>(key: string, defaultValue?: T): T;
    set(key: string, value: Prisma.InputJsonValue, description?: string, actorId?: string): Promise<void>;
}
