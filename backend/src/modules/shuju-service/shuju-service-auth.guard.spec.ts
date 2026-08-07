import {
  ExecutionContext,
  ForbiddenException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
  isPrivateServiceAddress,
  ShujuServiceAuthGuard,
} from '@/modules/shuju-service/shuju-service-auth.guard';

const serviceSecret = 'service-secret-that-is-independent-and-long-enough';
const adminSecret = 'admin-secret-that-is-different-and-long-enough';

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
    shujuServiceEnabled: enabled,
    shujuServiceJwtSecret: serviceSecret,
    shujuServiceIssuer: 'shuju-engine',
    shujuServiceAudience: 'corp-site-news-read',
    shujuServiceSubject: 'shuju-engine',
  });
}

function token(jwt: JwtService, payload: Record<string, unknown>, secret = serviceSecret) {
  return jwt.sign(payload, {
    secret,
    algorithm: 'HS256',
    issuer: 'shuju-engine',
    audience: 'corp-site-news-read',
    expiresIn: '5m',
  });
}

function tokenWithOptions(
  jwt: JwtService,
  payload: Record<string, unknown>,
  options: Record<string, unknown> = {},
  secret = serviceSecret,
) {
  return jwt.sign(payload, {
    secret,
    algorithm: 'HS256',
    issuer: 'shuju-engine',
    audience: 'corp-site-news-read',
    ...options,
  });
}

describe('ShujuServiceAuthGuard', () => {
  const jwt = new JwtService();

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('recognizes loopback and private container addresses only', () => {
    expect(isPrivateServiceAddress('127.0.0.1')).toBe(true);
    expect(isPrivateServiceAddress('::1')).toBe(true);
    expect(isPrivateServiceAddress('::ffff:172.20.0.5')).toBe(true);
    expect(isPrivateServiceAddress('10.0.0.8')).toBe(true);
    expect(isPrivateServiceAddress('192.168.1.8')).toBe(true);
    expect(isPrivateServiceAddress('8.8.8.8')).toBe(false);
    expect(isPrivateServiceAddress('120.26.240.18')).toBe(false);
  });

  it('fails closed when the service is disabled', async () => {
    const guard = new ShujuServiceAuthGuard(settings(false), jwt);
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('rejects a public-network caller before token validation', async () => {
    const guard = new ShujuServiceAuthGuard(settings(), jwt);
    const valid = token(jwt, { sub: 'shuju-engine', scope: 'news:read' });
    await expect(guard.canActivate(context(valid, '120.26.240.18'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('accepts only the exact service claims signed by the independent secret', async () => {
    const guard = new ShujuServiceAuthGuard(settings(), jwt);
    const valid = token(jwt, { sub: 'shuju-engine', scope: 'news:read', jti: 'test-request' });
    await expect(guard.canActivate(context(valid))).resolves.toBe(true);
  });

  it('rejects an administrator token signed by the admin secret', async () => {
    const guard = new ShujuServiceAuthGuard(settings(), jwt);
    const adminToken = token(
      jwt,
      { sub: 1, username: 'admin', role: 'super_admin', scope: 'news:read' },
      adminSecret,
    );
    await expect(guard.canActivate(context(adminToken))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('signs service tokens outside the administrator JWT trust domain', async () => {
    const serviceToken = token(jwt, { sub: 'shuju-engine', scope: 'news:read' });
    await expect(
      jwt.verifyAsync(serviceToken, {
        secret: adminSecret,
        algorithms: ['HS256'],
      }),
    ).rejects.toThrow();
  });

  it('rejects admin-shaped claims even if signed with the service secret', async () => {
    const guard = new ShujuServiceAuthGuard(settings(), jwt);
    const adminShaped = token(jwt, {
      sub: 'shuju-engine',
      scope: 'news:read',
      role: 'editor',
    });
    await expect(guard.canActivate(context(adminShaped))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects tokens without exp but too-old issued time when maxAge is enforced', async () => {
    const guard = new ShujuServiceAuthGuard(settings(), jwt);
    const issuedTenMinutesAgo = Math.floor(Date.now() / 1000) - 10 * 60;
    const stale = tokenWithOptions(
      jwt,
      {
        sub: 'shuju-engine',
        scope: 'news:read',
        iat: issuedTenMinutesAgo,
      },
      {
        noTimestamp: true,
      },
    );
    await expect(guard.canActivate(context(stale))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects tokens without iat when maxAge is enforced', async () => {
    const guard = new ShujuServiceAuthGuard(settings(), jwt);
    const missingIat = tokenWithOptions(jwt, { sub: 'shuju-engine', scope: 'news:read' }, {
      noTimestamp: true,
    });
    await expect(guard.canActivate(context(missingIat))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects missing, malformed, wrong-scope and wrong-subject tokens', async () => {
    const guard = new ShujuServiceAuthGuard(settings(), jwt);
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(guard.canActivate(context('not-a-jwt'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      guard.canActivate(context(token(jwt, { sub: 'shuju-engine', scope: 'news:write' }))),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      guard.canActivate(context(token(jwt, { sub: '1', scope: 'news:read' }))),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
