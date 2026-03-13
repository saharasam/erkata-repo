import { ConfigService } from '../common/config.service';
import { Prisma } from '@prisma/client';
export declare class AdminConfigController {
    private configService;
    constructor(configService: ConfigService);
    getAllConfigs(): ({
        key: string;
        value: number;
        description: string;
    } | {
        key: string;
        value: boolean;
        description: string;
    })[];
    updateConfig(body: {
        key: string;
        value: Prisma.InputJsonValue;
        description?: string;
    }): Promise<{
        success: boolean;
        key: string;
        value: Prisma.InputJsonValue;
    }>;
}
