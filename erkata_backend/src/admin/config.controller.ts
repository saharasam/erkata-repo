import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
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
        value: this.configService.get<number>(
          'high_risk_threshold_etb',
          ConfigService.DEFAULT_RISK_THRESHOLD,
        ),
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
        description: 'Suspend all platform transactions.',
      },
      {
        key: 'AGLP_TO_ETB_RATE',
        value: this.configService.get('AGLP_TO_ETB_RATE', { rate: 1.0 }),
        description: 'Primary exchange rate from ETB to AGLP.',
      },
      {
        key: 'AGLP_COMMISSION_PACKAGE_REFERRAL',
        value: this.configService.get('AGLP_COMMISSION_PACKAGE_REFERRAL', {
          value: 0.1,
        }),
        description: 'Super Admin: Referral commission for package upgrades.',
      },
      {
        key: 'COMMISSION_REAL_ESTATE_PRIMARY',
        value: this.configService.get('COMMISSION_REAL_ESTATE_PRIMARY', {
          value: 0.1,
        }),
        description: 'Super Admin: Primary agent commission for real estate.',
      },
      {
        key: 'COMMISSION_REAL_ESTATE_OVERRIDE',
        value: this.configService.get('COMMISSION_REAL_ESTATE_OVERRIDE', {
          value: 0.05,
        }),
        description: 'Super Admin: Referral override for real estate.',
      },
      {
        key: 'COMMISSION_FURNITURE_PRIMARY',
        value: this.configService.get('COMMISSION_FURNITURE_PRIMARY', {
          value: 0.1,
        }),
        description: 'Super Admin: Primary agent commission for furniture.',
      },
      {
        key: 'alert_bad_performance_limit',
        value: this.configService.get<number>('alert_bad_performance_limit', 3),
        description: 'Alert: Rejects + Unfulfilled assignments before flagging.',
      },
      {
        key: 'alert_dispute_pattern_limit',
        value: this.configService.get<number>('alert_dispute_pattern_limit', 2),
        description: 'Alert: Weekly dispute count for pattern flagging.',
      },
      {
        key: 'alert_spike_factor',
        value: this.configService.get<number>('alert_spike_factor', 1.5),
        description: 'Alert: Volume multiplier for request spikes.',
      },
      {
        key: 'alert_spike_min_threshold',
        value: this.configService.get<number>('alert_spike_min_threshold', 5),
        description: 'Alert: Noise floor for spike detection.',
      },
    ];
  }

  @Patch()
  async updateConfig(
    @Req() req: Request & { user: { id: string; role: string } },
    @Body()
    body: {
      key: string;
      value: Prisma.InputJsonValue;
      description?: string;
    },
  ) {
    // Restricted keys for Super Admin only
    const superAdminKeys = [
      'AGLP_TO_ETB_RATE',
      'AGLP_COMMISSION_PACKAGE_REFERRAL',
      'COMMISSION_REAL_ESTATE_PRIMARY',
      'COMMISSION_REAL_ESTATE_OVERRIDE',
      'COMMISSION_FURNITURE_PRIMARY',
      'high_risk_threshold_etb',
      'alert_bad_performance_limit',
      'alert_dispute_pattern_limit',
      'alert_spike_factor',
      'alert_spike_min_threshold',
    ];

    if (superAdminKeys.includes(body.key) && req.user.role !== 'super_admin') {
      throw new ForbiddenException(
        'Only Super Admin can modify platform economic policy',
      );
    }

    await this.configService.set(
      body.key,
      body.value,
      body.description,
      req.user.id,
    );
    return { success: true, key: body.key, value: body.value };
  }
}
