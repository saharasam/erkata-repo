import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediationService } from './mediation.service';
import { MediationController } from './mediation.controller';
import { MediationProcessor } from './mediation.processor';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mediation',
    }),
    CommonModule,
  ],
  providers: [MediationService, MediationProcessor],
  controllers: [MediationController],
  exports: [MediationService],
})
export class MediationModule {}
