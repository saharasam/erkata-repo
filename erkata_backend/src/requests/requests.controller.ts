import {
  Controller,
  Post,
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

  // Any authenticated user can check status (response is role-scoped)
  @Get(':id/status')
  getStatus(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.requestsService.getRequest(id, user.id, user.role);
  }
}
