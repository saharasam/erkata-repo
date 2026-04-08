import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BullModule } from '@nestjs/bullmq';
import { RequestsModule } from './requests/requests.module';
import { TransactionsModule } from './transactions/transactions.module';
import { MediationModule } from './mediation/mediation.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { CommonModule } from './common/common.module';
import { AdminModule } from './admin/admin.module';
import { AglpModule } from './aglp/aglp.module';
import { RedisModule } from './common/redis/redis.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Global event bus for request engine lifecycle events
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    RequestsModule,
    TransactionsModule,
    MediationModule,
    NotificationsModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    CommonModule,
    AdminModule,
    AglpModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        console.log(
          `[Request] ${req.method} ${req.originalUrl || req.url} - Auth: ${authHeader ? 'Present' : 'Missing'}`,
        );
        next();
      })
      .forRoutes('*');
  }
}
