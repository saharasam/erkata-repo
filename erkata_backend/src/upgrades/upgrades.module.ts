import { Module } from '@nestjs/common';
import { UpgradesService } from './upgrades.service';
import { UpgradesController } from './upgrades.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, NotificationsModule, UsersModule],
  controllers: [UpgradesController],
  providers: [UpgradesService],
  exports: [UpgradesService],
})
export class UpgradesModule {}
