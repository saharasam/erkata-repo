"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CsrfGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfGuard = void 0;
const common_1 = require("@nestjs/common");
let CsrfGuard = CsrfGuard_1 = class CsrfGuard {
    logger = new common_1.Logger(CsrfGuard_1.name);
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const method = request.method.toUpperCase();
        const path = request.path;
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
        if (safeMethods.includes(method)) {
            return true;
        }
        const publicRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];
        if (publicRoutes.some((route) => path === route || path === `${route}/`)) {
            return true;
        }
        const csrfTokenHeader = request.headers['x-csrf-token'];
        const cookies = request.cookies;
        const csrfTokenCookie = cookies?.['csrfToken'];
        if (!csrfTokenHeader || !csrfTokenCookie) {
            this.logger.warn(`CSRF token missing: header=${!!csrfTokenHeader}, cookie=${!!csrfTokenCookie} for ${path}`);
            throw new common_1.ForbiddenException('CSRF token missing');
        }
        if (csrfTokenHeader !== csrfTokenCookie) {
            this.logger.error(`CSRF token mismatch for ${path}: Header value does not match Cookie value. Possible sync issue in client storage.`);
            throw new common_1.ForbiddenException('CSRF token mismatch');
        }
        return true;
    }
};
exports.CsrfGuard = CsrfGuard;
exports.CsrfGuard = CsrfGuard = CsrfGuard_1 = __decorate([
    (0, common_1.Injectable)()
], CsrfGuard);
//# sourceMappingURL=csrf.guard.js.map