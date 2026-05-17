import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AglpModule } from '../aglp/aglp.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AglpModule, forwardRef(() => AuthModule)],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
