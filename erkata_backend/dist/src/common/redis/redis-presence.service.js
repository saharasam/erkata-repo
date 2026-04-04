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
var RedisPresenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisPresenceService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const prisma_service_1 = require("../../prisma/prisma.service");
let RedisPresenceService = RedisPresenceService_1 = class RedisPresenceService {
    redis;
    subscriber;
    prisma;
    logger = new common_1.Logger(RedisPresenceService_1.name);
    constructor(redis, subscriber, prisma) {
        this.redis = redis;
        this.subscriber = subscriber;
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.redis.config('SET', 'notify-keyspace-events', 'Ex');
            this.logger.log('[RedisPresenceService] Redis keyspace notifications enabled ("Ex")');
        }
        catch (err) {
            this.logger.error('[RedisPresenceService] Failed to enable Redis keyspace notifications. Check permissions.', err);
        }
        await this.subscriber.subscribe('__keyevent@0__:expired');
        this.subscriber.on('message', (channel, message) => {
            this.handleExpiredKey(message).catch((err) => {
                this.logger.error(`[RedisPresenceService] Error handling expired key ${message}`, err);
            });
        });
        this.startBackupSync();
    }
    startBackupSync() {
        setInterval(async () => {
            this.logger.log('[RedisPresenceService] Running 10-minute backup sync...');
            try {
                const sqlOnlineOperators = await this.prisma.profile.findMany({
                    where: { isOnline: true },
                    select: { id: true },
                });
                const redisOnlineIds = await this.getOnlineOperatorIds();
                for (const op of sqlOnlineOperators) {
                    if (!redisOnlineIds.includes(op.id)) {
                        this.logger.warn(`[RedisPresenceService] Syncing: Operator ${op.id} is Offline in Redis but Online in SQL. Correcting...`);
                        await this.prisma.profile.update({
                            where: { id: op.id },
                            data: { isOnline: false },
                        });
                    }
                }
            }
            catch (err) {
                this.logger.error('[RedisPresenceService] Error during backup sync', err);
            }
        }, 10 * 60 * 1000);
    }
    async handleExpiredKey(message) {
        if (message.startsWith('presence:operator:')) {
            const operatorId = message.split(':')[2];
            this.logger.log(`[RedisPresenceService] Presence expired for operator: ${operatorId}. Syncing SQL...`);
            try {
                await this.prisma.profile.update({
                    where: { id: operatorId },
                    data: { isOnline: false },
                });
                this.logger.log(`[RedisPresenceService] Operator ${operatorId} marked as Offline in SQL.`);
            }
            catch (err) {
                this.logger.error(`[RedisPresenceService] Failed to sync offline status for ${operatorId}`, err);
            }
        }
    }
    async heartbeat(operatorId) {
        const key = `presence:operator:${operatorId}`;
        const exists = await this.redis.exists(key);
        if (!exists) {
            try {
                await this.prisma.profile.update({
                    where: { id: operatorId },
                    data: { isOnline: true, lastAssignmentAt: new Date() },
                });
                this.logger.log(`[RedisPresenceService] Operator ${operatorId} marked as Online in SQL.`);
            }
            catch (err) {
                this.logger.error(`[RedisPresenceService] Failed to sync online status for ${operatorId}`, err);
            }
        }
        await this.redis.set(key, '1', 'EX', 30);
    }
    async getOnlineOperatorIds() {
        const keys = await this.redis.keys('presence:operator:*');
        return keys.map((k) => k.split(':')[2]);
    }
};
exports.RedisPresenceService = RedisPresenceService;
exports.RedisPresenceService = RedisPresenceService = RedisPresenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __param(1, (0, common_1.Inject)('REDIS_SUBSCRIBER')),
    __metadata("design:paramtypes", [ioredis_1.Redis,
        ioredis_1.Redis,
        prisma_service_1.PrismaService])
], RedisPresenceService);
//# sourceMappingURL=redis-presence.service.js.map