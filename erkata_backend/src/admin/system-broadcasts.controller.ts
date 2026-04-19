import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthenticatedRequest {
  user: {
    id: string;
    role: string;
  };
}

@Controller('admin/broadcasts')
@UseGuards(JwtAuthGuard, RolesGuard)
export default class SystemBroadcastsController {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService,
  ) {}

  @Get()
  @RequirePermission(Action.VIEW_BROADCASTS)
  async getBroadcasts(@Request() req: AuthenticatedRequest) {
    const user = req.user;

    // Super admins see all broadcasts
    if (user.role === 'super_admin') {
      return await this.prisma.systemBroadcast.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    // Map user roles to target groups
    const allowedTargets = ['EVERYONE'];
    if (user.role === 'admin') allowedTargets.push('ADMIN');
    if (user.role === 'operator') allowedTargets.push('OPERATOR');
    if (user.role === 'agent') allowedTargets.push('AGENT');

    return await this.prisma.systemBroadcast.findMany({
      where: {
        target: { in: allowedTargets },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  @RequirePermission(Action.MODIFY_GOVERNANCE)
  async createBroadcast(
    @Body() data: { title: string; content?: string; target: string },
  ) {
    // 1. Create broadcast record
    const broadcast = await this.prisma.systemBroadcast.create({
      data: {
        title: data.title,
        content: data.content,
        target: data.target,
      },
    });

    // 2. Identify target users
    const userWhere: Prisma.ProfileWhereInput = {};
    if (data.target === 'AGENT') userWhere.role = 'agent';
    else if (data.target === 'OPERATOR') userWhere.role = 'operator';
    else if (data.target === 'ADMIN') userWhere.role = 'admin';
    // If EVERYONE, leave userWhere empty to target all users

    const users = await this.prisma.profile.findMany({
      where: userWhere,
      select: { id: true, role: true },
    });

    // 3. Create individual notification records
    // We use a transactional batch for reliability
    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: `System Broadcast: ${data.title}`,
        message: data.content || 'New system announcement published.',
        type: 'SYSTEM_BROADCAST',
        link: '/dashboard/notices', // Generic link to the notices tab
      })),
      skipDuplicates: true,
    });

    // 4. Emit WebSocket events
    if (data.target === 'EVERYONE') {
      this.notificationsGateway.server.emit('notification', {
        type: 'system_broadcast',
        title: data.title,
        message: data.content,
      });
    } else {
      const targetRole = data.target.toLowerCase();
      this.notificationsGateway.sendToRole(targetRole, 'notification', {
        type: 'system_broadcast',
        title: data.title,
        message: data.content,
      });
    }

    return {
      message: 'Broadcast dispatched successfully',
      broadcast,
    };
  }

  @Delete(':id')
  @RequirePermission(Action.MODIFY_GOVERNANCE)
  async deleteBroadcast(@Param('id') id: string) {
    await this.prisma.systemBroadcast.delete({
      where: { id },
    });

    return { message: 'Broadcast deleted successfully' };
  }
}
