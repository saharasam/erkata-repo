import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class CommonModule {}
