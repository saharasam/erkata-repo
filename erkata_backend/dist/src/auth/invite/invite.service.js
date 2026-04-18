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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const users_service_1 = require("../../users/users.service");
const crypto_1 = require("crypto");
let InviteService = class InviteService {
    prisma;
    usersService;
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
    }
    async createInvite(email, fullName, phone, role, createdById, callerRole) {
        if (!this.usersService.canModifyUser(callerRole, role)) {
            throw new common_1.ForbiddenException(`Your role (${callerRole}) is not authorized to invite a ${role}`);
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 72);
        return await this.prisma.invite.create({
            data: {
                email,
                fullName,
                phone,
                role,
                token,
                expiresAt,
                createdById,
            },
        });
    }
    async validateInvite(token, email) {
        const invite = await this.prisma.invite.findUnique({
            where: { token },
        });
        if (!invite) {
            throw new common_1.NotFoundException('Invalid invite token');
        }
        if (invite.usedAt) {
            throw new common_1.BadRequestException('Invite token has already been used');
        }
        if (invite.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invite token has expired');
        }
        if (invite.email.toLowerCase() !== email.toLowerCase()) {
            throw new common_1.BadRequestException('This invite was intended for a different email address');
        }
        return invite;
    }
    async getInviteByToken(token) {
        const invite = await this.prisma.invite.findUnique({
            where: { token },
            select: {
                email: true,
                fullName: true,
                phone: true,
                role: true,
                expiresAt: true,
                usedAt: true,
            },
        });
        if (!invite) {
            throw new common_1.NotFoundException('Invalid invite token');
        }
        if (invite.usedAt) {
            throw new common_1.BadRequestException('Invite token has already been used');
        }
        if (invite.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invite token has expired');
        }
        return invite;
    }
    async markInviteAsUsed(token) {
        return await this.prisma.invite.update({
            where: { token },
            data: { usedAt: new Date() },
        });
    }
    async findPendingInvites(createdById) {
        return await this.prisma.invite.findMany({
            where: {
                usedAt: null,
                expiresAt: { gt: new Date() },
                ...(createdById ? { createdById } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteInvite(id, createdById) {
        const invite = await this.prisma.invite.findUnique({
            where: { id },
        });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (createdById && invite.createdById !== createdById) {
            throw new common_1.BadRequestException('You can only cancel your own invites');
        }
        if (invite.usedAt) {
            throw new common_1.BadRequestException('Cannot cancel an already used invite');
        }
        return await this.prisma.invite.delete({
            where: { id },
        });
    }
};
exports.InviteService = InviteService;
exports.InviteService = InviteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], InviteService);
//# sourceMappingURL=invite.service.js.map