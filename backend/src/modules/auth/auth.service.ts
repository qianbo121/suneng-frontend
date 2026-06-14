import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminUser } from '@prisma/client';
import { compare, hash } from 'bcryptjs';

import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { PrismaService } from '@/prisma/prisma.service';

type LoginAttemptState = {
  count: number;
  lockedUntil?: number;
};

@Injectable()
export class AuthService {
  private readonly attempts = new Map<string, LoginAttemptState>();
  private readonly maxAttempts: number;
  private readonly lockMinutes: number;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.maxAttempts = configService.get<number>('adminLoginMaxAttempts') ?? 5;
    this.lockMinutes = configService.get<number>('adminLoginLockMinutes') ?? 15;
  }

  async login(loginDto: LoginDto, clientIp?: string) {
    const username = loginDto.username.trim();
    // Lock on (client IP + username), not username alone: otherwise an attacker
    // can lock a victim out of their own account by failing logins from another
    // IP (account-lockout DoS). trust-proxy=1 makes request.ip the real client.
    const lockKey = `${clientIp ?? 'unknown'}:${username}`;
    this.ensureNotLocked(lockKey);

    const user = await this.prismaService.adminUser.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      this.markFailure(lockKey);
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      this.markFailure(lockKey);
      throw new UnauthorizedException('Invalid username or password');
    }

    this.attempts.delete(lockKey);

    return {
      token: await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
        role: user.role,
      }),
      user: this.toSafeUser(user),
    };
  }

  async getProfile(userId: number) {
    const user = await this.prismaService.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toSafeUser(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prismaService.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await compare(dto.currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.prismaService.adminUser.update({
      where: { id: userId },
      data: {
        passwordHash: await hash(dto.newPassword, 10),
      },
    });

    return {
      success: true,
    };
  }

  private ensureNotLocked(key: string) {
    const current = this.attempts.get(key);

    if (current?.lockedUntil && current.lockedUntil > Date.now()) {
      throw new HttpException(
        'Too many failed login attempts, please retry later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (current?.lockedUntil && current.lockedUntil <= Date.now()) {
      this.attempts.delete(key);
    }
  }

  private markFailure(key: string) {
    const current = this.attempts.get(key) ?? { count: 0 };
    current.count += 1;

    if (current.count >= this.maxAttempts) {
      current.lockedUntil = Date.now() + this.lockMinutes * 60 * 1000;
      current.count = 0;
    }

    this.attempts.set(key, current);
  }

  private toSafeUser(user: AdminUser): AuthenticatedUser {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
