import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';

interface BroadcastJobData {
  broadcastId: string;
  title: string;
  content?: string;
  target: string;
}

@Processor('broadcast')
export class BroadcastProcessor extends WorkerHost {
  private readonly logger = new Logger(BroadcastProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<BroadcastJobData, any, string>): Promise<any> {
    if (job.name === 'send-broadcast') {
      const { title, content, target } = job.data;
      this.logger.log(
        `[BroadcastProcessor] Starting broadcast: ${title} (Target: ${target})`,
      );

      // 1. Identify target criteria
      const userWhere: Prisma.ProfileWhereInput = {};
      if (target === 'AGENT') userWhere.role = 'agent';
      else if (target === 'OPERATOR') userWhere.role = 'operator';
      else if (target === 'ADMIN') userWhere.role = 'admin';
      else if (target === 'FINANCE_OP') userWhere.role = 'financial_operator';

      // 2. Process in chunks to avoid OOM and DB limits
      let cursor: string | undefined;
      const chunkSize = 1000;
      let totalProcessed = 0;

      while (true) {
        const users = await this.prisma.profile.findMany({
          where: userWhere,
          take: chunkSize,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined,
          select: { id: true },
          orderBy: { id: 'asc' },
        });

        if (users.length === 0) break;

        this.logger.log(
          `[BroadcastProcessor] Processing chunk of ${users.length} users...`,
        );

        // Create individual notification records in batches
        await this.prisma.notification.createMany({
          data: users.map((u) => ({
            userId: u.id,
            title: `System Broadcast: ${title}`,
            message: content || 'New system announcement published.',
            type: 'SYSTEM_BROADCAST',
            link: '/dashboard/notices',
          })),
          skipDuplicates: true,
        });

        totalProcessed += users.length;
        cursor = users[users.length - 1].id;

        // Yield to event loop to prevent starvation
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // 3. Emit WebSocket events (one-time broadcast)
      this.logger.log(
        `[BroadcastProcessor] Emitting WebSocket broadcast to target...`,
      );
      if (target === 'EVERYONE') {
        this.notificationsGateway.server.emit('notification', {
          type: 'system_broadcast',
          title,
          message: content,
        });
      } else {
        let targetRole = target.toLowerCase();
        if (target === 'FINANCE_OP') targetRole = 'financial_operator';

        this.notificationsGateway.sendToRole(targetRole, 'notification', {
          type: 'system_broadcast',
          title,
          message: content,
        });
      }

      this.logger.log(
        `[BroadcastProcessor] Completed broadcast. Total users notified: ${totalProcessed}`,
      );
      return { totalProcessed };
    }
  }
}
