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

type InquiryPayload = { sub?: string | number; scope?: string; role?: unknown; jti?: string };
export type InquiryServiceRequest = Request & {
  shujuInquiryService?: { subject: string; scope: string; jti: string };
};

@Injectable()
export class ShujuInquiryReadAuthGuard implements CanActivate {
  private readonly logger = new Logger(ShujuInquiryReadAuthGuard.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<InquiryServiceRequest>();
    const remoteAddress = request.socket?.remoteAddress;
    if (!isPrivateServiceAddress(remoteAddress)) {
      this.audit('non_private_source');
      throw new ForbiddenException('Shuju inquiry service is internal only');
    }
    if (!this.config.get<boolean>('shujuInquiryReadEnabled')) {
      this.audit('disabled');
      throw new ServiceUnavailableException('Shuju inquiry reading is disabled');
    }
    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string' ? /^Bearer ([^\s]+)$/.exec(authorization) : null;
    if (!match) {
      this.audit('missing_token');
      throw new UnauthorizedException('Shuju inquiry token is required');
    }
    try {
      const subject = this.config.get<string>('shujuInquiryReadSubject') ?? '';
      const payload = await this.jwt.verifyAsync<InquiryPayload>(match[1], {
        secret: this.config.get<string>('shujuInquiryReadJwtSecret') ?? '',
        algorithms: ['HS256'],
        issuer: 'shuju-engine',
        audience: this.config.get<string>('shujuInquiryReadAudience') ?? '',
        maxAge: '5m',
      });
      if (
        payload.sub !== subject ||
        payload.scope !== 'inquiries:read' ||
        Object.prototype.hasOwnProperty.call(payload, 'role')
      ) {
        throw new Error('Unexpected inquiry service claims');
      }
      request.shujuInquiryService = {
        subject,
        scope: payload.scope,
        jti: typeof payload.jti === 'string' ? payload.jti : '',
      };
      return true;
    } catch {
      this.audit('invalid_token');
      throw new UnauthorizedException('Invalid Shuju inquiry token');
    }
  }

  private audit(outcome: string) {
    this.logger.warn(JSON.stringify({ event: 'shuju_inquiry_auth', outcome }));
  }
}
