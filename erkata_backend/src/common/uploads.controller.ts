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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards';
import { Attachment } from '@prisma/client';
import type { Response } from 'express';
import { join } from 'path';
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
  async uploadFile(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
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
      },
    });

    return {
      id: attachment.id,
      url: attachment.url,
      fileName: attachment.fileName,
    };
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const attachment: Attachment | null =
      await this.prisma.attachment.findUnique({
        where: { id },
      });

    if (!attachment) {
      throw new NotFoundException('File metadata not found');
    }

    const urlParts = attachment.url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = join(process.cwd(), 'uploads', fileName);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Physical file not found on disk');
    }

    try {
      const fileStat = await stat(filePath);

      res.set({
        'Content-Type': attachment.mimeType,
        'Content-Length': fileStat.size,
        'Content-Disposition': `inline; filename="${attachment.fileName}"`,
      });

      const stream = createReadStream(filePath);
      stream.pipe(res);
    } catch {
      throw new BadRequestException('Error streaming file');
    }
  }
}
