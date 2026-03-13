import { Module } from '@nestjs/common';
import { AdminConfigController } from './config.controller';
import { AuditLogsController } from './audit-logs.controller';
import { AdminsController } from './admins.controller';
import AnalyticsController from './analytics.controller';
import SystemBroadcastsController from './system-broadcasts.controller';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [
    AdminConfigController,
    AuditLogsController,
    AdminsController,
    AnalyticsController,
    SystemBroadcastsController,
  ],
})
export class AdminModule {}
