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
                  requestBody: body as object,
                  response:
                    response && typeof response === 'object'
                      ? { ...response }
                      : null,
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
}
