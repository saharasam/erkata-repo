import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard, RolesGuard, RequirePermission } from '../auth/guards';
import { Action } from '../auth/permissions';
import { Prisma } from '@prisma/client';

@Controller('admin/packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminPackagesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @RequirePermission(Action.VIEW_SYSTEM_STATISTICS)
  async getAllPackages() {
    return this.prisma.package.findMany({
      orderBy: { price: 'asc' },
    });
  }

  @Get(':id')
  @RequirePermission(Action.VIEW_SYSTEM_STATISTICS)
  async getPackage(@Param('id') id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  @Patch(':id')
  @RequirePermission(Action.MODIFY_GOVERNANCE)
  async updatePackage(
    @Param('id') id: string,
    @Body()
    data: {
      displayName?: string;
      price?: number;
      referralSlots?: number;
      zoneLimit?: number;
    },
  ) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const updateData: Prisma.PackageUpdateInput = {};
    if (data.displayName !== undefined)
      updateData.displayName = data.displayName;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.referralSlots !== undefined)
      updateData.referralSlots = data.referralSlots;
    if (data.zoneLimit !== undefined) updateData.zoneLimit = data.zoneLimit;

    return this.prisma.package.update({
      where: { id },
      data: updateData,
    });
  }
}
