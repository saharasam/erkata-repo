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
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard, RequirePermission, JwtAuthGuard } from '../auth/guards';
import type { AuthenticatedRequest } from '../auth/guards';
import { Action, PermissionMatrix } from '../auth/permissions';
import { UserRole } from '@prisma/client';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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
    return this.usersService.findAll(req.user.id, req.user.role, {
      role,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getCurrentProfile(
      req.user.id,
      req.user.id,
      req.user.role,
    );
  }

  @Get('me/finance')
  async getFinance(@Req() req: AuthenticatedRequest) {
    return this.usersService.getFinanceSummary(req.user.id);
  }

  @Get('me/available-packages')
  async getAvailablePackages() {
    return this.usersService.getAvailablePackages();
  }

  @Post('me/withdraw')
  async requestWithdrawal(
    @Req() req: AuthenticatedRequest,
    @Body() body: WithdrawalDto,
  ) {
    return this.usersService.requestWithdrawal(req.user.id, body.amount, {
      bankName: body.bankName,
      bankAccountNumber: body.bankAccountNumber,
      bankAccountHolder: body.bankAccountHolder,
    });
  }

  @Post('me/referral-code')
  @HttpCode(HttpStatus.OK)
  async generateReferralCode(@Req() req: AuthenticatedRequest) {
    return this.usersService.generateReferralCode(req.user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  @Patch('me/avatar')
  @HttpCode(HttpStatus.OK)
  async updateAvatar(
    @Req() req: AuthenticatedRequest,
    @Body() body: { avatarUrl: string | null },
  ) {
    return this.usersService.updateAvatar(req.user.id, body.avatarUrl ?? null);
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

  @Patch('me/business')
  async updateBusinessProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateBusinessProfileDto,
  ) {
    return this.usersService.updateBusinessProfile(req.user.id, body);
  }

  @Get(':id/profile')
  async getUserProfile(
    @Req() req: AuthenticatedRequest,
    @Param('id') userId: string,
  ) {
    const callerRole = req.user.role;
    const callerId = req.user.id;
    const permissions = PermissionMatrix[callerRole] || [];

    // Authorization logic
    const hasBroadAccess = permissions.includes(
      Action.VIEW_USER_DETAILS_ANY_ROLE,
    );
    const isReferrer = await this.usersService.isReferrerOf(callerId, userId);
    const hasReferralAccess =
      permissions.includes(Action.VIEW_REFERRAL_DETAILS) && isReferrer;

    if (!hasBroadAccess && !hasReferralAccess && callerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this profile.',
      );
    }

    // Hierarchy Check: Admins may not view profiles at their own level or above
    if (callerRole === UserRole.admin) {
      const target = await this.usersService.getProfileRoleById(userId);
      if (
        target &&
        (target.role === UserRole.admin ||
          target.role === UserRole.super_admin) &&
        userId !== callerId
      ) {
        throw new ForbiddenException(
          'Admins are not authorized to view profiles at admin level or above.',
        );
      }
    }

    return this.usersService.getCurrentProfile(userId, callerId, callerRole);
  }

  @Get(':id/finance')
  @RequirePermission(Action.VIEW_USER_DETAILS_ANY_ROLE)
  async getUserFinance(@Param('id') userId: string) {
    return this.usersService.getFinanceSummary(userId);
  }
}
