import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard, RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';
import { AglpTransactionStatus, AglpTransactionType } from '@prisma/client';
import { AglpService } from '../aglp/aglp.service';

@Controller('admin/payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutsController {
  constructor(
    private prisma: PrismaService,
    private aglpService: AglpService,
  ) {}

  @Get('pending')
  @RequirePermission(Action.APPROVE_PAYOUT)
  async getPendingPayouts(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const take = limit ? Number(limit) : 50;
    const skip = offset ? Number(offset) : 0;

    return this.prisma.aglpTransaction.findMany({
      where: {
        type: AglpTransactionType.WITHDRAWAL,
        status: AglpTransactionStatus.PENDING,
      },
      take,
      skip,
      include: {
        profile: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post(':id/approve')
  @RequirePermission(Action.APPROVE_PAYOUT)
  async approvePayout(@Param('id') id: string) {
    return this.prisma.$transaction(async (tx) => {
      return this.aglpService.completeWithdrawal(tx, id);
    });
  }

  @Post(':id/reject')
  @RequirePermission(Action.APPROVE_PAYOUT)
  async rejectPayout(@Param('id') id: string, @Body('reason') reason: string) {
    if (!reason) {
      throw new BadRequestException('Reason is required for rejection');
    }

    return this.prisma.$transaction(async (tx) => {
      return this.aglpService.rejectWithdrawal(tx, id, reason);
    });
  }

  // ── SUPER ADMIN OVERSIGHT ──────────────────────────────────────────────────

  @Get('ledger')
  @RequirePermission(Action.MODIFY_GOVERNANCE) // Super Admin restricted
  async getGlobalLedger(
    @Query('type') type?: AglpTransactionType,
    @Query('status') status?: AglpTransactionStatus,
    @Query('profileId') profileId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const take = limit ? Number(limit) : 50;
    const skip = offset ? Number(offset) : 0;

    return this.prisma.aglpTransaction.findMany({
      where: {
        type,
        status,
        profileId,
      },
      take,
      skip,
      include: {
        profile: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
