import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaModule } from '../prisma/prisma.module';

import { NotificationsController } from './notifications.controller';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}

/*
- [x] Phase 1: Database Schema (Prisma)
    - [x] Add `Notification` model to `schema.prisma`
    - [x] Add `DISPUTED` to `RequestStatus` enum in `schema.prisma`
    - [x] Run `npx prisma migrate dev --name add_notifications_and_disputed`
- [x] Phase 2: Backend Notification System
    - [x] Create `NotificationsModule`, `Service`, and `Gateway`
    - [x] Implement Socket.io authentication (JWT)
*/
