import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      body: unknown;
      ip: string;
      headers: Record<string, string>;
      user?: { id: string };
    }>();
    const { method, url, body, user } = request;

    // Only audit mutations (POST, PATCH, DELETE)
    const monitoredMethods = ['POST', 'PATCH', 'DELETE'];
    if (!monitoredMethods.includes(method)) {
      return next.handle();
    }

    // Exclude certain paths (e.g., login, health) if necessary
    const excludedPaths = ['/auth/login', '/auth/register', '/auth/refresh'];
    if (excludedPaths.some((path) => url.includes(path))) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((response: unknown) => {
        void (async () => {
          try {
            // Attempt to extract target information from URL or body
            const segments = url.split('/').filter(Boolean);
            const targetTable = segments[0] || 'Unknown';

            let targetIdFromContext: string | null = segments[1] || null;
            if (!targetIdFromContext && body && typeof body === 'object') {
              const bodyRecord = body as Record<string, unknown>;
              if (typeof bodyRecord.id === 'string') {
                targetIdFromContext = bodyRecord.id;
              } else if (bodyRecord.id) {
                targetIdFromContext = JSON.stringify(bodyRecord.id);
              }
            }

            await this.prisma.auditLog.create({
              data: {
                actorId: user?.id || null,
                action: `${method} ${url}`,
                targetTable,
                targetId: targetIdFromContext,
                metadata: {
                  requestBody: this.redact(body),
                  ip: request.ip,
                  userAgent: request.headers['user-agent'],
                  response: response ? this.redact(response) : null,
                },
              },
            });
          } catch (error) {
            console.error(
              '[AuditInterceptor] Failed to record audit log:',
              error,
            );
          }
        })();
      }),
    );
  }

  private redact(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveKeys = [
      'password',
      'currentPassword',
      'oldPassword',
      'newPassword',
      'pass',
      'token',
      'refreshToken',
      'csrfToken',
      'tinNumber',
      'tradeLicenseNumber',
      'phone',
      'accountNumber',
      'bankAccountNumber',
      'bankAccountHolder',
      'email',
      'fullName',
      'customerName',
      'avatarUrl',
    ];

    if (Array.isArray(data)) {
      return data.map((item) => this.redact(item));
    }

    const redacted = { ...data };
    for (const key in redacted) {
      if (
        sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))
      ) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redact(redacted[key]);
      }
    }
    return redacted;
  }
}
