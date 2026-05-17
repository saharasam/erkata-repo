import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fromBuffer } from 'file-type';
import { UpgradesService } from './upgrades.service';
import { StorageService } from '../common/storage.service';
import { ConfigService } from '../common/config.service';
import { JwtAuthGuard, RolesGuard, RequirePermission } from '../auth/guards';
import type { AuthenticatedRequest } from '../auth/guards';
import { Action } from '../auth/permissions';
import { Tier } from '@prisma/client';

@Controller('upgrades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpgradesController {
  constructor(
    private readonly upgradesService: UpgradesService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {}

  @Get('active')
  async getMyActiveRequest(@Req() req: AuthenticatedRequest) {
    return this.upgradesService.getActiveRequestForUser(req.user.id);
  }

  @Get('bank-details')
  async getBankDetails() {
    return await this.configService.get('BANK_DETAILS_UPGRADE');
  }

  @Get('pending')
  @RequirePermission(Action.VERIFY_UPGRADE)
  async getPendingRequests() {
    return this.upgradesService.getPendingForOperator();
  }

  @Get('verified')
  @RequirePermission(Action.APPROVE_UPGRADE)
  async getVerifiedRequests() {
    return this.upgradesService.getVerifiedForAdmin();
  }

  @Post('request')
  async createRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: { targetTier: Tier },
  ) {
    return this.upgradesService.createRequest(req.user.id, body.targetTier);
  }

  @Patch(':id/proof')
  @UseInterceptors(
    FileInterceptor('proof', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Strict 10MB limit
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProof(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // CRITICAL: Magic Bytes Validation
    const fileInfo = await fromBuffer(file.buffer);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!fileInfo || !allowedMimeTypes.includes(fileInfo.mime)) {
      throw new BadRequestException(
        'Malicious or corrupted file detected. Magic bytes do not match expected image formats.',
      );
    }

    const relativeUrl = await this.storageService.upload(
      file.buffer,
      file.originalname,
    );

    return this.upgradesService.uploadProof(id, req.user.id, relativeUrl);
  }

  @Patch(':id/verify')
  @RequirePermission(Action.VERIFY_UPGRADE)
  async verifyRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { internalNote: string },
  ) {
    return this.upgradesService.verifyRequest(
      id,
      req.user.id,
      body.internalNote,
    );
  }

  @Patch(':id/approve')
  @RequirePermission(Action.APPROVE_UPGRADE)
  async approveRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.upgradesService.approveRequest(id, req.user.id);
  }

  @Patch(':id/reject')
  @RequirePermission(Action.APPROVE_UPGRADE)
  async rejectRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.upgradesService.rejectRequest(id, req.user.id, body.reason);
  }
}
