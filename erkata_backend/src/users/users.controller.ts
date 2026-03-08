import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard, RequirePermission, JwtAuthGuard } from '../auth/guards';
import type { AuthenticatedRequest } from '../auth/guards';
import { Action } from '../auth/permissions';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission(Action.MANAGE_AGENTS) // Broad permission for admins/operators to see lists
  async getUsers(
    @Req() req: AuthenticatedRequest,
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll(req.user.role, {
      role,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getCurrentProfile(req.user.id);
  }

  @Get('me/finance')
  async getFinance(@Req() req: AuthenticatedRequest) {
    return this.usersService.getFinanceSummary(req.user.id);
  }

  @Post('agent/:id/zones')
  @RequirePermission(Action.ASSIGN_ZONES)
  async assignZone(
    @Req() req: AuthenticatedRequest,
    @Param('id') agentId: string,
    @Body() body: { zoneId: string; woreda: string },
  ) {
    const callerRole = req.user.role;
    return this.usersService.assignZone(
      callerRole,
      agentId,
      body.zoneId,
      body.woreda,
    );
  }

  @Patch('agent/:id/tier')
  @RequirePermission(Action.UPDATE_TIER)
  async updateTier(
    @Req() req: AuthenticatedRequest,
    @Param('id') agentId: string,
    @Body() body: { tier: string },
  ) {
    const callerRole = req.user.role;
    return this.usersService.updateTier(callerRole, agentId, body.tier);
  }

  @Patch(':id/suspend')
  @RequirePermission(Action.MANAGE_AGENTS) // Admin can manage agents
  async suspendUser(
    @Req() req: AuthenticatedRequest,
    @Param('id') userId: string,
  ) {
    const callerRole = req.user.role;
    return this.usersService.suspendUser(callerRole, userId);
  }

  @Patch(':id/activate')
  @RequirePermission(Action.MANAGE_AGENTS)
  async activateUser(
    @Req() req: AuthenticatedRequest,
    @Param('id') userId: string,
  ) {
    const callerRole = req.user.role;
    return this.usersService.activateUser(callerRole, userId);
  }
}
