import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { isIP } from 'node:net';

type ShujuServicePayload = {
  sub?: string | number;
  scope?: string;
  role?: unknown;
  jti?: string;
};

type ServiceRequest = Request & {
  shujuService?: { subject: string; scope: string; jti: string };
};

function normalizedAddress(address: string | undefined): string {
  if (!address) return '';
  if (address.startsWith('::ffff:')) return address.slice(7);
  const zoneIndex = address.indexOf('%');
  return zoneIndex === -1 ? address : address.slice(0, zoneIndex);
}

export function isPrivateServiceAddress(address: string | undefined): boolean {
  const value = normalizedAddress(address);
  if (value === '::1') return true;
  if (isIP(value) === 6) {
    const lower = value.toLowerCase();
    return (
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe8') ||
      lower.startsWith('fe9') ||
      lower.startsWith('fea') ||
      lower.startsWith('feb')
    );
  }
  if (isIP(value) !== 4) return false;
  const [first, second] = value.split('.').map(Number);
  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

@Injectable()
export class ShujuServiceAuthGuard implements CanActivate {
  private readonly logger = new Logger(ShujuServiceAuthGuard.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ServiceRequest>();
    const remoteAddress = request.socket?.remoteAddress;

    if (!this.config.get<boolean>('shujuServiceEnabled')) {
      this.audit('disabled', remoteAddress);
      throw new ServiceUnavailableException('Shuju service is disabled');
    }

    if (!isPrivateServiceAddress(remoteAddress)) {
      this.audit('non_private_source', remoteAddress);
      throw new ForbiddenException('Shuju service is internal only');
    }

    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string' ? /^Bearer ([^\s]+)$/.exec(authorization) : null;
    if (!match) {
      this.audit('missing_token', remoteAddress);
      throw new UnauthorizedException('Shuju service token is required');
    }

    const secret = this.config.get<string>('shujuServiceJwtSecret') ?? '';
    const issuer = this.config.get<string>('shujuServiceIssuer') ?? '';
    const audience = this.config.get<string>('shujuServiceAudience') ?? '';
    const subject = this.config.get<string>('shujuServiceSubject') ?? '';

    try {
      const payload = await this.jwt.verifyAsync<ShujuServicePayload>(match[1], {
        secret,
        algorithms: ['HS256'],
        issuer,
        audience,
        maxAge: '5m',
      });
      if (
        payload.sub !== subject ||
        payload.scope !== 'news:read' ||
        Object.prototype.hasOwnProperty.call(payload, 'role')
      ) {
        throw new Error('Unexpected service claims');
      }
      request.shujuService = {
        subject,
        scope: payload.scope,
        jti: typeof payload.jti === 'string' ? payload.jti : '',
      };
      return true;
    } catch {
      this.audit('invalid_token', remoteAddress);
      throw new UnauthorizedException('Invalid Shuju service token');
    }
  }

  private audit(outcome: string, remoteAddress: string | undefined) {
    this.logger.warn(
      JSON.stringify({
        event: 'shuju_service_auth',
        outcome,
        remoteAddress: normalizedAddress(remoteAddress),
      }),
    );
  }
}
