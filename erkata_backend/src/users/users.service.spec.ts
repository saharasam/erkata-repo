import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Tier } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    agentZone: {
      create: jest.fn(),
    },
    referralLink: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('assignZone', () => {
    it('should throw error if zone limit reached for FREE tier', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'agent-1',
        role: UserRole.agent,
        referralLink: { tier: Tier.FREE },
        agentZones: [{ id: 'z1' }], // Limit is 1
      });

      await expect(
        service.assignZone(UserRole.admin, 'agent-1', 'Bole', '03'),
      ).rejects.toThrow('Agent tier "FREE" is limited to 1 zones');
    });

    it('should allow extra zone for UNITY tier', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'agent-1',
        role: UserRole.agent,
        referralLink: { tier: Tier.UNITY }, // Limit is 5
        agentZones: [{ id: 'z1' }, { id: 'z2' }],
      });
      mockPrisma.agentZone.create.mockResolvedValue({ id: 'z3' });

      const result = await service.assignZone(
        UserRole.admin,
        'agent-1',
        'Bole',
        '03',
      );
      expect(result).toBeDefined();
    });
  });

  describe('checkReferralEligibility', () => {
    it('should throw error if referral limit reached', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'ref-1',
        referralLink: { tier: Tier.FREE }, // Limit is 3
        referrals: [{}, {}, {}],
      });

      await expect(service.checkReferralEligibility('ref-1')).rejects.toThrow(
        'Referrer tier "FREE" is limited to 3 referral slots',
      );
    });
  });

  describe('findAll', () => {
    it('should throw ForbiddenException for non-admins', async () => {
      await expect(service.findAll(UserRole.agent, {})).rejects.toThrow(
        'Only admins can list all users',
      );
    });

    it('should return all users for admin', async () => {
      mockPrisma.profile.findMany.mockResolvedValue([{ id: 'u1' }]);
      const result = await service.findAll(UserRole.admin, {
        role: UserRole.agent,
      });
      expect(result).toHaveLength(1);
      expect(mockPrisma.profile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: UserRole.agent, isActive: undefined },
        }),
      );
    });
  });

  describe('Account Status Management', () => {
    it('should suspend a user if caller has permission', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'u1',
        role: UserRole.agent,
      });
      mockPrisma.profile.update.mockResolvedValue({
        id: 'u1',
        isActive: false,
      });

      const result = await service.suspendUser(UserRole.admin, 'u1');
      expect(result.isActive).toBe(false);
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isActive: false },
      });
    });

    it('should activate a user if caller has permission', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'u1',
        role: UserRole.operator,
      });
      mockPrisma.profile.update.mockResolvedValue({ id: 'u1', isActive: true });

      const result = await service.activateUser(UserRole.super_admin, 'u1');
      expect(result.isActive).toBe(true);
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isActive: true },
      });
    });

    it('should throw ForbiddenException if calling role is lower than target role', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        id: 'admin-1',
        role: UserRole.admin,
      });

      await expect(
        service.suspendUser(UserRole.admin, 'admin-1'),
      ).rejects.toThrow('Role "admin" cannot suspend role "admin"');
    });
  });
});
