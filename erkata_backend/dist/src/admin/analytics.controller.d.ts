import { PrismaService } from '../prisma/prisma.service';
export default class AnalyticsController {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        totalUsers: number;
        totalRequests: number;
        totalTransactions: number;
        totalBundles: number;
        totalFinalized: number;
        agentCount: number;
        operatorCount: number;
        resolutionRate: string;
        platformVolume: string;
        uptime: string;
    }>;
    getDistribution(): Promise<{
        role: import("@prisma/client").$Enums.UserRole;
        count: number;
    }[]>;
}
