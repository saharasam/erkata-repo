import { PrismaService } from '../prisma/prisma.service';
import * as express from 'express';
interface MulterFile {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
}
export declare class UploadsController {
    private prisma;
    constructor(prisma: PrismaService);
    uploadFile(file: MulterFile): Promise<{
        id: string;
        url: string;
    }>;
    getFile(id: string, res: express.Response): Promise<void>;
}
export {};
