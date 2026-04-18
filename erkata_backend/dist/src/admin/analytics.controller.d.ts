import { PrismaService } from '../prisma/prisma.service';
export default class AnalyticsController {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(window?: string): Promise<{
        totalUsers: number;
        totalRequests: number;
        activeRequests: number;
        fulfilledInWindow: number;
        totalBundles: number;
        totalFinalized: number;
        activeDisputes: number;
        agentCount: number;
        operatorCount: number;
        resolutionRate: string;
        window: string;
        avgAssignmentTimeMs: number | null;
        avgFulfillmentTimeMs: number | null;
        platformVolume: string;
        dailyCommissions: string;
        leaderboard: any[];
        packageDistribution: {
            tier: string;
            count: number;
        }[];
        packageRevenue: string;
        uptime: string;
    }>;
    getDistribution(): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        count: number;
    }[]>;
}
