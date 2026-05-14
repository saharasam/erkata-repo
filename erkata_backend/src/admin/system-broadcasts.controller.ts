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
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';

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
    @InjectQueue('broadcast') private broadcastQueue: Queue,
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
    if (user.role === 'financial_operator') allowedTargets.push('FINANCE_OP');

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

    // 2. Offload notification work to background queue
    await this.broadcastQueue.add('send-broadcast', {
      broadcastId: broadcast.id,
      title: data.title,
      content: data.content,
      target: data.target,
    });

    return {
      message: 'Broadcast scheduled for distribution',
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
