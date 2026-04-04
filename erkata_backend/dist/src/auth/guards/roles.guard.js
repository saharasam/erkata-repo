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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_1 = require("../permissions");
const roles_decorator_1 = require("./roles.decorator");
const Hierarchy = {
    super_admin: 5,
    admin: 4,
    operator: 3,
    agent: 2,
    customer: 1,
};
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.role) {
            throw new common_1.ForbiddenException('User not authenticated or role undefined');
        }
        const userRole = user.role;
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (requiredRoles && requiredRoles.length > 0) {
            if (requiredRoles.includes(userRole)) {
                return true;
            }
            const userLevel = Hierarchy[userRole] || 0;
            const minRequiredLevel = Math.min(...requiredRoles.map((r) => Hierarchy[r] || 0));
            if (userLevel < minRequiredLevel) {
                throw new common_1.ForbiddenException(`Hierarchy Violation: Role "${userRole}" lacks sufficient privilege`);
            }
            return true;
        }
        const requiredAction = this.reflector.get('action', context.getHandler());
        const requiredActions = this.reflector.get('actions', context.getHandler());
        const actionsToVerify = requiredActions || (requiredAction ? [requiredAction] : []);
        if (actionsToVerify.length === 0) {
            return true;
        }
        const userPermissions = permissions_1.PermissionMatrix[userRole] || [];
        const hasPermission = actionsToVerify.some((action) => userPermissions.includes(action));
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`Role "${userRole}" lacks mandatory permission. Available: [${userPermissions.join(', ')}]. Required (any of): [${actionsToVerify.join(', ')}]`);
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map