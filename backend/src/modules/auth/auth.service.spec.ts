import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from '@/modules/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';

function makeService(): AuthService {
  const prisma = {
    adminUser: { findUnique: jest.fn().mockResolvedValue(null) },
  } as unknown as PrismaService;
  const jwt = { signAsync: jest.fn().mockResolvedValue('token') } as unknown as JwtService;
  const config = {
    get: (key: string) =>
      key === 'adminLoginMaxAttempts' ? 2 : key === 'adminLoginLockMinutes' ? 15 : undefined,
  } as unknown as ConfigService;
  return new AuthService(prisma, jwt, config);
}

async function statusOf(promise: Promise<unknown>): Promise<number> {
  try {
    await promise;
    return 0;
  } catch (error) {
    return error instanceof HttpException ? error.getStatus() : -1;
  }
}

describe('AuthService login lockout', () => {
  it('locks a username only for the offending IP (no cross-IP account-lockout DoS)', async () => {
    const service = makeService();
    const cred = { username: 'admin', password: 'wrong' };

    // Two failures from the same IP reach maxAttempts (2) and lock (IP, user).
    expect(await statusOf(service.login(cred, '1.1.1.1'))).toBe(HttpStatus.UNAUTHORIZED);
    expect(await statusOf(service.login(cred, '1.1.1.1'))).toBe(HttpStatus.UNAUTHORIZED);
    // A third attempt from that IP is now locked out.
    expect(await statusOf(service.login(cred, '1.1.1.1'))).toBe(HttpStatus.TOO_MANY_REQUESTS);
    // The same username from a DIFFERENT IP is NOT locked — this is the
    // account-lockout DoS the (IP + username) key closes.
    expect(await statusOf(service.login(cred, '2.2.2.2'))).toBe(HttpStatus.UNAUTHORIZED);
  });
});
