import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Action, PermissionMatrix } from '../permissions';
import { ROLES_KEY } from './roles.decorator';
// Role and Tier will be handled as strings to avoid export issues in the environment

const Hierarchy: Record<string, number> = {
  super_admin: 5,
  admin: 4,
  operator: 3,
  agent: 2,
  customer: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { role: string };
    }>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User not authenticated or role undefined');
    }

    const userRole = user.role;

    // ── Pattern 1: @Roles(Role.agent, ...) ──────────────────────────
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      // 1. Direct match
      if (requiredRoles.includes(userRole)) {
        return true;
      }

      // 2. Hierarchy Check (Higher roles inherit permissions)
      const userLevel = Hierarchy[userRole] || 0;
      const minRequiredLevel = Math.min(
        ...requiredRoles.map((r) => Hierarchy[r] || 0),
      );

      if (userLevel < minRequiredLevel) {
        throw new ForbiddenException(
          `Hierarchy Violation: Role "${userRole}" lacks sufficient privilege`,
        );
      }
      return true;
    }

    // ── Pattern 2: @RequirePermission(Action.X, Action.Y) ─────────────────────────
    const requiredAction = this.reflector.get<Action>(
      'action',
      context.getHandler(),
    );
    const requiredActions = this.reflector.get<Action[]>(
      'actions',
      context.getHandler(),
    );
    const actionsToVerify =
      requiredActions || (requiredAction ? [requiredAction] : []);

    if (actionsToVerify.length === 0) {
      return true;
    }

    const userPermissions = PermissionMatrix[userRole] || [];
    const hasPermission = actionsToVerify.some((action) =>
      userPermissions.includes(action),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Role "${userRole}" lacks mandatory permission. Available: [${userPermissions.join(', ')}]. Required (any of): [${actionsToVerify.join(', ')}]`,
      );
    }

    return true;
  }
}
