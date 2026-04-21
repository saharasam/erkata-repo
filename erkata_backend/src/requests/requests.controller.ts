import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestsService, type CreateRequestDto } from './requests.service';
import { Action } from '../auth/permissions';
import { JwtAuthGuard, RolesGuard, RequirePermission } from '../auth/guards';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // Customer submits a new request
  @Post()
  @RequirePermission(Action.CREATE_REQUEST)
  createRequest(@Req() req: RequestWithUser, @Body() dto: CreateRequestDto) {
    const user = req.user;
    return this.requestsService.createRequest(user.id, dto);
  }

  @Get('queue')
  @RequirePermission(Action.VIEW_QUEUE)
  getQueue(@Query('zoneId') zoneId: string) {
    return this.requestsService.getOperatorQueue({ zoneId });
  }

  // Customer views their own request history
  @Get('my-requests')
  @RequirePermission(Action.VIEW_OWN_REQUESTS)
  getMyRequests(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.requestsService.getCustomerRequests(user.id);
  }

  // Operator fetches all active agents (sorted by tier, then zone)
  @Get('eligible-agents')
  @RequirePermission(Action.VIEW_AGENTS_LIST)
  findEligibleAgents() {
    return this.requestsService.findEligibleAgents();
  }

  // Fetch all historical disputes (Resolved/Escalated) for Admin Audit
  @Get('admin/dispute-history')
  @RequirePermission(Action.VIEW_SYSTEM_STATISTICS) // This action fits global administration permissions
  getDisputeHistory() {
    return this.requestsService.getDisputeHistory();
  }

  // Operator fetching their pushed request details
  @Get(':id')
  @RequirePermission(Action.VIEW_ASSIGNED_REQUEST_DETAILS)
  getRequest(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.requestsService.getRequest(id, user.id, user.role);
  }

  // Operator assigns an agent to a request
  @Post(':id/assign')
  @RequirePermission(Action.ASSIGN_AGENT)
  assignAgent(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.requestsService.assignAgent(id, agentId, req.user.id);
  }

  // Any authenticated user can check status (call logic is role-scoped)
  @Get(':id/status')
  getStatus(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.requestsService.getRequest(id, user.id, user.role);
  }

  // Customer confirms or disputes fulfillment
  @Post(':id/confirm-fulfillment')
  @RequirePermission(Action.CONFIRM_FULFILLMENT)
  confirmFulfillment(
    @Param('id') id: string,
    @Body('confirmed') confirmed: boolean,
    @Req() req: RequestWithUser,
  ) {
    return this.requestsService.confirmFulfillment(id, req.user.id, confirmed);
  }

  // Operator resolves a dispute
  @Patch(':id/resolve-dispute')
  @RequirePermission(Action.RESOLVE_DISPUTE)
  resolveDispute(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body('note') note?: string,
  ) {
    return this.requestsService.resolveDispute(id, req.user.id, note);
  }

  // Operator escalates a dispute
  @Patch(':id/escalate-dispute')
  @RequirePermission(Action.ESCALATE_DISPUTE)
  escalateDispute(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body('note') note?: string,
  ) {
    return this.requestsService.escalateDispute(id, req.user.id, note);
  }

  // Operator voids a dispute (returns for redo)
  @Patch(':id/void-dispute')
  @RequirePermission(Action.RESOLVE_DISPUTE)
  voidDispute(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body('note') note?: string,
  ) {
    return this.requestsService.voidDispute(id, req.user.id, note);
  }

  // Operator forces a request to complete (bypass customer)
  @Post(':id/force-complete')
  @RequirePermission(Action.RESOLVE_DISPUTE) // Same permission level as resolving disputes
  forceComplete(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body('note') note?: string,
  ) {
    return this.requestsService.forceComplete(id, req.user.id, note);
  }
}
