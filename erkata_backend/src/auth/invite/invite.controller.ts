import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Req,
  ForbiddenException
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermission } from '../guards/require-permission.decorator';
import { Action } from '../permissions';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../guards/authenticated-request.interface';

@Controller('admin/invites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post('generate')
  @RequirePermission(Action.MANAGE_ADMINS)
  async generateInvite(
    @Req() req: any,
    @Body() body: { email: string; role: UserRole },
  ) {
    const authReq = req as AuthenticatedRequest;
    if (body.role === UserRole.super_admin || body.role === UserRole.admin) {
      if (authReq.user.role !== UserRole.super_admin) {
        throw new ForbiddenException('Only a Super Admin can invite and create other Administrators');
      }
    }

    const invite = await this.inviteService.createInvite(
      body.email,
      body.role,
      authReq.user.id,
    );

    return {
      message: 'Invite generated successfully',
      inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?token=${(invite as any).token}&email=${encodeURIComponent((invite as any).email)}&role=${(invite as any).role}`,
      token: (invite as any).token,
    };
  }
}
