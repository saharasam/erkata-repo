import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '../config.service';
import { JwtService } from '@nestjs/jwt';
export declare class LockdownGuard implements CanActivate {
    private readonly configService;
    private readonly jwtService;
    constructor(configService: ConfigService, jwtService: JwtService);
    canActivate(context: ExecutionContext): boolean;
}
