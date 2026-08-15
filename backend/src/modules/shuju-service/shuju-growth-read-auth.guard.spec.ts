import {
  ExecutionContext,
  ForbiddenException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ShujuGrowthReadAuthGuard } from '@/modules/shuju-service/shuju-growth-read-auth.guard';

const secret = 'growth-secret-that-is-independent-and-long-enough';

function context(token?: string, remoteAddress = '172.20.0.5') {
  const request = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    socket: { remoteAddress },
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function settings(enabled = true) {
  return new ConfigService({
    shujuGrowthReadEnabled: enabled,
    shujuGrowthReadJwtSecret: secret,
    shujuGrowthReadAudience: 'corp-site-growth-read',
    shujuGrowthReadSubject: 'shuju-engine',
  });
}

function sign(jwt: JwtService, payload: Record<string, unknown>) {
  return jwt.sign(payload, {
    secret,
    algorithm: 'HS256',
    issuer: 'shuju-engine',
    audience: 'corp-site-growth-read',
    expiresIn: '5m',
  });
}

describe('ShujuGrowthReadAuthGuard', () => {
  const jwt = new JwtService();

  beforeEach(() => jest.spyOn(Logger.prototype, 'warn').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it('fails closed when disabled and rejects public callers', async () => {
    await expect(
      new ShujuGrowthReadAuthGuard(settings(false), jwt).canActivate(context()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    const valid = sign(jwt, { sub: 'shuju-engine', scope: 'growth:read' });
    await expect(
      new ShujuGrowthReadAuthGuard(settings(), jwt).canActivate(context(valid, '120.26.240.18')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('accepts only the exact read-only growth claims', async () => {
    const guard = new ShujuGrowthReadAuthGuard(settings(), jwt);
    await expect(
      guard.canActivate(context(sign(jwt, { sub: 'shuju-engine', scope: 'growth:read' }))),
    ).resolves.toBe(true);
    await expect(
      guard.canActivate(
        context(sign(jwt, { sub: 'shuju-engine', scope: 'growth:read', role: 'editor' })),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
