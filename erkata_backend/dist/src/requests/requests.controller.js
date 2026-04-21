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
exports.RequestsController = void 0;
const common_1 = require("@nestjs/common");
const requests_service_1 = require("./requests.service");
const permissions_1 = require("../auth/permissions");
const guards_1 = require("../auth/guards");
let RequestsController = class RequestsController {
    requestsService;
    constructor(requestsService) {
        this.requestsService = requestsService;
    }
    createRequest(req, dto) {
        const user = req.user;
        return this.requestsService.createRequest(user.id, dto);
    }
    getQueue(zoneId) {
        return this.requestsService.getOperatorQueue({ zoneId });
    }
    getMyRequests(req) {
        const user = req.user;
        return this.requestsService.getCustomerRequests(user.id);
    }
    findEligibleAgents() {
        return this.requestsService.findEligibleAgents();
    }
    getDisputeHistory() {
        return this.requestsService.getDisputeHistory();
    }
    getRequest(id, req) {
        const user = req.user;
        return this.requestsService.getRequest(id, user.id, user.role);
    }
    assignAgent(id, agentId, req) {
        return this.requestsService.assignAgent(id, agentId, req.user.id);
    }
    getStatus(id, req) {
        const user = req.user;
        return this.requestsService.getRequest(id, user.id, user.role);
    }
    confirmFulfillment(id, confirmed, req) {
        return this.requestsService.confirmFulfillment(id, req.user.id, confirmed);
    }
    resolveDispute(id, req, note) {
        return this.requestsService.resolveDispute(id, req.user.id, note);
    }
    escalateDispute(id, req, note) {
        return this.requestsService.escalateDispute(id, req.user.id, note);
    }
    voidDispute(id, req, note) {
        return this.requestsService.voidDispute(id, req.user.id, note);
    }
    forceComplete(id, req, note) {
        return this.requestsService.forceComplete(id, req.user.id, note);
    }
};
exports.RequestsController = RequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, guards_1.RequirePermission)(permissions_1.Action.CREATE_REQUEST),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)('queue'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_QUEUE),
    __param(0, (0, common_1.Query)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "getQueue", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_OWN_REQUESTS),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "getMyRequests", null);
__decorate([
    (0, common_1.Get)('eligible-agents'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_AGENTS_LIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findEligibleAgents", null);
__decorate([
    (0, common_1.Get)('admin/dispute-history'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_SYSTEM_STATISTICS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "getDisputeHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_ASSIGNED_REQUEST_DETAILS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "getRequest", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, guards_1.RequirePermission)(permissions_1.Action.ASSIGN_AGENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('agentId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "assignAgent", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)(':id/confirm-fulfillment'),
    (0, guards_1.RequirePermission)(permissions_1.Action.CONFIRM_FULFILLMENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('confirmed')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "confirmFulfillment", null);
__decorate([
    (0, common_1.Patch)(':id/resolve-dispute'),
    (0, guards_1.RequirePermission)(permissions_1.Action.RESOLVE_DISPUTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "resolveDispute", null);
__decorate([
    (0, common_1.Patch)(':id/escalate-dispute'),
    (0, guards_1.RequirePermission)(permissions_1.Action.ESCALATE_DISPUTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "escalateDispute", null);
__decorate([
    (0, common_1.Patch)(':id/void-dispute'),
    (0, guards_1.RequirePermission)(permissions_1.Action.RESOLVE_DISPUTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "voidDispute", null);
__decorate([
    (0, common_1.Post)(':id/force-complete'),
    (0, guards_1.RequirePermission)(permissions_1.Action.RESOLVE_DISPUTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "forceComplete", null);
exports.RequestsController = RequestsController = __decorate([
    (0, common_1.Controller)('requests'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [requests_service_1.RequestsService])
], RequestsController);
//# sourceMappingURL=requests.controller.js.map