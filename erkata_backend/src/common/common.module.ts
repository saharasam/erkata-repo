import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RequestEventListener } from './events/request.events';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [ConfigService, RequestEventListener],
  exports: [ConfigService],
})
export class CommonModule {}
