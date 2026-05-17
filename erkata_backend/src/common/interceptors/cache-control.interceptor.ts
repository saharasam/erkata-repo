import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response, Request } from 'express';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { user?: any }>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        // Only apply to authenticated requests (those with a user object from JwtStrategy)
        // and only on GET requests to prevent caching of PII/sensitive state.
        if (request.user && request.method === 'GET') {
          response.setHeader(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          );
          response.setHeader('Pragma', 'no-cache');
          response.setHeader('Expires', '0');
        }
      }),
    );
  }
}
