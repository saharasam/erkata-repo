import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
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
