import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '../config.service';
export declare class LockdownGuard implements CanActivate {
    private readonly configService;
    constructor(configService: ConfigService);
    canActivate(context: ExecutionContext): boolean;
}
