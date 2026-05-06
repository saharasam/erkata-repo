import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RequestEventListener } from './events/request.events';
import { UploadsController } from './uploads.controller';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [UploadsController],
  providers: [ConfigService, RequestEventListener],
  exports: [ConfigService],
})
export class CommonModule {}
