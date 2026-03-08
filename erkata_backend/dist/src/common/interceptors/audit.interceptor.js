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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditInterceptor = class AuditInterceptor {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user } = request;
        const monitoredMethods = ['POST', 'PATCH', 'DELETE'];
        if (!monitoredMethods.includes(method)) {
            return next.handle();
        }
        const excludedPaths = ['/auth/login', '/auth/register', '/auth/refresh'];
        if (excludedPaths.some((path) => url.includes(path))) {
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.tap)((response) => {
            void (async () => {
                try {
                    const segments = url.split('/').filter(Boolean);
                    const targetTable = segments[0] || 'Unknown';
                    let targetIdFromContext = segments[1] || null;
                    if (!targetIdFromContext && body && typeof body === 'object') {
                        const bodyRecord = body;
                        if (typeof bodyRecord.id === 'string') {
                            targetIdFromContext = bodyRecord.id;
                        }
                        else if (bodyRecord.id) {
                            targetIdFromContext = JSON.stringify(bodyRecord.id);
                        }
                    }
                    await this.prisma.auditLog.create({
                        data: {
                            actorId: user?.id || null,
                            action: `${method} ${url}`,
                            targetTable,
                            targetId: targetIdFromContext,
                            metadata: {
                                requestBody: body,
                                response: response && typeof response === 'object'
                                    ? { ...response }
                                    : null,
                            },
                        },
                    });
                }
                catch (error) {
                    console.error('[AuditInterceptor] Failed to record audit log:', error);
                }
            })();
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map