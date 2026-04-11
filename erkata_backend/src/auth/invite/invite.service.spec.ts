import { Test, TestingModule } from '@nestjs/testing';
import { InviteService } from './invite.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { UserRole } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('InviteService (Hierarchy)', () => {
  let service: InviteService;
  let usersService: UsersService;

  const mockPrisma = {
    invite: {
      create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'new-id', ...args.data })),
    },
  };

  const mockUsersService = {
    canModifyUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should allow Super Admin to invite an Admin', async () => {
    mockUsersService.canModifyUser.mockReturnValue(true);

    const result = await service.createInvite(
      'test@test.com',
      'Test User',
      '0911',
      UserRole.admin,
      'admin-id',
      UserRole.super_admin,
    );

    expect(result).toBeDefined();
    expect(mockPrisma.invite.create).toHaveBeenCalled();
  });

  it('should prevent Admin from inviting another Admin', async () => {
    mockUsersService.canModifyUser.mockReturnValue(false);

    await expect(
      service.createInvite(
        'test@test.com',
        'Test User',
        '0911',
        UserRole.admin,
        'admin-id',
        UserRole.admin,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(mockPrisma.invite.create).not.toHaveBeenCalled();
  });
});
