import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConfigService implements OnModuleInit {
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
          100000,
          'Threshold for Super Admin escalation',
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
