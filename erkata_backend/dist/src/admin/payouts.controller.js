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
exports.PayoutsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
const client_1 = require("@prisma/client");
const aglp_service_1 = require("../aglp/aglp.service");
let PayoutsController = class PayoutsController {
    prisma;
    aglpService;
    constructor(prisma, aglpService) {
        this.prisma = prisma;
        this.aglpService = aglpService;
    }
    async getPendingPayouts() {
        return this.prisma.aglpTransaction.findMany({
            where: {
                type: client_1.AglpTransactionType.WITHDRAWAL,
                status: client_1.AglpTransactionStatus.PENDING,
            },
            include: {
                profile: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approvePayout(id) {
        return this.prisma.$transaction(async (tx) => {
            return this.aglpService.completeWithdrawal(tx, id);
        });
    }
    async rejectPayout(id, reason) {
        if (!reason) {
            throw new common_1.BadRequestException('Reason is required for rejection');
        }
        return this.prisma.$transaction(async (tx) => {
            return this.aglpService.rejectWithdrawal(tx, id, reason);
        });
    }
    async getPendingEscrow() {
        return this.prisma.aglpTransaction.findMany({
            where: {
                type: client_1.AglpTransactionType.EARN,
                status: client_1.AglpTransactionStatus.PENDING,
                referenceType: 'COMMISSION_ESCROW',
            },
            include: {
                profile: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async releaseEscrow(id) {
        return this.prisma.$transaction(async (tx) => {
            return this.aglpService.releaseEscrow(tx, id);
        });
    }
    async getGlobalLedger(type, status, profileId) {
        return this.prisma.aglpTransaction.findMany({
            where: {
                type,
                status,
                profileId,
            },
            include: {
                profile: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PayoutsController = PayoutsController;
__decorate([
    (0, common_1.Get)('pending'),
    (0, guards_1.RequirePermission)(permissions_1.Action.APPROVE_PAYOUT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "getPendingPayouts", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, guards_1.RequirePermission)(permissions_1.Action.APPROVE_PAYOUT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "approvePayout", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, guards_1.RequirePermission)(permissions_1.Action.APPROVE_PAYOUT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "rejectPayout", null);
__decorate([
    (0, common_1.Get)('escrow'),
    (0, guards_1.RequirePermission)(permissions_1.Action.APPROVE_PAYOUT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "getPendingEscrow", null);
__decorate([
    (0, common_1.Post)(':id/release'),
    (0, guards_1.RequirePermission)(permissions_1.Action.APPROVE_PAYOUT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "releaseEscrow", null);
__decorate([
    (0, common_1.Get)('ledger'),
    (0, guards_1.RequirePermission)(permissions_1.Action.MODIFY_GOVERNANCE),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "getGlobalLedger", null);
exports.PayoutsController = PayoutsController = __decorate([
    (0, common_1.Controller)('admin/payouts'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        aglp_service_1.AglpService])
], PayoutsController);
//# sourceMappingURL=payouts.controller.js.map