import { Module } from '@nestjs/common';
import { AdminConfigController } from './config.controller';
import { AdminPackagesController } from './packages.controller';
import { AuditLogsController } from './audit-logs.controller';
import { AdminsController } from './admins.controller';
import AnalyticsController from './analytics.controller';
import SystemBroadcastsController from './system-broadcasts.controller';
import { PayoutsController } from './payouts.controller';
import { AlertsController } from './alerts.controller';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AglpModule } from '../aglp/aglp.module';
import { InviteModule } from '../auth/invite/invite.module';
import { UsersModule } from '../users/users.module';
import { AlertsService } from './alerts.service';

@Module({
  imports: [CommonModule, PrismaModule, AglpModule, InviteModule, UsersModule],
  controllers: [
    AdminConfigController,
    AdminPackagesController,
    AuditLogsController,
    AdminsController,
    AnalyticsController,
    SystemBroadcastsController,
    PayoutsController,
    AlertsController,
  ],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AdminModule {}
