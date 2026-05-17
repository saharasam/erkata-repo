import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/guards';
interface MulterFile {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export declare class UploadsController {
    private readonly prisma;
    private readonly storageService;
    constructor(prisma: PrismaService, storageService: StorageService);
    uploadFile(file: MulterFile, req: AuthenticatedRequest): Promise<{
        id: string;
        url: string;
        fileName: string;
    }>;
    getFile(id: string, res: Response, req: AuthenticatedRequest): Promise<void>;
}
export {};
