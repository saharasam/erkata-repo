import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard, RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/guards';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @RequirePermission(Action.MANAGE_ADMINS)
  async getPersonnel(@Query('role') role?: UserRole) {
    return this.prisma.profile.findMany({
      where: role
        ? { role }
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
  @RequirePermission(Action.MANAGE_ADMINS)
  async createInvite(
    @Req() req: AuthenticatedRequest,
    @Body() body: { email: string; role: UserRole; fullName: string },
  ) {
    // Basic invite generation - in real app, creates a token and sends email
    // For MVP, we use the Invite model
    const invite = await this.prisma.invite.create({
      data: {
        email: body.email,
        role: body.role,
        token: Math.random().toString(36).substring(7),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdById: req.user.id,
      },
    });

    return {
      message: 'Personnel invite generated',
      inviteUrl: `https://erkata.com/register/claim?token=${invite.token}`,
      invite,
    };
  }

  @Patch(':id/status')
  @RequirePermission(Action.MANAGE_ADMINS)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.prisma.profile.update({
      where: { id },
      data: { isActive: body.isActive },
    });
  }
}
