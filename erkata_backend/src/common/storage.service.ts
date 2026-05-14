import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';

/**
 * StorageService handles file persistence.
 * Currently configured for local filesystem storage to avoid external dependencies.
 * Can be refactored to use S3 or Cloudinary by replacing the upload method.
 **/
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // Ensure the upload directory exists
    void this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists() {
    try {
      await mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error('Could not create upload directory', error);
    }
  }

  /**
   * Saves a file buffer to the local filesystem and returns a relative URL.
   * @param buffer The file content buffer
   * @param originalName The original filename for extension extraction
   */
  async upload(buffer: Buffer, originalName: string): Promise<string> {
    const fileId = randomUUID();
    const extension = extname(originalName);
    const fileName = `${fileId}${extension}`;
    const filePath = join(this.uploadDir, fileName);

    try {
      await writeFile(filePath, buffer);
      // Return a relative URL path that the API can resolve
      return `/uploads/${fileName}`;
    } catch (error) {
      this.logger.error(`File upload failed: ${originalName}`, error);
      throw new Error('Failed to save file to storage');
    }
  }
}
