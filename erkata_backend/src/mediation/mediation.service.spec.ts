import { Test, TestingModule } from '@nestjs/testing';
import { MediationService } from './mediation.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../common/config.service';
import { getQueueToken } from '@nestjs/bullmq';
import { FeedbackBundleState, UserRole } from '@prisma/client';

describe('MediationService (Phase 4)', () => {
  let service: MediationService;

  const mockPrisma = {
    feedbackBundle: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    resolutionProposal: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    transaction: {
      findUnique: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: getQueueToken('mediation'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<MediationService>(MediationService);
  });

  describe('getBundles', () => {
    it('should fetch bundles filtered by state', async () => {
      mockPrisma.feedbackBundle.findMany.mockResolvedValue([]);
      await service.getBundles(FeedbackBundleState.BUNDLED);
      expect(mockPrisma.feedbackBundle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { state: FeedbackBundleState.BUNDLED },
        }),
      );
    });
  });

  describe('finalizeBundleDirectly', () => {
    it('should create a proposal and call finalizeResolution', async () => {
      const bundleId = 'bundle-1';
      const actorId = 'admin-1';
      const resolutionText = 'Final resolution text';

      mockPrisma.resolutionProposal.create.mockResolvedValue({
        id: 'prop-1',
        bundleId,
      });

      // Mock finalizeResolution dependencies
      mockPrisma.resolutionProposal.findUnique.mockResolvedValue({
        id: 'prop-1',
        bundleId,
        bundle: { state: FeedbackBundleState.BUNDLED },
      });
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: actorId,
        role: UserRole.admin,
      });

      const spy = jest
        .spyOn(service as any, 'finalizeResolution')
        .mockResolvedValue({ id: 'res-1' });

      await service.finalizeBundleDirectly(bundleId, actorId, resolutionText);

      expect(mockPrisma.resolutionProposal.create).toHaveBeenCalledWith({
        data: {
          bundleId,
          proposedById: actorId,
          proposedText: resolutionText,
        },
      });
      expect(spy).toHaveBeenCalledWith(
        'prop-1',
        actorId,
        true,
        'Direct Admin Resolution',
      );
    });
  });
});
