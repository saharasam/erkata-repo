import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RedisPresenceService implements OnModuleInit {
  private readonly logger = new Logger(RedisPresenceService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly subscriber: Redis,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    // 1. Enable Keyspace Notifications on the main client
    try {
      await this.redis.config('SET', 'notify-keyspace-events', 'Ex');
      this.logger.log(
        '[RedisPresenceService] Redis keyspace notifications enabled ("Ex")',
      );
    } catch (err) {
      this.logger.error(
        '[RedisPresenceService] Failed to enable Redis keyspace notifications. Check permissions.',
        err,
      );
    }

    // 2. Subscribe to expiration events on the subscriber client
    // The format for keyspace events is: __keyevent@<db>__:expired
    // Assuming DB 0 for now.
    await this.subscriber.subscribe('__keyevent@0__:expired');

    this.subscriber.on('message', (channel, message) => {
      this.handleExpiredKey(message).catch((err) => {
        this.logger.error(
          `[RedisPresenceService] Error handling expired key ${message}`,
          err,
        );
      });
    });

    // 3. Start 10-minute backup sync routine
    this.startBackupSync();
  }

  private startBackupSync() {
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
              data: { isOnline: false } as any,
            });
          }
        }
      } catch (err) {
        this.logger.error('[RedisPresenceService] Error during backup sync', err);
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  private async handleExpiredKey(message: string) {
    if (message.startsWith('presence:operator:')) {
      const operatorId = message.split(':')[2];
      this.logger.log(
        `[RedisPresenceService] Presence expired for operator: ${operatorId}. Syncing SQL...`,
      );

      try {
        await this.prisma.profile.update({
          where: { id: operatorId },
          data: { isOnline: false } as any,
        });
        this.logger.log(
          `[RedisPresenceService] Operator ${operatorId} marked as Offline in SQL.`,
        );
      } catch (err) {
        this.logger.error(
          `[RedisPresenceService] Failed to sync offline status for ${operatorId}`,
          err,
        );
      }
    }
  }

  async heartbeat(operatorId: string) {
    const key = `presence:operator:${operatorId}`;
    
    // Check if they were already online in SQL
    // To minimize SQL writes, we could cache this in Redis too, but let's keep it simple first
    // and only sync when the key is *created* if we want to tracking "Login"
    // However, the customer's requirement was: "Redis updates instantly. The main database does nothing."
    // and "Redis sends one update when the threshold is crossed."
    
    // We do need to handle the "Go Online" moment.
    // If the key doesn't exist, it's their "first" heartbeat or they were offline.
    const exists = await this.redis.exists(key);
    
    if (!exists) {
      // First heartbeat or back from offline - Sync SQL to Online
      try {
        await this.prisma.profile.update({
          where: { id: operatorId },
          data: { isOnline: true, lastAssignmentAt: new Date() } as any,
        });
        this.logger.log(
          `[RedisPresenceService] Operator ${operatorId} marked as Online in SQL.`,
        );
      } catch (err) {
        this.logger.error(
          `[RedisPresenceService] Failed to sync online status for ${operatorId}`,
          err,
        );
      }
    }

    await this.redis.set(key, '1', 'EX', 30);
  }

  async getOnlineOperatorIds(): Promise<string[]> {
    const keys = await this.redis.keys('presence:operator:*');
    return keys.map((k) => k.split(':')[2]);
  }
}
