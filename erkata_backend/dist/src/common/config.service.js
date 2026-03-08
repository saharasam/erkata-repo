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
let ConfigService = ConfigService_1 = class ConfigService {
    prisma;
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
                await this.set('high_risk_threshold_etb', 100000, 'Threshold for Super Admin escalation');
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