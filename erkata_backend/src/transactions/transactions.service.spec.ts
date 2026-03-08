import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma: any = {
      match: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      request: {
        update: jest.fn(),
      },
      profile: {
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      $transaction: jest.fn((cb: any) => cb(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    prisma = mockPrisma;
  });

  describe('markComplete', () => {
    it('should update statuses and credit referrer wallet', async () => {
      const mockMatch = {
        id: 'm1',
        requestId: 'r1',
        agentId: 'a1',
        status: 'accepted',
      };
      const mockResult = {
        id: 'm1',
        agent: {
          id: 'a1',
          fullName: 'Agent Smith',
          referredBy: { id: 'referrer-1' },
          referredById: 'referrer-1',
        },
        request: {
          id: 'r1',
          budgetMax: 1000,
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      prisma.match.findUnique.mockResolvedValue(mockMatch);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      prisma.match.update.mockResolvedValue(mockResult);

      await service.markComplete('m1', 'a1');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(prisma.match.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'm1' },
          data: { status: 'completed' },
        }),
      );

      // Verify wallet update (5% of 1000 = 50)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(prisma.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'referrer-1' },
          data: {
            walletBalance: { increment: 50 },
          },
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            action: 'REFERRAL_COMMISSION_CREDITED',
            targetId: 'referrer-1',
          }),
        }),
      );
    });
  });
});
