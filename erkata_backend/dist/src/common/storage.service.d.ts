export declare class StorageService {
    private readonly logger;
    private readonly uploadDir;
    constructor();
    private ensureDirectoryExists;
    upload(buffer: Buffer, originalName: string): Promise<string>;
}
