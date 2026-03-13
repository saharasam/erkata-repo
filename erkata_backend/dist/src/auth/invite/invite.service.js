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
const crypto_1 = require("crypto");
let InviteService = class InviteService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createInvite(email, role, createdById) {
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);
        return this.prisma.invite.create({
            data: {
                email,
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
    async markInviteAsUsed(token) {
        return this.prisma.invite.update({
            where: { token },
            data: { usedAt: new Date() },
        });
    }
};
exports.InviteService = InviteService;
exports.InviteService = InviteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InviteService);
//# sourceMappingURL=invite.service.js.map