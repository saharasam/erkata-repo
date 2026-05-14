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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockdownGuard = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../config.service");
const client_1 = require("@prisma/client");
const jwt_1 = require("@nestjs/jwt");
let LockdownGuard = class LockdownGuard {
    configService;
    jwtService;
    constructor(configService, jwtService) {
        this.configService = configService;
        this.jwtService = jwtService;
    }
    canActivate(context) {
        const isLockdown = this.configService.get('emergency_lockdown', false);
        if (!isLockdown) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const url = request.url;
        if (url.startsWith('/auth')) {
            return true;
        }
        const user = request.user;
        if (user &&
            (user.role === client_1.UserRole.super_admin || user.role === client_1.UserRole.admin)) {
            return true;
        }
        const authHeader = request.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = this.jwtService.verify(token);
                if (decoded &&
                    (decoded.role === client_1.UserRole.super_admin ||
                        decoded.role === client_1.UserRole.admin)) {
                    return true;
                }
            }
            catch {
            }
        }
        throw new common_1.ServiceUnavailableException('The Erkata Platform is currently in emergency lockdown mode. All non-administrative operations are suspended.');
    }
};
exports.LockdownGuard = LockdownGuard;
exports.LockdownGuard = LockdownGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        jwt_1.JwtService])
], LockdownGuard);
//# sourceMappingURL=lockdown.guard.js.map