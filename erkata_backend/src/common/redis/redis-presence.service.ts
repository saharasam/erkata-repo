import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RedisPresenceService implements OnModuleInit {
  private readonly logger = new Logger(RedisPresenceService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly subscriber: Redis,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
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
    setInterval(
      () => {
        this.runBackupSync().catch((err) => {
          this.logger.error(
            '[RedisPresenceService] Error during backup sync',
            err,
          );
        });
      },
      10 * 60 * 1000,
    ); // 10 minutes
  }

  private async runBackupSync() {
    this.logger.log('[RedisPresenceService] Running 10-minute backup sync...');
    const sqlOnlineOperators = await this.prisma.profile.findMany({
      where: { isOnline: true },
      select: { id: true },
    });

    const redisOnlineIds = await this.getOnlineOperatorIds();

    for (const op of sqlOnlineOperators) {
      if (!redisOnlineIds.includes(op.id)) {
        this.logger.warn(
          `[RedisPresenceService] Syncing: Operator ${op.id} is Offline in Redis but Online in SQL. Correcting...`,
        );
        await this.prisma.profile.update({
          where: { id: op.id },
          data: { isOnline: false },
        });
      }
    }
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
          data: { isOnline: false },
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
    const exists = await this.redis.exists(key);

    // Always ensure the DB reflects online status on every heartbeat.
    // Previously this was only done when the Redis key didn't exist, which meant
    // if the 30s key expired and the expiry handler set isOnline=false, the next
    // heartbeat would NOT re-set it before the assignment query ran — causing
    // the operator to be invisible to assignToNextReadyOperator.
    try {
      await this.prisma.profile.update({
        where: { id: operatorId },
        data: { isOnline: true },
      });
    } catch (err) {
      this.logger.error(
        `[RedisPresenceService] Failed to sync online status for ${operatorId}`,
        err,
      );
    }

    if (!exists) {
      // First heartbeat or back from offline — emit event so pending requests
      // in the queue get pushed to this now-online operator.
      this.logger.log(
        `[RedisPresenceService] Operator ${operatorId} came online. Emitting operator.online.`,
      );
      this.eventEmitter.emit('operator.online', { operatorId });
    }

    await this.redis.set(key, '1', 'EX', 30);
  }

  async getOnlineOperatorIds(): Promise<string[]> {
    const keys = await this.redis.keys('presence:operator:*');
    return keys.map((k) => k.split(':')[2]);
  }
}
