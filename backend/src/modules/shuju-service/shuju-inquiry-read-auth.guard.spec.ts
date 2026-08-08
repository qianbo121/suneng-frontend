import {
  ExecutionContext,
  ForbiddenException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ShujuInquiryReadAuthGuard } from '@/modules/shuju-service/shuju-inquiry-read-auth.guard';

const secret = 'inquiry-secret-that-is-independent-and-long-enough';

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
    shujuInquiryReadEnabled: enabled,
    shujuInquiryReadJwtSecret: secret,
    shujuInquiryReadAudience: 'corp-site-inquiries-read',
    shujuInquiryReadSubject: 'shuju-engine',
  });
}

function sign(jwt: JwtService, payload: Record<string, unknown>, options = {}) {
  return jwt.sign(payload, {
    secret,
    algorithm: 'HS256',
    issuer: 'shuju-engine',
    audience: 'corp-site-inquiries-read',
    expiresIn: '5m',
    ...options,
  });
}

describe('ShujuInquiryReadAuthGuard', () => {
  const jwt = new JwtService();

  beforeEach(() => jest.spyOn(Logger.prototype, 'warn').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it('fails closed while disabled and rejects public callers', async () => {
    await expect(
      new ShujuInquiryReadAuthGuard(settings(false), jwt).canActivate(context()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    const valid = sign(jwt, { sub: 'shuju-engine', scope: 'inquiries:read' });
    await expect(
      new ShujuInquiryReadAuthGuard(settings(), jwt).canActivate(context(valid, '120.26.240.18')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('accepts only exact inquiry claims without a role', async () => {
    const guard = new ShujuInquiryReadAuthGuard(settings(), jwt);
    const valid = sign(jwt, {
      sub: 'shuju-engine',
      scope: 'inquiries:read',
      jti: 'request-1',
    });
    await expect(guard.canActivate(context(valid))).resolves.toBe(true);
    await expect(
      guard.canActivate(
        context(sign(jwt, { sub: 'shuju-engine', scope: 'inquiries:read', role: 'editor' })),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      guard.canActivate(context(sign(jwt, { sub: 'shuju-engine', scope: 'news:read' }))),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('requires iat for the server-side five minute max age', async () => {
    const guard = new ShujuInquiryReadAuthGuard(settings(), jwt);
    const missingIat = jwt.sign(
      { sub: 'shuju-engine', scope: 'inquiries:read' },
      {
        secret,
        algorithm: 'HS256',
        issuer: 'shuju-engine',
        audience: 'corp-site-inquiries-read',
        noTimestamp: true,
      },
    );
    await expect(guard.canActivate(context(missingIat))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
