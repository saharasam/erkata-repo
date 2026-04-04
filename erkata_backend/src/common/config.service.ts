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

  async set(key: string, value: Prisma.InputJsonValue, description?: string) {
    await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
    this.configs.set(key, value as Prisma.JsonValue);
  }
}
