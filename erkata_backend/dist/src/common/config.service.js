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
var ConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConfigService = class ConfigService {
    static { ConfigService_1 = this; }
    prisma;
    static DEFAULT_RISK_THRESHOLD = 100000;
    logger = new common_1.Logger(ConfigService_1.name);
    configs = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.refreshConfigs();
    }
    async refreshConfigs() {
        try {
            const allConfigs = await this.prisma.systemConfig.findMany();
            this.configs.clear();
            for (const config of allConfigs) {
                this.configs.set(config.key, config.value);
            }
            this.logger.log(`[ConfigService] Loaded ${this.configs.size} dynamic configurations.`);
            if (!this.configs.has('high_risk_threshold_etb')) {
                await this.set('high_risk_threshold_etb', ConfigService_1.DEFAULT_RISK_THRESHOLD, 'Threshold for Super Admin escalation');
            }
            if (!this.configs.has('AGLP_COMMISSION_PACKAGE_REFERRAL')) {
                await this.set('AGLP_COMMISSION_PACKAGE_REFERRAL', { value: 0.1 }, 'Referral commission for package upgrades.');
            }
            if (!this.configs.has('COMMISSION_REAL_ESTATE_PRIMARY')) {
                await this.set('COMMISSION_REAL_ESTATE_PRIMARY', { value: 0.1 }, 'Commission for primary agent on real estate fulfillment.');
            }
            if (!this.configs.has('COMMISSION_REAL_ESTATE_OVERRIDE')) {
                await this.set('COMMISSION_REAL_ESTATE_OVERRIDE', { value: 0.05 }, 'Referral override commission on real estate fulfillment.');
            }
            if (!this.configs.has('COMMISSION_FURNITURE_PRIMARY')) {
                await this.set('COMMISSION_FURNITURE_PRIMARY', { value: 0.1 }, 'Commission for primary agent on furniture fulfillment.');
            }
            if (!this.configs.has('alert_bad_performance_limit')) {
                await this.set('alert_bad_performance_limit', 3, 'Number of rejected or unfulfilled assignments before flagging an agent.');
            }
            if (!this.configs.has('alert_dispute_pattern_limit')) {
                await this.set('alert_dispute_pattern_limit', 2, 'Number of disputes in a week before flagging a pattern alert.');
            }
            if (!this.configs.has('alert_spike_factor')) {
                await this.set('alert_spike_factor', 1.5, 'Multiplier for average hourly volume to detect request spikes.');
            }
            if (!this.configs.has('alert_spike_min_threshold')) {
                await this.set('alert_spike_min_threshold', 5, 'Minimum absolute number of requests in an hour to trigger a spike alert (avoids noise).');
            }
            if (!this.configs.has('emergency_lockdown')) {
                await this.set('emergency_lockdown', false, 'Emergency lockdown flag. When true, all non-administrative requests are rejected.');
            }
            if (!this.configs.has('withdrawal_min_amount')) {
                await this.set('withdrawal_min_amount', 100, 'Minimum AGLP amount allowed per withdrawal request.');
            }
            if (!this.configs.has('withdrawal_max_amount_daily')) {
                await this.set('withdrawal_max_amount_daily', 50000, 'Maximum cumulative AGLP amount allowed for withdrawal per agent per 24h window.');
            }
            if (!this.configs.has('withdrawal_fee_percentage')) {
                await this.set('withdrawal_fee_percentage', 0.05, 'Processing fee percentage applied to withdrawals (e.g., 0.05 for 5%).');
            }
            if (!this.configs.has('BANK_DETAILS_UPGRADE')) {
                await this.set('BANK_DETAILS_UPGRADE', {
                    bankName: 'Commercial Bank of Ethiopia',
                    accountNumber: '1000123456789',
                    accountHolder: 'Erkata Platform PLC',
                }, 'Designated bank details for package upgrades.');
            }
        }
        catch (error) {
            this.logger.error('[ConfigService] Error loading configs. Ensure Prisma models are generated.', error);
        }
    }
    get(key, defaultValue) {
        return this.configs.get(key) ?? defaultValue;
    }
    async set(key, value, description, actorId) {
        const oldValue = this.configs.get(key);
        await this.prisma.systemConfig.upsert({
            where: { key },
            update: { value, description },
            create: { key, value, description },
        });
        this.configs.set(key, value);
        if (actorId) {
            await this.prisma.auditLog.create({
                data: {
                    actorId,
                    action: 'SYSTEM_CONFIG_UPDATED',
                    targetTable: 'system_configs',
                    targetId: key,
                    metadata: {
                        oldValue,
                        newValue: value,
                        description,
                    },
                },
            });
        }
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = ConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfigService);
//# sourceMappingURL=config.service.js.map