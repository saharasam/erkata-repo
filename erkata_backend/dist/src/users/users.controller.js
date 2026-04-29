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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
const client_1 = require("@prisma/client");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getUsers(req, role, isActive) {
        return this.usersService.findAll(req.user.role, {
            role,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }
    async getMe(req) {
        return this.usersService.getCurrentProfile(req.user.id);
    }
    async getFinance(req) {
        return this.usersService.getFinanceSummary(req.user.id);
    }
    async getAvailablePackages() {
        return this.usersService.getAvailablePackages();
    }
    async requestWithdrawal(req, body) {
        return this.usersService.requestWithdrawal(req.user.id, body.amount, {
            bankName: body.bankName,
            bankAccountNumber: body.bankAccountNumber,
            bankAccountHolder: body.bankAccountHolder,
        });
    }
    async generateReferralCode(req) {
        return this.usersService.generateReferralCode(req.user.id);
    }
    async assignZone(req, agentId, body) {
        const callerRole = req.user.role;
        return this.usersService.assignZone(callerRole, agentId, body.zoneId, body.woreda);
    }
    async updateTier(req, agentId, body) {
        const callerRole = req.user.role;
        return this.usersService.updateTier(callerRole, agentId, body.tier);
    }
    async purchasePackage(req, body) {
        return this.usersService.purchasePackage(req.user.id, body.tier, body.paymentMethod);
    }
    async suspendUser(req, userId) {
        const callerRole = req.user.role;
        return this.usersService.suspendUser(callerRole, userId);
    }
    async activateUser(req, userId) {
        const callerRole = req.user.role;
        return this.usersService.activateUser(callerRole, userId);
    }
    async updateBusinessProfile(req, body) {
        return this.usersService.updateBusinessProfile(req.user.id, body);
    }
    async getUserProfile(userId) {
        return this.usersService.getCurrentProfile(userId);
    }
    async getUserFinance(userId) {
        return this.usersService.getFinanceSummary(userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_AGENTS),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('me/finance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFinance", null);
__decorate([
    (0, common_1.Get)('me/available-packages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAvailablePackages", null);
__decorate([
    (0, common_1.Post)('me/withdraw'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "requestWithdrawal", null);
__decorate([
    (0, common_1.Post)('me/referral-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "generateReferralCode", null);
__decorate([
    (0, common_1.Post)('agent/:id/zones'),
    (0, guards_1.RequirePermission)(permissions_1.Action.ASSIGN_ZONES),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignZone", null);
__decorate([
    (0, common_1.Patch)('agent/:id/tier'),
    (0, guards_1.RequirePermission)(permissions_1.Action.UPDATE_TIER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateTier", null);
__decorate([
    (0, common_1.Post)('me/package'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "purchasePackage", null);
__decorate([
    (0, common_1.Patch)(':id/suspend'),
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_AGENTS),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_AGENTS),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "activateUser", null);
__decorate([
    (0, common_1.Patch)('me/business'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateBusinessProfile", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_USER_DETAILS_ANY_ROLE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Get)(':id/finance'),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_USER_DETAILS_ANY_ROLE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserFinance", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map