import {
  Controller,
  Patch,
  Get,
  Param,
  Req,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '@prisma/client';

interface RequestWithUser {
  user: {
    id: string;
    role: string;
  };
}

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Agent fetches their assigned jobs
  @Get('my-jobs')
  @Roles(UserRole.agent)
  getMyJobs(@Req() req: RequestWithUser) {
    return this.transactionsService.getAgentJobs(req.user.id);
  }

  // Agent accepts the assignment
  @Patch(':id/accept')
  @Roles(UserRole.agent)
  accept(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.transactionsService.acceptAssignment(id, req.user.id);
  }

  // Agent declines the assignment (request returns to Operator queue)
  @Patch(':id/decline')
  @Roles(UserRole.agent)
  decline(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.transactionsService.declineAssignment(id, req.user.id);
  }

  // Agent marks the job as complete and uploads proof
  @Patch(':id/complete')
  @Roles(UserRole.agent)
  complete(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.transactionsService.markComplete(id, req.user.id);
  }

  // Operator fetches all active matches/transactions
  @Get()
  @Roles(UserRole.operator, UserRole.admin, UserRole.super_admin)
  getAll(@Query('status') status?: string) {
    return this.transactionsService.getOperatorTransactions({ status });
  }
}
