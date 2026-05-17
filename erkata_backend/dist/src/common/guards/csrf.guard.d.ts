import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class CsrfGuard implements CanActivate {
    private readonly logger;
    canActivate(context: ExecutionContext): boolean;
}
