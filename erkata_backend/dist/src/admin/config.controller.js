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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminConfigController = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../common/config.service");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
let AdminConfigController = class AdminConfigController {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    getAllConfigs() {
        return [
            {
                key: 'high_risk_threshold_etb',
                value: this.configService.get('high_risk_threshold_etb', config_service_1.ConfigService.DEFAULT_RISK_THRESHOLD),
                description: 'Threshold for automatic escalation to Super Admin.',
            },
            {
                key: 'auto_bundle',
                value: this.configService.get('auto_bundle', true),
                description: 'Automatically bundle feedback after both parties submit.',
            },
            {
                key: 'referral_commissions',
                value: this.configService.get('referral_commissions', true),
                description: 'Enable/disable referral payout logic.',
            },
            {
                description: 'Suspend all platform transactions.',
            },
            {
                key: 'AGLP_TO_ETB_RATE',
                value: this.configService.get('AGLP_TO_ETB_RATE', { rate: 1.0 }),
                description: 'Primary exchange rate from ETB to AGLP.',
            },
            {
                key: 'AGLP_COMMISSION_PACKAGE_REFERRAL',
                value: this.configService.get('AGLP_COMMISSION_PACKAGE_REFERRAL', {
                    value: 0.1,
                }),
                description: 'Super Admin: Referral commission for package upgrades.',
            },
            {
                key: 'COMMISSION_REAL_ESTATE_PRIMARY',
                value: this.configService.get('COMMISSION_REAL_ESTATE_PRIMARY', {
                    value: 0.1,
                }),
                description: 'Super Admin: Primary agent commission for real estate.',
            },
            {
                key: 'COMMISSION_REAL_ESTATE_OVERRIDE',
                value: this.configService.get('COMMISSION_REAL_ESTATE_OVERRIDE', {
                    value: 0.05,
                }),
                description: 'Super Admin: Referral override for real estate.',
            },
            {
                key: 'COMMISSION_FURNITURE_PRIMARY',
                value: this.configService.get('COMMISSION_FURNITURE_PRIMARY', {
                    value: 0.1,
                }),
                description: 'Super Admin: Primary agent commission for furniture.',
            },
            {
                key: 'alert_bad_performance_limit',
                value: this.configService.get('alert_bad_performance_limit', 3),
                description: 'Alert: Rejects + Unfulfilled assignments before flagging.',
            },
            {
                key: 'alert_dispute_pattern_limit',
                value: this.configService.get('alert_dispute_pattern_limit', 2),
                description: 'Alert: Weekly dispute count for pattern flagging.',
            },
            {
                key: 'alert_spike_factor',
                value: this.configService.get('alert_spike_factor', 1.5),
                description: 'Alert: Volume multiplier for request spikes.',
            },
            {
                key: 'alert_spike_min_threshold',
                value: this.configService.get('alert_spike_min_threshold', 5),
                description: 'Alert: Noise floor for spike detection.',
            },
        ];
    }
    async updateConfig(req, body) {
        const superAdminKeys = [
            'AGLP_TO_ETB_RATE',
            'AGLP_COMMISSION_PACKAGE_REFERRAL',
            'COMMISSION_REAL_ESTATE_PRIMARY',
            'COMMISSION_REAL_ESTATE_OVERRIDE',
            'COMMISSION_FURNITURE_PRIMARY',
            'high_risk_threshold_etb',
            'alert_bad_performance_limit',
            'alert_dispute_pattern_limit',
            'alert_spike_factor',
            'alert_spike_min_threshold',
        ];
        if (superAdminKeys.includes(body.key) && req.user.role !== 'super_admin') {
            throw new common_1.ForbiddenException('Only Super Admin can modify platform economic policy');
        }
        await this.configService.set(body.key, body.value, body.description, req.user.id);
        return { success: true, key: body.key, value: body.value };
    }
};
exports.AdminConfigController = AdminConfigController;
__decorate([
    (0, common_1.Get)(),
    (0, guards_1.RequirePermission)(permissions_1.Action.MODIFY_GOVERNANCE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminConfigController.prototype, "getAllConfigs", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminConfigController.prototype, "updateConfig", null);
exports.AdminConfigController = AdminConfigController = __decorate([
    (0, common_1.Controller)('admin/config'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], AdminConfigController);
//# sourceMappingURL=config.controller.js.map