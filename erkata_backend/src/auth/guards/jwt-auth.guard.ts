import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: import('@nestjs/common').ExecutionContext,
  ) {
    if (err || !user) {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decodedHeader = require('jsonwebtoken').decode(token, {
            complete: true,
          });
          console.error('[JwtAuthGuard] Token Header:', decodedHeader?.header);
        } catch (e) {}
      }
      console.error('[JwtAuthGuard] Authentication failed:', {
        error: err?.message,
        info: info?.message,
        user: user ? 'Found' : 'Missing',
      });
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}
