import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard, RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @RequirePermission(Action.VIEW_FULL_AUDIT_LOGS)
  async getAuditLogs(
    @Query() query: PaginationDto,
    @Query('action') action?: string,
  ) {
    const logs = await this.prisma.auditLog.findMany({
      where: action ? { action } : {},
      take: query.limit,
      skip: query.offset,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            fullName: true,
            role: true,
          },
        },
      },
    });

    return logs.map((log) => ({
      ...log,
      entityType: log.targetTable,
      entityId: log.targetId,
    }));
  }
}
