import { AuditInterceptor } from './audit.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      },
    } as unknown as PrismaService;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    interceptor = new AuditInterceptor(prismaMock);
  });

  it('should ignore GET requests', async () => {
    const context = createMockContext('GET', '/requests');
    const next: CallHandler = {
      handle: () => of({ data: 'ok' }),
    };

    await interceptor.intercept(context, next).toPromise();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('should log POST requests for mutations', (done) => {
    const context = createMockContext('POST', '/requests', {
      id: 'req-1',
      category: 'Furniture',
    });
    const next: CallHandler = {
      handle: () => of({ id: 'req-1', status: 'created' }),
    };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        // Since the logging happens in a side-effect (tap + async IIFE), we wait a bit
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: expect.objectContaining({
              action: 'POST /requests',
              targetTable: 'requests',
              targetId: 'req-1',
            }),
          });
          done();
        }, 100);
      },
    });
  });

  it('should exclude auth paths', async () => {
    const context = createMockContext('POST', '/auth/login');
    const next: CallHandler = {
      handle: () => of({ token: 'abc' }),
    };

    await interceptor.intercept(context, next).toPromise();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  function createMockContext(
    method: string,
    url: string,
    body: any = {},
    user: any = { id: 'user-1' },
  ): ExecutionContext {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          url,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          body,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          user,
        }),
      }),
      getType: () => 'http',
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as any;
  }
});
