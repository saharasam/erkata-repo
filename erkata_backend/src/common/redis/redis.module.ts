import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisPresenceService } from './redis-presence.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    RedisPresenceService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        });
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: () => {
        const subscriber = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        });
        // Enable keyspace notifications on the subscriber client if needed,
        // although it's better done on a persistent client or on Redis itself.
        return subscriber;
      },
    },
  ],
  exports: ['REDIS_CLIENT', 'REDIS_SUBSCRIBER', RedisPresenceService],
})
export class RedisModule {}
