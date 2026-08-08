import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ShujuNewsPublishAuthGuard } from '@/modules/shuju-service/shuju-news-publish-auth.guard';

const readSecret = 'read-secret-that-is-independent-and-long-enough';
const writeSecret = 'write-secret-that-is-independent-and-long-enough';
const adminSecret = 'admin-secret-that-is-independent-and-long-enough';

function context(token?: string, remoteAddress = '172.20.0.8') {
  const request = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    socket: { remoteAddress },
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function config(enabled = true) {
  return new ConfigService({
    shujuNewsPublishEnabled: enabled,
    shujuNewsPublishJwtSecret: writeSecret,
    shujuServiceIssuer: 'shuju-engine',
    shujuNewsPublishAudience: 'corp-site-news-publish',
    shujuNewsPublishSubject: 'shuju-engine',
  });
}

function token(jwt: JwtService, secret: string, payload: Record<string, unknown>) {
  return jwt.sign(payload, {
    secret,
    algorithm: 'HS256',
    issuer: 'shuju-engine',
    audience: 'corp-site-news-publish',
    expiresIn: '5m',
  });
}

describe('ShujuNewsPublishAuthGuard', () => {
  const jwt = new JwtService();

  it('accepts only the private-network write token', async () => {
    const guard = new ShujuNewsPublishAuthGuard(config(), jwt);
    const valid = token(jwt, writeSecret, {
      sub: 'shuju-engine',
      scope: 'news:publish',
      jti: 'publish-request',
    });
    await expect(guard.canActivate(context(valid))).resolves.toBe(true);
    await expect(guard.canActivate(context(valid, '120.26.240.18'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects read, admin, wrong-scope and admin-shaped tokens', async () => {
    const guard = new ShujuNewsPublishAuthGuard(config(), jwt);
    for (const invalid of [
      token(jwt, readSecret, { sub: 'shuju-engine', scope: 'news:publish' }),
      token(jwt, adminSecret, { sub: 1, role: 'super_admin', scope: 'news:publish' }),
      token(jwt, writeSecret, { sub: 'shuju-engine', scope: 'news:read' }),
      token(jwt, writeSecret, {
        sub: 'shuju-engine',
        scope: 'news:publish',
        role: 'editor',
      }),
    ]) {
      await expect(guard.canActivate(context(invalid))).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    }
  });

  it('requires iat through the five-minute maxAge policy', async () => {
    const guard = new ShujuNewsPublishAuthGuard(config(), jwt);
    const missingIat = jwt.sign(
      { sub: 'shuju-engine', scope: 'news:publish' },
      {
        secret: writeSecret,
        algorithm: 'HS256',
        issuer: 'shuju-engine',
        audience: 'corp-site-news-publish',
        noTimestamp: true,
      },
    );
    await expect(guard.canActivate(context(missingIat))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
