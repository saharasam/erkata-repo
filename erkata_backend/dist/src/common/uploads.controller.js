"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("./storage.service");
const guards_1 = require("../auth/guards");
const path_1 = require("path");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
let UploadsController = class UploadsController {
    prisma;
    storageService;
    constructor(prisma, storageService) {
        this.prisma = prisma;
        this.storageService = storageService;
    }
    async uploadFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const relativeUrl = await this.storageService.upload(file.buffer, file.originalname);
        const attachment = await this.prisma.attachment.create({
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
    async getFile(id, res) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id },
        });
        if (!attachment) {
            throw new common_1.NotFoundException('File metadata not found');
        }
        const urlParts = attachment.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', fileName);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('Physical file not found on disk');
        }
        try {
            const fileStat = await (0, promises_1.stat)(filePath);
            res.set({
                'Content-Type': attachment.mimeType,
                'Content-Length': fileStat.size,
                'Content-Disposition': `inline; filename="${attachment.fileName}"`,
            });
            const stream = (0, fs_1.createReadStream)(filePath);
            stream.pipe(res);
        }
        catch {
            throw new common_1.BadRequestException('Error streaming file');
        }
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
                return cb(new common_1.BadRequestException('Unsupported file type'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getFile", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map