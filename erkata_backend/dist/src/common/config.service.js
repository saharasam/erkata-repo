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
        }
        catch (error) {
            this.logger.error('[ConfigService] Error loading configs. Ensure Prisma models are generated.', error);
        }
    }
    get(key, defaultValue) {
        return this.configs.get(key) ?? defaultValue;
    }
    async set(key, value, description) {
        await this.prisma.systemConfig.upsert({
            where: { key },
            update: { value, description },
            create: { key, value, description },
        });
        this.configs.set(key, value);
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = ConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfigService);
//# sourceMappingURL=config.service.js.map