import { Controller, Get, Param } from '@nestjs/common';
import { InviteService } from './invite.service';

@Controller('auth/invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Get(':token')
  async getInvite(@Param('token') token: string) {
    const invite = await this.inviteService.getInviteByToken(token);
    return {
      email: invite.email,
      fullName: invite.fullName,
      phone: invite.phone,
      role: invite.role,
    };
  }
}
