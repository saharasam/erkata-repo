import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard, RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';
import { UsersService } from '../users/users.service';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/guards';
import { InviteService } from '../auth/invite/invite.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminsController {
  constructor(
    private prisma: PrismaService,
    private inviteService: InviteService,
    private usersService: UsersService,
  ) {}

  @Get()
  @RequirePermission(Action.MANAGE_ADMINS)
  async getPersonnel(@Query('role') role?: string) {
    // Normalize role casing to match UserRole enum
    const normalizedRole = role?.toLowerCase() as UserRole | undefined;

    return this.prisma.profile.findMany({
      where: normalizedRole
        ? { role: normalizedRole }
        : {
            OR: [{ role: UserRole.admin }, { role: UserRole.operator }],
          },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            operatorMatches: true,
            resolutionProposals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('invite')
  @RequirePermission(Action.MANAGE_ADMINS, Action.MANAGE_OPERATORS)
  async createInvite(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      email: string;
      fullName: string;
      phone: string;
      role: UserRole;
    },
  ) {
    // SECURITY: Hierarchy Enforcement
    // Admins can only invite Operators/Agents/Customers.
    // Only Super Admins can invite Admins.
    const callerRole = req.user.role;
    if (callerRole === UserRole.admin) {
      if (body.role === UserRole.admin || body.role === UserRole.super_admin) {
        throw new ForbiddenException(
          'Admins are not permitted to invite other administrative-level users.',
        );
      }
    }
    const invite = await this.inviteService.createInvite(
      body.email,
      body.fullName,
      body.phone,
      body.role,
      req.user.id,
    );

    return {
      message: 'Personnel invite generated',
      inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/register/claim?token=${invite.token}`,
      invite,
    };
  }

  @Get('invites')
  @RequirePermission(Action.MANAGE_ADMINS, Action.MANAGE_OPERATORS)
  async getInvites(@Req() req: AuthenticatedRequest) {
    const callerRole = req.user.role;
    const callerId = req.user.id;

    // Admin only sees their own invites. Super Admin sees all.
    const createdById = callerRole === UserRole.admin ? callerId : undefined;
    return this.inviteService.findPendingInvites(createdById);
  }

  @Delete(':id/invite')
  @RequirePermission(Action.MANAGE_ADMINS, Action.MANAGE_OPERATORS)
  async cancelInvite(
    @Req() req: AuthenticatedRequest,
    @Param('id') inviteId: string,
  ) {
    const callerRole = req.user.role;
    const callerId = req.user.id;

    const createdById = callerRole === UserRole.admin ? callerId : undefined;
    await this.inviteService.deleteInvite(inviteId, createdById);

    return { message: 'Invitation revoked successfully' };
  }

  @Patch(':id/status')
  @RequirePermission(Action.MANAGE_ADMINS)
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    const target = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!target) throw new NotFoundException('User profile not found');

    // HIERARCHY CHECK: Ensure caller has authority over the target
    if (!this.usersService.canModifyUser(req.user.role, target.role)) {
      throw new ForbiddenException(
        `Your role (${req.user.role}) is not authorized to modify a ${target.role}`,
      );
    }

    return this.prisma.profile.update({
      where: { id },
      data: { isActive: body.isActive },
    });
  }
}
