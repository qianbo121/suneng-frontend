import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@prisma/client';

import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Honor @Public so public routes are never gated by role checks. This is a
    // precondition for default-deny: without it, flipping the default below
    // would 403 every @Public route that shares a controller with admin routes.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User role is unavailable');
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
