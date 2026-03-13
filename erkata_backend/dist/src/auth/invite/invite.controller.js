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
exports.InviteController = void 0;
const common_1 = require("@nestjs/common");
const invite_service_1 = require("./invite.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const require_permission_decorator_1 = require("../guards/require-permission.decorator");
const permissions_1 = require("../permissions");
const client_1 = require("@prisma/client");
let InviteController = class InviteController {
    inviteService;
    constructor(inviteService) {
        this.inviteService = inviteService;
    }
    async generateInvite(req, body) {
        const authReq = req;
        if (body.role === client_1.UserRole.super_admin || body.role === client_1.UserRole.admin) {
            if (authReq.user.role !== client_1.UserRole.super_admin) {
                throw new common_1.ForbiddenException('Only a Super Admin can invite and create other Administrators');
            }
        }
        const invite = await this.inviteService.createInvite(body.email, body.role, authReq.user.id);
        return {
            message: 'Invite generated successfully',
            inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?token=${invite.token}&email=${encodeURIComponent(invite.email)}&role=${invite.role}`,
            token: invite.token,
        };
    }
};
exports.InviteController = InviteController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Action.MANAGE_ADMINS),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InviteController.prototype, "generateInvite", null);
exports.InviteController = InviteController = __decorate([
    (0, common_1.Controller)('admin/invites'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [invite_service_1.InviteService])
], InviteController);
//# sourceMappingURL=invite.controller.js.map