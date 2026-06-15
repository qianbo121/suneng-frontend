import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AdminUser } from '@prisma/client';
import { Strategy } from 'passport-jwt';

import { getJwtFromRequest } from '@/modules/auth/auth.cookies';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: getJwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwtSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prismaService.adminUser.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is disabled or missing');
    }

    return this.toSafeUser(user);
  }

  private toSafeUser(user: AdminUser) {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
