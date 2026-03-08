import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MediationService } from './mediation.service';
import { RolesGuard, RequirePermission, JwtAuthGuard } from '../auth/guards';
import { Action } from '../auth/permissions';
import { FeedbackBundleState } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/guards';

@Controller('mediation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediationController {
  constructor(private readonly mediationService: MediationService) {}

  @Post('transaction/:id/feedback')
  @RequirePermission(Action.SUBMIT_CUSTOMER_FEEDBACK)
  async submitFeedback(
    @Param('id') transactionId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { content: string; rating: number },
  ) {
    const userId = req.user.id;
    return this.mediationService.submitFeedback(
      transactionId,
      userId,
      body.content,
      body.rating,
    );
  }

  @Patch('bundle/:id/propose')
  @RequirePermission(Action.PROPOSE_RESOLUTION)
  async proposeResolution(
    @Param('id') bundleId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { proposedText: string },
  ) {
    const userId = req.user.id;
    return this.mediationService.proposeResolution(
      bundleId,
      userId,
      body.proposedText,
    );
  }

  @Post('proposal/:id/finalize')
  @RequirePermission(Action.FINALIZE_RESOLUTION)
  async finalizeResolution(
    @Param('id') proposalId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { approved: boolean; comment?: string },
  ) {
    const userId = req.user.id;
    return this.mediationService.finalizeResolution(
      proposalId,
      userId,
      body.approved,
      body.comment,
    );
  }

  @Post('bundle/:id/finalize')
  @RequirePermission(Action.FINALIZE_RESOLUTION)
  async finalizeBundle(
    @Param('id') bundleId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { resolutionText: string },
  ) {
    const userId = req.user.id;
    return this.mediationService.finalizeBundleDirectly(
      bundleId,
      userId,
      body.resolutionText,
    );
  }

  @Get('bundles')
  @RequirePermission(Action.PROPOSE_RESOLUTION)
  async getBundles(@Query('state') state?: FeedbackBundleState) {
    return this.mediationService.getBundles(state);
  }
}
