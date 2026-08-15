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

import { isPrivateServiceAddress } from '@/modules/shuju-service/shuju-service-auth.guard';

type GrowthPayload = { sub?: string | number; scope?: string; role?: unknown; jti?: string };
export type GrowthServiceRequest = Request & {
  shujuGrowthService?: { subject: string; scope: string; jti: string };
};

@Injectable()
export class ShujuGrowthReadAuthGuard implements CanActivate {
  private readonly logger = new Logger(ShujuGrowthReadAuthGuard.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GrowthServiceRequest>();
    if (!isPrivateServiceAddress(request.socket?.remoteAddress)) {
      this.audit('non_private_source');
      throw new ForbiddenException('Shuju growth service is internal only');
    }
    if (!this.config.get<boolean>('shujuGrowthReadEnabled')) {
      this.audit('disabled');
      throw new ServiceUnavailableException('Shuju growth reading is disabled');
    }
    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string' ? /^Bearer ([^\s]+)$/.exec(authorization) : null;
    if (!match) {
      this.audit('missing_token');
      throw new UnauthorizedException('Shuju growth token is required');
    }
    try {
      const subject = this.config.get<string>('shujuGrowthReadSubject') ?? '';
      const payload = await this.jwt.verifyAsync<GrowthPayload>(match[1], {
        secret: this.config.get<string>('shujuGrowthReadJwtSecret') ?? '',
        algorithms: ['HS256'],
        issuer: 'shuju-engine',
        audience: this.config.get<string>('shujuGrowthReadAudience') ?? '',
        maxAge: '5m',
      });
      if (
        payload.sub !== subject ||
        payload.scope !== 'growth:read' ||
        Object.prototype.hasOwnProperty.call(payload, 'role')
      ) {
        throw new Error('Unexpected growth service claims');
      }
      request.shujuGrowthService = {
        subject,
        scope: payload.scope,
        jti: typeof payload.jti === 'string' ? payload.jti : '',
      };
      return true;
    } catch {
      this.audit('invalid_token');
      throw new UnauthorizedException('Invalid Shuju growth token');
    }
  }

  private audit(outcome: string) {
    this.logger.warn(JSON.stringify({ event: 'shuju_growth_auth', outcome }));
  }
}
