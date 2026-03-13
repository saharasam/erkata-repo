import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';

@Controller('admin/broadcasts')
@UseGuards(RolesGuard)
export default class SystemBroadcastsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @RequirePermission(Action.VIEW_SYSTEM_STATISTICS)
  getBroadcasts() {
    return [
      {
        id: '1',
        title: 'Server Maintenance',
        content: 'Scheduled maintenance on Sunday.',
        target: 'EVERYONE',
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'New Referral Bonus',
        content: 'Earn 10% more this week.',
        target: 'AGENT',
        createdAt: new Date(),
      },
    ];
  }

  @Post()
  @RequirePermission(Action.MODIFY_GOVERNANCE)
  createBroadcast(
    @Body() data: { title: string; content?: string; target: string },
  ) {
    return {
      message: 'Broadcast dispatched successfully',
      broadcast: {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      },
    };
  }
}
