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
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const guards_1 = require("../auth/guards");
const permissions_1 = require("../auth/permissions");
let SystemBroadcastsController = class SystemBroadcastsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getBroadcasts() {
        return [
            {
                id: '1',
                title: 'Server Maintenance',
                content: 'Scheduled maintenance on Sunday.',
                target: 'EVERYONE',
                createdAt: new Date(),
            },
            {
                id: '2',
                title: 'New Referral Bonus',
                content: 'Earn 10% more this week.',
                target: 'AGENT',
                createdAt: new Date(),
            },
        ];
    }
    createBroadcast(data) {
        return {
            message: 'Broadcast dispatched successfully',
            broadcast: {
                ...data,
                id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date(),
            },
        };
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, guards_1.RequirePermission)(permissions_1.Action.VIEW_SYSTEM_STATISTICS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemBroadcastsController.prototype, "getBroadcasts", null);
__decorate([
    (0, common_1.Post)(),
    (0, guards_1.RequirePermission)(permissions_1.Action.MODIFY_GOVERNANCE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemBroadcastsController.prototype, "createBroadcast", null);
SystemBroadcastsController = __decorate([
    (0, common_1.Controller)('admin/broadcasts'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemBroadcastsController);
exports.default = SystemBroadcastsController;
//# sourceMappingURL=system-broadcasts.controller.js.map