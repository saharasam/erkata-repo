import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UpgradesService } from './upgrades.service';
import { ConfigService } from '../common/config.service';
import { JwtAuthGuard, RolesGuard, RequirePermission } from '../auth/guards';
import type { AuthenticatedRequest } from '../auth/guards';
import { Action } from '../auth/permissions';
import { Tier } from '@prisma/client';

@Controller('upgrades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpgradesController {
  constructor(
    private readonly upgradesService: UpgradesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('active')
  async getMyActiveRequest(@Req() req: AuthenticatedRequest) {
    return this.upgradesService.getActiveRequestForUser(req.user.id);
  }

  @Get('bank-details')
  async getBankDetails() {
    return await this.configService.get('BANK_DETAILS_UPGRADE');
  }

  @Get('pending')
  @RequirePermission(Action.VERIFY_UPGRADE)
  async getPendingRequests() {
    return this.upgradesService.getPendingForOperator();
  }

  @Get('verified')
  @RequirePermission(Action.APPROVE_UPGRADE)
  async getVerifiedRequests() {
    return this.upgradesService.getVerifiedForAdmin();
  }

  @Post('request')
  async createRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: { targetTier: Tier },
  ) {
    return this.upgradesService.createRequest(req.user.id, body.targetTier);
  }

  @Patch(':id/proof')
  async uploadProof(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { proofUrl: string },
  ) {
    return this.upgradesService.uploadProof(id, req.user.id, body.proofUrl);
  }

  @Patch(':id/verify')
  @RequirePermission(Action.VERIFY_UPGRADE)
  async verifyRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { internalNote: string },
  ) {
    return this.upgradesService.verifyRequest(
      id,
      req.user.id,
      body.internalNote,
    );
  }

  @Patch(':id/approve')
  @RequirePermission(Action.APPROVE_UPGRADE)
  async approveRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.upgradesService.approveRequest(id, req.user.id);
  }

  @Patch(':id/reject')
  @RequirePermission(Action.APPROVE_UPGRADE)
  async rejectRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.upgradesService.rejectRequest(id, req.user.id, body.reason);
  }
}
