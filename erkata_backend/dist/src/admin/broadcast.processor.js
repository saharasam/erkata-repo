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
var BroadcastProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let BroadcastProcessor = BroadcastProcessor_1 = class BroadcastProcessor extends bullmq_1.WorkerHost {
    prisma;
    notificationsGateway;
    logger = new common_1.Logger(BroadcastProcessor_1.name);
    constructor(prisma, notificationsGateway) {
        super();
        this.prisma = prisma;
        this.notificationsGateway = notificationsGateway;
    }
    async process(job) {
        if (job.name === 'send-broadcast') {
            const { title, content, target } = job.data;
            this.logger.log(`[BroadcastProcessor] Starting broadcast: ${title} (Target: ${target})`);
            const userWhere = {};
            if (target === 'AGENT')
                userWhere.role = 'agent';
            else if (target === 'OPERATOR')
                userWhere.role = 'operator';
            else if (target === 'ADMIN')
                userWhere.role = 'admin';
            else if (target === 'FINANCE_OP')
                userWhere.role = 'financial_operator';
            let cursor;
            const chunkSize = 1000;
            let totalProcessed = 0;
            while (true) {
                const users = await this.prisma.profile.findMany({
                    where: userWhere,
                    take: chunkSize,
                    skip: cursor ? 1 : 0,
                    cursor: cursor ? { id: cursor } : undefined,
                    select: { id: true },
                    orderBy: { id: 'asc' },
                });
                if (users.length === 0)
                    break;
                this.logger.log(`[BroadcastProcessor] Processing chunk of ${users.length} users...`);
                await this.prisma.notification.createMany({
                    data: users.map((u) => ({
                        userId: u.id,
                        title: `System Broadcast: ${title}`,
                        message: content || 'New system announcement published.',
                        type: 'SYSTEM_BROADCAST',
                        link: '/dashboard/notices',
                    })),
                    skipDuplicates: true,
                });
                totalProcessed += users.length;
                cursor = users[users.length - 1].id;
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            this.logger.log(`[BroadcastProcessor] Emitting WebSocket broadcast to target...`);
            if (target === 'EVERYONE') {
                this.notificationsGateway.server.emit('notification', {
                    type: 'system_broadcast',
                    title,
                    message: content,
                });
            }
            else {
                let targetRole = target.toLowerCase();
                if (target === 'FINANCE_OP')
                    targetRole = 'financial_operator';
                this.notificationsGateway.sendToRole(targetRole, 'notification', {
                    type: 'system_broadcast',
                    title,
                    message: content,
                });
            }
            this.logger.log(`[BroadcastProcessor] Completed broadcast. Total users notified: ${totalProcessed}`);
            return { totalProcessed };
        }
    }
};
exports.BroadcastProcessor = BroadcastProcessor;
exports.BroadcastProcessor = BroadcastProcessor = BroadcastProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('broadcast'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationsGateway])
], BroadcastProcessor);
//# sourceMappingURL=broadcast.processor.js.map