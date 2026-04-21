import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { AssignmentProcessor } from './assignment.processor';
import { RedisModule } from '../common/redis/redis.module';
import { AglpModule } from '../aglp/aglp.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: 'assignment-timeout' }),
    RedisModule,
    AglpModule,
  ],
  providers: [RequestsService, AssignmentProcessor],
  controllers: [RequestsController],
  exports: [RequestsService],
})
export class RequestsModule {}
