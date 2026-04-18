import { Test, TestingModule } from '@nestjs/testing';
import AnalyticsController from './analytics.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let prisma: PrismaService;

  const mockPrisma = {
    profile: {
      count: jest.fn().mockResolvedValue(10),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    request: {
      count: jest.fn().mockResolvedValue(5),
    },
    feedbackBundle: {
      count: jest.fn().mockResolvedValue(2),
    },
    aglpTransaction: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { etbEquivalent: 1000 } }),
    },
    $queryRaw: jest.fn().mockImplementation(async (query: any) => {
      if (query[0].includes('AVG(EXTRACT')) {
        return [{ avg: 500 }];
      }
      if (query[0].includes('SELECT p.full_name')) {
        return [{ name: 'Top Agent', total: 5000 }];
      }
      return [];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getSummary', () => {
    it('should return aggregated metrics including volume and leaderboard', async () => {
      const result = await controller.getSummary('all');

      expect(result).toHaveProperty('platformVolume', '1000 ETB');
      expect(result).toHaveProperty('leaderboard');
      expect(result.leaderboard).toHaveLength(1);
      expect(result.leaderboard[0].name).toBe('Top Agent');
    });
  });
});
