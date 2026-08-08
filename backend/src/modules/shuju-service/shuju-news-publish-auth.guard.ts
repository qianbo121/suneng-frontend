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

type PublishPayload = {
  sub?: string | number;
  scope?: string;
  role?: unknown;
  jti?: string;
};

export type ShujuPublishRequest = Request & {
  shujuPublisher?: { subject: string; scope: string; jti: string };
};

@Injectable()
export class ShujuNewsPublishAuthGuard implements CanActivate {
  private readonly logger = new Logger(ShujuNewsPublishAuthGuard.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ShujuPublishRequest>();
    const remoteAddress = request.socket?.remoteAddress;

    if (!this.config.get<boolean>('shujuNewsPublishEnabled')) {
      this.audit('disabled', remoteAddress);
      throw new ServiceUnavailableException('Shuju news publishing is disabled');
    }
    if (!isPrivateServiceAddress(remoteAddress)) {
      this.audit('non_private_source', remoteAddress);
      throw new ForbiddenException('Shuju news publishing is internal only');
    }

    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string' ? /^Bearer ([^\s]+)$/.exec(authorization) : null;
    if (!match) {
      this.audit('missing_token', remoteAddress);
      throw new UnauthorizedException('Shuju news publish token is required');
    }

    try {
      const subject = this.config.get<string>('shujuNewsPublishSubject') ?? '';
      const payload = await this.jwt.verifyAsync<PublishPayload>(match[1], {
        secret: this.config.get<string>('shujuNewsPublishJwtSecret') ?? '',
        algorithms: ['HS256'],
        issuer: this.config.get<string>('shujuServiceIssuer') ?? '',
        audience: this.config.get<string>('shujuNewsPublishAudience') ?? '',
        maxAge: '5m',
      });
      if (
        payload.sub !== subject ||
        payload.scope !== 'news:publish' ||
        Object.prototype.hasOwnProperty.call(payload, 'role')
      ) {
        throw new Error('Unexpected publish claims');
      }
      request.shujuPublisher = {
        subject,
        scope: payload.scope,
        jti: typeof payload.jti === 'string' ? payload.jti : '',
      };
      return true;
    } catch {
      this.audit('invalid_token', remoteAddress);
      throw new UnauthorizedException('Invalid Shuju news publish token');
    }
  }

  private audit(outcome: string, remoteAddress: string | undefined) {
    this.logger.warn(
      JSON.stringify({
        event: 'shuju_news_publish_auth',
        outcome,
        remoteAddress: remoteAddress ?? '',
      }),
    );
  }
}
