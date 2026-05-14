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
import { FeedbackDto } from './dto/feedback.dto';
import {
  ResolutionDto,
  FinalizeResolutionDto,
  FinalizeBundleDto,
} from './dto/resolution.dto';

@Controller('mediation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediationController {
  constructor(private readonly mediationService: MediationService) {}

  @Post('transaction/:id/feedback')
  @RequirePermission(
    Action.SUBMIT_CUSTOMER_FEEDBACK,
    Action.SUBMIT_AGENT_FEEDBACK,
  )
  async submitFeedback(
    @Param('id') transactionId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: FeedbackDto,
  ) {
    const userId = req.user.id;
    return this.mediationService.submitFeedback(
      transactionId,
      userId,
      body.content,
      body.rating,
      body.categories,
    );
  }

  @Patch('bundle/:id/propose')
  @RequirePermission(Action.PROPOSE_RESOLUTION)
  async proposeResolution(
    @Param('id') bundleId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: ResolutionDto,
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
    @Body() body: FinalizeResolutionDto,
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
    @Body() body: FinalizeBundleDto,
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
