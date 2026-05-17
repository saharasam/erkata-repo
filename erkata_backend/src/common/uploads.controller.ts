import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fromBuffer } from 'file-type';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards';
import { Attachment, UserRole } from '@prisma/client';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/guards';
import { join, basename } from 'path';
import { createReadStream, existsSync } from 'fs';
import { stat } from 'fs/promises';

interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          return cb(new BadRequestException('Unsupported file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // CRITICAL: Magic Bytes Validation
    const fileInfo = await fromBuffer(file.buffer);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!fileInfo || !allowedMimeTypes.includes(fileInfo.mime)) {
      throw new BadRequestException(
        'Malicious or corrupted file detected. Magic bytes do not match expected formats.',
      );
    }

    const relativeUrl = await this.storageService.upload(
      file.buffer,
      file.originalname,
    );

    const attachment: Attachment = await this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        url: relativeUrl,
        ownerId: req.user.id,
      },
    });

    return {
      id: attachment.id,
      url: attachment.url,
      fileName: attachment.fileName,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFile(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: AuthenticatedRequest,
  ) {
    let attachment: Attachment | null = await this.prisma.attachment.findUnique(
      {
        where: { id },
      },
    );

    // BOLA Remediation: If ID lookup fails, try searching by filename in the URL
    if (!attachment) {
      attachment = await this.prisma.attachment.findFirst({
        where: {
          url: { contains: basename(id) },
        },
      });
    }

    const user = req.user;
    const isPrivileged = (
      [
        UserRole.super_admin,
        UserRole.admin,
        UserRole.operator,
        UserRole.financial_operator,
      ] as string[]
    ).includes(user.role);

    let fileName: string;
    let mimeType: string;
    let originalName: string;

    if (attachment) {
      // IDOR Check: Only owner or staff can access
      if (!isPrivileged && attachment.ownerId !== user.id) {
        throw new ForbiddenException(
          'Access denied. You do not have permission to view this file.',
        );
      }

      const urlParts = attachment.url.split('/');
      fileName = urlParts[urlParts.length - 1];
      mimeType = attachment.mimeType;
      originalName = attachment.fileName;
    } else {
      // DISK FALLBACK (No DB entry found): Strictly limited to staff
      if (!isPrivileged) {
        throw new ForbiddenException(
          'Access denied. File is not registered or you lack sufficient privileges.',
        );
      }

      // Path Traversal Protection: Stripping directory info and validating UUID pattern
      fileName = basename(id);
      if (!/^[a-f0-9-]+\.[a-z0-9]+$/.test(fileName)) {
        throw new BadRequestException(
          'Invalid filename pattern or traversal detected.',
        );
      }
      const fallbackPath = join(process.cwd(), 'uploads', fileName);

      if (!existsSync(fallbackPath)) {
        throw new NotFoundException('File not found');
      }

      // Detection for fallback files
      mimeType = 'application/octet-stream';
      if (fileName.match(/\.(jpg|jpeg)$/i)) mimeType = 'image/jpeg';
      else if (fileName.match(/\.png$/i)) mimeType = 'image/png';
      else if (fileName.match(/\.webp$/i)) mimeType = 'image/webp';
      else if (fileName.match(/\.pdf$/i)) mimeType = 'application/pdf';

      originalName = fileName;
    }

    const filePath = join(process.cwd(), 'uploads', fileName);

    try {
      const fileStat = await stat(filePath);

      res.set({
        'Content-Type': mimeType,
        'Content-Length': fileStat.size,
        'Content-Disposition': `inline; filename="${originalName}"`,
      });

      const stream = createReadStream(filePath);
      stream.pipe(res);
    } catch {
      throw new BadRequestException('Error streaming file');
    }
  }
}
