import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();
    const path = request.path; // Use path to exclude query parameters

    // 1. Explicitly Allow "safe" methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(method)) {
      return true;
    }

    // 2. Strict Path Matching for Exclusions
    // We allow login/register (no session yet) and refresh (needed to rotate/recover CSRF)
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];
    if (publicRoutes.some((route) => path === route || path === `${route}/`)) {
      return true;
    }

    // 3. Double Submit Cookie Validation for all other methods (POST, PUT, PATCH, DELETE, etc.)
    const csrfTokenHeader = request.headers['x-csrf-token'];
    const cookies = request.cookies as Record<string, string> | undefined;
    const csrfTokenCookie = cookies?.['csrfToken'];

    if (!csrfTokenHeader || !csrfTokenCookie) {
      this.logger.warn(
        `CSRF token missing: header=${!!csrfTokenHeader}, cookie=${!!csrfTokenCookie} for ${path}`,
      );
      throw new ForbiddenException('CSRF token missing');
    }

    if (csrfTokenHeader !== csrfTokenCookie) {
      this.logger.error(
        `CSRF token mismatch for ${path}: Header value does not match Cookie value. Possible sync issue in client storage.`,
      );
      throw new ForbiddenException('CSRF token mismatch');
    }

    return true;
  }
}
