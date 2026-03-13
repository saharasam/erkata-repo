import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ConfigService } from '../common/config.service';
import { JwtAuthGuard, RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';
import { Prisma } from '@prisma/client';

@Controller('admin/config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  @RequirePermission(Action.MODIFY_GOVERNANCE)
  getAllConfigs() {
    return [
      {
        key: 'high_risk_threshold_etb',
        value: this.configService.get<number>('high_risk_threshold_etb', 100000),
        description: 'Threshold for automatic escalation to Super Admin.',
      },
      {
        key: 'auto_bundle',
        value: this.configService.get<boolean>('auto_bundle', true),
        description: 'Automatically bundle feedback after both parties submit.',
      },
      {
        key: 'referral_commissions',
        value: this.configService.get<boolean>('referral_commissions', true),
        description: 'Enable/disable referral payout logic.',
      },
      {
        key: 'emergency_lockdown',
        value: this.configService.get<boolean>('emergency_lockdown', false),
        description: 'Suspend all platform transactions.',
      },
    ];
  }

  @Patch()
  async updateConfig(
    @Body()
    body: {
      key: string;
      value: Prisma.InputJsonValue;
      description?: string;
    },
  ) {
    await this.configService.set(body.key, body.value, body.description);
    return { success: true, key: body.key, value: body.value };
  }
}
