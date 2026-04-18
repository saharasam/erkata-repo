import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConfigService implements OnModuleInit {
  static readonly DEFAULT_RISK_THRESHOLD = 100000;
  private readonly logger = new Logger(ConfigService.name);
  private configs: Map<string, Prisma.JsonValue> = new Map();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.refreshConfigs();
  }

  async refreshConfigs() {
    try {
      const allConfigs = await this.prisma.systemConfig.findMany();
      this.configs.clear();
      for (const config of allConfigs) {
        this.configs.set(config.key, config.value);
      }
      this.logger.log(
        `[ConfigService] Loaded ${this.configs.size} dynamic configurations.`,
      );

      // Seed default if missing
      if (!this.configs.has('high_risk_threshold_etb')) {
        await this.set(
          'high_risk_threshold_etb',
          ConfigService.DEFAULT_RISK_THRESHOLD,
          'Threshold for Super Admin escalation',
        );
      }

      // Seed AGLP Commission Defaults
      if (!this.configs.has('AGLP_COMMISSION_PACKAGE_REFERRAL')) {
        await this.set(
          'AGLP_COMMISSION_PACKAGE_REFERRAL',
          { value: 0.1 },
          'Referral commission for package upgrades.',
        );
      }

      if (!this.configs.has('COMMISSION_REAL_ESTATE_PRIMARY')) {
        await this.set(
          'COMMISSION_REAL_ESTATE_PRIMARY',
          { value: 0.1 },
          'Commission for primary agent on real estate fulfillment.',
        );
      }

      if (!this.configs.has('COMMISSION_REAL_ESTATE_OVERRIDE')) {
        await this.set(
          'COMMISSION_REAL_ESTATE_OVERRIDE',
          { value: 0.05 },
          'Referral override commission on real estate fulfillment.',
        );
      }

      if (!this.configs.has('COMMISSION_FURNITURE_PRIMARY')) {
        await this.set(
          'COMMISSION_FURNITURE_PRIMARY',
          { value: 0.1 },
          'Commission for primary agent on furniture fulfillment.',
        );
      }

      // --- ALERT ENGINE CONFIGS ---
      if (!this.configs.has('alert_bad_performance_limit')) {
        await this.set(
          'alert_bad_performance_limit',
          3,
          'Number of rejected or unfulfilled assignments before flagging an agent.',
        );
      }

      if (!this.configs.has('alert_dispute_pattern_limit')) {
        await this.set(
          'alert_dispute_pattern_limit',
          2,
          'Number of disputes in a week before flagging a pattern alert.',
        );
      }

      if (!this.configs.has('alert_spike_factor')) {
        await this.set(
          'alert_spike_factor',
          1.5,
          'Multiplier for average hourly volume to detect request spikes.',
        );
      }

      if (!this.configs.has('alert_spike_min_threshold')) {
        await this.set(
          'alert_spike_min_threshold',
          5,
          'Minimum absolute number of requests in an hour to trigger a spike alert (avoids noise).',
        );
      }

      // --- PLATFORM GOVERNANCE & WITHDRAWAL POLICIES ---
      if (!this.configs.has('emergency_lockdown')) {
        await this.set(
          'emergency_lockdown',
          false,
          'Emergency lockdown flag. When true, all non-administrative requests are rejected.',
        );
      }

      if (!this.configs.has('withdrawal_min_amount')) {
        await this.set(
          'withdrawal_min_amount',
          100,
          'Minimum AGLP amount allowed per withdrawal request.',
        );
      }

      if (!this.configs.has('withdrawal_max_amount_daily')) {
        await this.set(
          'withdrawal_max_amount_daily',
          50000,
          'Maximum cumulative AGLP amount allowed for withdrawal per agent per 24h window.',
        );
      }

      if (!this.configs.has('withdrawal_fee_percentage')) {
        await this.set(
          'withdrawal_fee_percentage',
          0.05,
          'Processing fee percentage applied to withdrawals (e.g., 0.05 for 5%).',
        );
      }
    } catch (error) {
      this.logger.error(
        '[ConfigService] Error loading configs. Ensure Prisma models are generated.',
        error,
      );
    }
  }

  get<T>(key: string, defaultValue?: T): T {
    return (this.configs.get(key) as T) ?? (defaultValue as T);
  }

  async set(
    key: string,
    value: Prisma.InputJsonValue,
    description?: string,
    actorId?: string,
  ) {
    const oldValue = this.configs.get(key);

    await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });

    this.configs.set(key, value as Prisma.JsonValue);

    if (actorId) {
      await this.prisma.auditLog.create({
        data: {
          actorId,
          action: 'SYSTEM_CONFIG_UPDATED',
          targetTable: 'system_configs',
          targetId: key,
          metadata: {
            oldValue,
            newValue: value,
            description,
          },
        },
      });
    }
  }
}
