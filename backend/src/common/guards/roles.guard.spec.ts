import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@prisma/client';

import { RolesGuard } from '@/common/guards/roles.guard';

function makeContext(user?: { role: AdminRole }): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

function makeReflector(values: { isPublic?: boolean; roles?: AdminRole[] }): Reflector {
  return {
    getAllAndOverride: (key: string) => (key === 'isPublic' ? values.isPublic : values.roles),
  } as unknown as Reflector;
}

describe('RolesGuard', () => {
  it('allows @Public routes without any role check', () => {
    const guard = new RolesGuard(makeReflector({ isPublic: true }));
    expect(guard.canActivate(makeContext())).toBe(true);
  });

  it('denies a non-public route that declares no @Roles (default-deny / fail closed)', () => {
    const guard = new RolesGuard(makeReflector({ isPublic: false, roles: undefined }));
    expect(() => guard.canActivate(makeContext({ role: AdminRole.editor }))).toThrow(
      ForbiddenException,
    );
  });

  it('denies when there is no authenticated user on a roled route', () => {
    const guard = new RolesGuard(
      makeReflector({ isPublic: false, roles: [AdminRole.super_admin] }),
    );
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });

  it('denies when the user role is not in @Roles (editor hitting super_admin route)', () => {
    const guard = new RolesGuard(
      makeReflector({ isPublic: false, roles: [AdminRole.super_admin] }),
    );
    expect(() => guard.canActivate(makeContext({ role: AdminRole.editor }))).toThrow(
      ForbiddenException,
    );
  });

  it('allows when the user role is in @Roles', () => {
    const guard = new RolesGuard(
      makeReflector({ isPublic: false, roles: [AdminRole.super_admin, AdminRole.editor] }),
    );
    expect(guard.canActivate(makeContext({ role: AdminRole.editor }))).toBe(true);
  });
});
