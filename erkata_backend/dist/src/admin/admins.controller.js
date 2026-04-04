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
exports.AdminsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
const users_service_1 = require("../users/users.service");
const client_1 = require("@prisma/client");
const invite_service_1 = require("../auth/invite/invite.service");
let AdminsController = class AdminsController {
    prisma;
    inviteService;
    usersService;
    constructor(prisma, inviteService, usersService) {
        this.prisma = prisma;
        this.inviteService = inviteService;
        this.usersService = usersService;
    }
    async getPersonnel(role) {
        const normalizedRole = role?.toLowerCase();
        return this.prisma.profile.findMany({
            where: normalizedRole
                ? { role: normalizedRole }
                : {
                    OR: [{ role: client_1.UserRole.admin }, { role: client_1.UserRole.operator }],
                },
            select: {
                id: true,
                fullName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        operatorMatches: true,
                        resolutionProposals: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createInvite(req, body) {
        const callerRole = req.user.role;
        if (callerRole === client_1.UserRole.admin) {
            if (body.role === client_1.UserRole.admin || body.role === client_1.UserRole.super_admin) {
                throw new common_1.ForbiddenException('Admins are not permitted to invite other administrative-level users.');
            }
        }
        const invite = await this.inviteService.createInvite(body.email, body.fullName, body.phone, body.role, req.user.id);
        return {
            message: 'Personnel invite generated',
            inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/register/claim?token=${invite.token}`,
            invite,
        };
    }
    async getInvites(req) {
        const callerRole = req.user.role;
        const callerId = req.user.id;
        const createdById = callerRole === client_1.UserRole.admin ? callerId : undefined;
        return this.inviteService.findPendingInvites(createdById);
    }
    async cancelInvite(req, inviteId) {
        const callerRole = req.user.role;
        const callerId = req.user.id;
        const createdById = callerRole === client_1.UserRole.admin ? callerId : undefined;
        await this.inviteService.deleteInvite(inviteId, createdById);
        return { message: 'Invitation revoked successfully' };
    }
    async updateStatus(req, id, body) {
        const target = await this.prisma.profile.findUnique({
            where: { id },
        });
        if (!target)
            throw new common_1.NotFoundException('User profile not found');
        if (!this.usersService.canModifyUser(req.user.role, target.role)) {
            throw new common_1.ForbiddenException(`Your role (${req.user.role}) is not authorized to modify a ${target.role}`);
        }
        return this.prisma.profile.update({
            where: { id },
            data: { isActive: body.isActive },
        });
    }
};
exports.AdminsController = AdminsController;
__decorate([
    (0, common_1.Get)(),
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_ADMINS),
    __param(0, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "getPersonnel", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_ADMINS, permissions_1.Action.MANAGE_OPERATORS),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "createInvite", null);
__decorate([
    (0, common_1.Get)('invites'),
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_ADMINS, permissions_1.Action.MANAGE_OPERATORS),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "getInvites", null);
__decorate([
    (0, common_1.Delete)(':id/invite'),
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_ADMINS, permissions_1.Action.MANAGE_OPERATORS),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "cancelInvite", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_ADMINS),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "updateStatus", null);
exports.AdminsController = AdminsController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        invite_service_1.InviteService,
        users_service_1.UsersService])
], AdminsController);
//# sourceMappingURL=admins.controller.js.map