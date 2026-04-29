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
exports.UpgradesController = void 0;
const common_1 = require("@nestjs/common");
const upgrades_service_1 = require("./upgrades.service");
const config_service_1 = require("../common/config.service");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
let UpgradesController = class UpgradesController {
    upgradesService;
    configService;
    constructor(upgradesService, configService) {
        this.upgradesService = upgradesService;
        this.configService = configService;
    }
    async getMyActiveRequest(req) {
        return this.upgradesService.getActiveRequestForUser(req.user.id);
    }
    async getBankDetails() {
        return await this.configService.get('BANK_DETAILS_UPGRADE');
    }
    async getPendingRequests() {
        return this.upgradesService.getPendingForOperator();
    }
    async getVerifiedRequests() {
        return this.upgradesService.getVerifiedForAdmin();
    }
    async createRequest(req, body) {
        return this.upgradesService.createRequest(req.user.id, body.targetTier);
    }
    async uploadProof(req, id, body) {
        return this.upgradesService.uploadProof(id, req.user.id, body.proofUrl);
    }
    async verifyRequest(req, id, body) {
        return this.upgradesService.verifyRequest(id, req.user.id, body.internalNote);
    }
    async approveRequest(req, id) {
        return this.upgradesService.approveRequest(id, req.user.id);
    }
    async rejectRequest(req, id, body) {
        return this.upgradesService.rejectRequest(id, req.user.id, body.reason);
    }
};
exports.UpgradesController = UpgradesController;
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UpgradesController.prototype, "getMyActiveRequest", null);
__decorate([
    (0, common_1.Get)('bank-details'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UpgradesController.prototype, "getBankDetails", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VERIFY_UPGRADE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UpgradesController.prototype, "getPendingRequests", null);
__decorate([
    (0, common_1.Get)('verified'),
    (0, guards_1.RequirePermission)(permissions_1.Action.APPROVE_UPGRADE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UpgradesController.prototype, "getVerifiedRequests", null);
__decorate([
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UpgradesController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Patch)(':id/proof'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UpgradesController.prototype, "uploadProof", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VERIFY_UPGRADE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UpgradesController.prototype, "verifyRequest", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, guards_1.RequirePermission)(permissions_1.Action.APPROVE_UPGRADE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UpgradesController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, guards_1.RequirePermission)(permissions_1.Action.APPROVE_UPGRADE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UpgradesController.prototype, "rejectRequest", null);
exports.UpgradesController = UpgradesController = __decorate([
    (0, common_1.Controller)('upgrades'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [upgrades_service_1.UpgradesService,
        config_service_1.ConfigService])
], UpgradesController);
//# sourceMappingURL=upgrades.controller.js.map