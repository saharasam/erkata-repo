"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_service_1 = require("../common/config.service");
let AlertsService = class AlertsService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async getAgentRiskAlerts() {
        const threshold = this.configService.get('alert_bad_performance_limit', 3);
        const results = await this.prisma.$queryRaw `
      WITH PerformanceCounts AS (
        SELECT 
          m.agent_id,
          p.full_name,
          p.phone,
          COUNT(CASE WHEN m.status = 'rejected' THEN 1 END) as rejected_count,
          COUNT(CASE WHEN m.status IN ('accepted', 'completed') AND r.status = 'disputed' THEN 1 END) as unfulfilled_count
        FROM matches m
        JOIN profiles p ON m.agent_id = p.id
        LEFT JOIN requests r ON m.request_id = r.id
        WHERE p.role = 'agent'
        GROUP BY m.agent_id, p.full_name, p.phone
      )
      SELECT *
      FROM PerformanceCounts
      WHERE (rejected_count + unfulfilled_count) >= ${threshold}
      ORDER BY (rejected_count + unfulfilled_count) DESC
    `;
        return results.map((r) => ({
            agentId: r.agent_id,
            fullName: r.full_name,
            phone: r.phone,
            totalBadAssignments: Number(r.rejected_count) + Number(r.unfulfilled_count),
            rejectedCount: Number(r.rejected_count),
            unfulfilledCount: Number(r.unfulfilled_count),
        }));
    }
    async getDisputeAlerts() {
        const threshold = this.configService.get('alert_dispute_pattern_limit', 2);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const results = await this.prisma.$queryRaw `
      SELECT 
        m.agent_id,
        p.full_name,
        p.phone,
        COUNT(fb.id) as dispute_count
      FROM feedback_bundles fb
      JOIN transactions t ON fb.transaction_id = t.id
      JOIN matches m ON t.match_id = m.id
      JOIN profiles p ON m.agent_id = p.id
      WHERE fb.created_at >= ${oneWeekAgo}
      GROUP BY m.agent_id, p.full_name, p.phone
      HAVING COUNT(fb.id) >= ${threshold}
      ORDER BY dispute_count DESC
    `;
        return results.map((r) => ({
            agentId: r.agent_id,
            fullName: r.full_name,
            phone: r.phone,
            disputeCount: Number(r.dispute_count),
        }));
    }
    async getRequestSpikeAlerts() {
        const factor = this.configService.get('alert_spike_factor', 1.5);
        const minThreshold = this.configService.get('alert_spike_min_threshold', 5);
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const stats = await this.prisma.$queryRaw `
      SELECT 
        COUNT(CASE WHEN created_at >= ${oneHourAgo} THEN 1 END) as last_hour_count,
        COUNT(CASE WHEN created_at >= ${twentyFourHoursAgo} THEN 1 END) as last_24h_count
      FROM requests
      WHERE status = 'pending'
    `;
        const lastHour = Number(stats[0].last_hour_count || 0);
        const last24h = Number(stats[0].last_24h_count || 0);
        const avgHourly = last24h / 24;
        const spikeThreshold = avgHourly * factor;
        const isSpike = lastHour >= minThreshold && lastHour > spikeThreshold;
        return {
            isSpike,
            currentHourVolume: lastHour,
            averageHourlyVolume: Number(avgHourly.toFixed(2)),
            thresholdMultiplier: factor,
            calculatedThreshold: Number(spikeThreshold.toFixed(2)),
        };
    }
    async getCommissionSpikeAlerts() {
        const config = this.configService.get('alert_commission_spike_threshold', { value: 10000 });
        const threshold = Number(config.value);
        const results = await this.prisma.$queryRaw `
      SELECT 
        t.profile_id,
        p.full_name,
        p.phone,
        SUM(t.etb_equivalent) as total_earned
      FROM aglp_transactions t
      JOIN profiles p ON t.profile_id = p.id
      WHERE t.type = 'EARN' AND t.status = 'COMPLETED' AND t.created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY t.profile_id, p.full_name, p.phone
      HAVING SUM(t.etb_equivalent) >= ${threshold}
      ORDER BY total_earned DESC
    `;
        return results.map((r) => ({
            agentId: r.profile_id,
            fullName: r.full_name,
            phone: r.phone,
            totalEarned24h: Number(r.total_earned),
            threshold,
        }));
    }
    async getAllAlerts() {
        const [agents, disputes, spikes, commissionSpikes] = await Promise.all([
            this.getAgentRiskAlerts(),
            this.getDisputeAlerts(),
            this.getRequestSpikeAlerts(),
            this.getCommissionSpikeAlerts(),
        ]);
        return {
            agentsNearSuspension: agents,
            disputePatterns: disputes,
            requestVolumeSpikes: spikes,
            commissionSpikes,
            generatedAt: new Date(),
        };
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_service_1.ConfigService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map