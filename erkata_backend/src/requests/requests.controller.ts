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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '@prisma/client';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // Customer submits a new request
  @Post()
  @Roles(UserRole.customer)
  createRequest(@Req() req: RequestWithUser, @Body() dto: CreateRequestDto) {
    const user = req.user;
    return this.requestsService.createRequest(user.id, dto);
  }

  // Operator views the incoming queue
  @Get('queue')
  @Roles(UserRole.operator)
  getQueue(@Query('zoneId') zoneId: string) {
    return this.requestsService.getOperatorQueue({ zoneId });
  }

  // Customer views their own request history
  @Get('my-requests')
  @Roles(UserRole.customer)
  getMyRequests(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.requestsService.getCustomerRequests(user.id);
  }

  // Operator fetches all active agents (sorted by tier, then zone)
  @Get('eligible-agents')
  @Roles(UserRole.operator)
  findEligibleAgents() {
    return this.requestsService.findEligibleAgents();
  }

  // Operator assigns an agent to a request
  @Post(':id/assign')
  @Roles(UserRole.operator)
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
    return this.requestsService.getRequestStatus(id, user.id, user.role);
  }
}
