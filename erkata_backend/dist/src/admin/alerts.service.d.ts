import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../common/config.service';
export declare class AlertsService {
    private readonly prisma;
    private readonly configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    getAgentRiskAlerts(): Promise<{
        agentId: string;
        fullName: string;
        phone: string;
        totalBadAssignments: number;
        rejectedCount: number;
        unfulfilledCount: number;
    }[]>;
    getDisputeAlerts(): Promise<{
        agentId: string;
        fullName: string;
        phone: string;
        disputeCount: number;
    }[]>;
    getRequestSpikeAlerts(): Promise<{
        isSpike: boolean;
        currentHourVolume: number;
        averageHourlyVolume: number;
        thresholdMultiplier: number;
        calculatedThreshold: number;
    }>;
    getCommissionSpikeAlerts(): Promise<{
        agentId: string;
        fullName: string;
        phone: string;
        totalEarned24h: number;
        threshold: number;
    }[]>;
    getAllAlerts(): Promise<{
        agentsNearSuspension: {
            agentId: string;
            fullName: string;
            phone: string;
            totalBadAssignments: number;
            rejectedCount: number;
            unfulfilledCount: number;
        }[];
        disputePatterns: {
            agentId: string;
            fullName: string;
            phone: string;
            disputeCount: number;
        }[];
        requestVolumeSpikes: {
            isSpike: boolean;
            currentHourVolume: number;
            averageHourlyVolume: number;
            thresholdMultiplier: number;
            calculatedThreshold: number;
        };
        commissionSpikes: {
            agentId: string;
            fullName: string;
            phone: string;
            totalEarned24h: number;
            threshold: number;
        }[];
        generatedAt: Date;
    }>;
}
