import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MockUserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Simulate different roles by changing the 'x-mock-role' header
    const roleHeader = req.headers['x-mock-role'] as string;

    (req as any)['user'] = {
      id: 'mock-user-id',
      role: roleHeader || 'CUSTOMER',
    };
    next();
  }
}
