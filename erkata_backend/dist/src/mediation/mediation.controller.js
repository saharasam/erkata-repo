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
exports.MediationController = void 0;
const common_1 = require("@nestjs/common");
const mediation_service_1 = require("./mediation.service");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
const client_1 = require("@prisma/client");
let MediationController = class MediationController {
    mediationService;
    constructor(mediationService) {
        this.mediationService = mediationService;
    }
    async submitFeedback(transactionId, req, body) {
        const userId = req.user.id;
        return this.mediationService.submitFeedback(transactionId, userId, body.content, body.rating);
    }
    async proposeResolution(bundleId, req, body) {
        const userId = req.user.id;
        return this.mediationService.proposeResolution(bundleId, userId, body.proposedText);
    }
    async finalizeResolution(proposalId, req, body) {
        const userId = req.user.id;
        return this.mediationService.finalizeResolution(proposalId, userId, body.approved, body.comment);
    }
    async finalizeBundle(bundleId, req, body) {
        const userId = req.user.id;
        return this.mediationService.finalizeBundleDirectly(bundleId, userId, body.resolutionText);
    }
    async getBundles(state) {
        return this.mediationService.getBundles(state);
    }
};
exports.MediationController = MediationController;
__decorate([
    (0, common_1.Post)('transaction/:id/feedback'),
    (0, guards_1.RequirePermission)(permissions_1.Action.SUBMIT_CUSTOMER_FEEDBACK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MediationController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Patch)('bundle/:id/propose'),
    (0, guards_1.RequirePermission)(permissions_1.Action.PROPOSE_RESOLUTION),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MediationController.prototype, "proposeResolution", null);
__decorate([
    (0, common_1.Post)('proposal/:id/finalize'),
    (0, guards_1.RequirePermission)(permissions_1.Action.FINALIZE_RESOLUTION),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MediationController.prototype, "finalizeResolution", null);
__decorate([
    (0, common_1.Post)('bundle/:id/finalize'),
    (0, guards_1.RequirePermission)(permissions_1.Action.FINALIZE_RESOLUTION),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MediationController.prototype, "finalizeBundle", null);
__decorate([
    (0, common_1.Get)('bundles'),
    (0, guards_1.RequirePermission)(permissions_1.Action.PROPOSE_RESOLUTION),
    __param(0, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediationController.prototype, "getBundles", null);
exports.MediationController = MediationController = __decorate([
    (0, common_1.Controller)('mediation'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [mediation_service_1.MediationService])
], MediationController);
//# sourceMappingURL=mediation.controller.js.map