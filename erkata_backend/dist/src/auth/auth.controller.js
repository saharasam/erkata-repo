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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const redis_presence_service_1 = require("../common/redis/redis-presence.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthController = class AuthController {
    authService;
    presence;
    prisma;
    constructor(authService, presence, prisma) {
        this.authService = authService;
        this.presence = presence;
        this.prisma = prisma;
    }
    async login(body, res) {
        return await this.authService.login({ identifier: body.identifier, pass: body.password }, res);
    }
    async refresh(req) {
        const cookies = req.cookies;
        const refreshToken = cookies?.['refreshToken'];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token missing');
        }
        return await this.authService.refresh(refreshToken);
    }
    async logout(res) {
        return await this.authService.logout(res);
    }
    async register(body) {
        try {
            return await this.authService.register(body);
        }
        catch (e) {
            const message = e instanceof Error ? e.message : 'Registration failed';
            throw new common_1.InternalServerErrorException(message);
        }
    }
    async heartbeat(req) {
        const user = req.user;
        await this.presence.heartbeat(user.id);
        let assignmentFound = false;
        let requestId = null;
        if (user.role === client_1.UserRole.operator) {
            const pushedRequest = await this.prisma.request.findFirst({
                where: {
                    assignedOperatorId: user.id,
                    status: client_1.RequestStatus.pending,
                },
                select: { id: true },
            });
            if (pushedRequest) {
                assignmentFound = true;
                requestId = pushedRequest.id;
            }
        }
        return {
            status: 'ok',
            assignmentFound,
            requestId,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('heartbeat'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "heartbeat", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        redis_presence_service_1.RedisPresenceService,
        prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map