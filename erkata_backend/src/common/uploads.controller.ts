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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/prisma.service';
import * as express from 'express';

interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Controller('uploads')
export class UploadsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const attachment = await this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        content: file.buffer.toString('base64'),
      },
    });

    // Return the URL to access this file
    // In a real app, this would be the full public URL
    return {
      id: attachment.id,
      url: `/uploads/${attachment.id}`,
    };
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: express.Response) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('File not found');
    }

    const buffer = Buffer.from(attachment.content, 'base64');
    res.set({
      'Content-Type': attachment.mimeType,
      'Content-Length': buffer.length,
      'Content-Disposition': `inline; filename="${attachment.fileName}"`,
    });
    res.send(buffer);
  }
}
