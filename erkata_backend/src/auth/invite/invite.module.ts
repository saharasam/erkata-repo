import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
