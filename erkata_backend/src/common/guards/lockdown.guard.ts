import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '../config.service';
import { UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../../auth/guards/authenticated-request.interface';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tier: string;
}

@Injectable()
export class LockdownGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isLockdown = this.configService.get<boolean>(
      'emergency_lockdown',
      false,
    );

    if (!isLockdown) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const url = request.url;

    // Always allow authentication routes so users can log in
    if (url.startsWith('/auth')) {
      return true;
    }

    const user = request.user;

    // Bypass lockdown for Super Admins and Admins so they can manage the platform.
    // This handles cases where JwtAuthGuard has already processed the request.
    if (
      user &&
      (user.role === UserRole.super_admin || user.role === UserRole.admin)
    ) {
      return true;
    }

    // If running as a global guard, JwtAuthGuard may not have run yet for this cycle.
    // We manually verify the token in the headers for emergency administrative access.
    const authHeader = request.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // SECURITY FIX: Using verify instead of decode to ensure cryptographic integrity.
        // This prevents forged tokens from bypassing the platform lockdown.
        const decoded = this.jwtService.verify<JwtPayload>(token);
        if (
          decoded &&
          (decoded.role === UserRole.super_admin ||
            decoded.role === UserRole.admin)
        ) {
          return true;
        }
      } catch {
        // Token invalid or expired, continue to block request.
      }
    }

    throw new ServiceUnavailableException(
      'The Erkata Platform is currently in emergency lockdown mode. All non-administrative operations are suspended.',
    );
  }
}
