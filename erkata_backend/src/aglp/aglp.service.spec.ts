import { Test, TestingModule } from '@nestjs/testing';
import { AglpService } from './aglp.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../common/config.service';
import { AglpTransactionType, AglpTransactionStatus } from '@prisma/client';

describe('AglpService', () => {
  let service: AglpService;
  let prisma: PrismaService;
  let config: ConfigService;

  const mockPrisma = {
    aglpTransaction: {
      aggregate: jest.fn(),
      create: jest.fn(),
    },
    profile: {
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockConfig = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AglpService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AglpService>(AglpService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  describe('earnCommission Anomaly Detection', () => {
    it('should log SUSPICIOUS_COMMISSION when threshold is breached', async () => {
      // Setup
      const tx = mockPrisma as any;
      const profileId = 'agent-1';
      const amountEtb = 5000;
      const threshold = 8000;
      
      mockConfig.get.mockReturnValue({ value: threshold });
      mockConfig.get.mockReturnValueOnce({ rate: 1.0 }); // conversion rate
      mockConfig.get.mockReturnValueOnce({ value: threshold }); // threshold

      tx.aglpTransaction.aggregate.mockResolvedValue({
        _sum: { etbEquivalent: 4000 },
      });

      // Execute
      await service.earnCommission(tx, profileId, amountEtb, 'ref-1', 'Test reason');

      // Verify
      expect(tx.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'SUSPICIOUS_COMMISSION',
          }),
        }),
      );
    });

    it('should NOT log SUSPICIOUS_COMMISSION when under threshold', async () => {
      // Setup
      const tx = mockPrisma as any;
      const profileId = 'agent-2';
      const amountEtb = 1000;
      const threshold = 10000;

      mockConfig.get.mockReturnValue({ value: threshold });
      mockConfig.get.mockReturnValueOnce({ rate: 1.0 });
      mockConfig.get.mockReturnValueOnce({ value: threshold });

      tx.aglpTransaction.aggregate.mockResolvedValue({
        _sum: { etbEquivalent: 2000 },
      });

      // Execute
      await service.earnCommission(tx, profileId, amountEtb, 'ref-2', 'Safe reason');

      // Verify
      const calls = tx.auditLog.create.mock.calls;
      const suspiciousCalls = calls.filter((c: any) => c[0].data.action === 'SUSPICIOUS_COMMISSION');
      expect(suspiciousCalls.length).toBe(0);
    });
  });
});
