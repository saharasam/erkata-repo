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
const client_1 = require("@prisma/client");
let AdminsController = class AdminsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPersonnel(role) {
        return this.prisma.profile.findMany({
            where: role
                ? { role }
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
        const invite = await this.prisma.invite.create({
            data: {
                email: body.email,
                role: body.role,
                token: Math.random().toString(36).substring(7),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                createdById: req.user.id,
            },
        });
        return {
            message: 'Personnel invite generated',
            inviteUrl: `https://erkata.com/register/claim?token=${invite.token}`,
            invite,
        };
    }
    async updateStatus(id, body) {
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
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_ADMINS),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "createInvite", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, guards_1.RequirePermission)(permissions_1.Action.MANAGE_ADMINS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminsController.prototype, "updateStatus", null);
exports.AdminsController = AdminsController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminsController);
//# sourceMappingURL=admins.controller.js.map