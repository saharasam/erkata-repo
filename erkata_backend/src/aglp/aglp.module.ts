import { Module } from '@nestjs/common';
import { AglpService } from './aglp.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AglpService],
  exports: [AglpService],
})
export class AglpModule {}
