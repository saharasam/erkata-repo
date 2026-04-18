import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '../config.service';
import { UserRole } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../auth/guards/authenticated-request.interface';

interface JwtPayload {
  id: string;
  role: UserRole;
}

@Injectable()
export class LockdownGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

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

    // Bypass lockdown for Super Admins and Admins so they can manage the platform
    if (
      user &&
      (user.role === UserRole.super_admin || user.role === UserRole.admin)
    ) {
      return true;
    }

    // If running as a global guard, JwtAuthGuard may not have run yet.
    // Manually check for an admin token in the headers for emergency access.
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.decode(token) as JwtPayload | null;
        if (
          decoded &&
          (decoded.role === UserRole.super_admin ||
            decoded.role === UserRole.admin)
        ) {
          return true;
        }
      } catch {
        // Token invalid, proceed to common lockdown check
      }
    }

    throw new ServiceUnavailableException(
      'The Erkata Platform is currently in emergency lockdown mode. All non-administrative operations are suspended.',
    );
  }
}
