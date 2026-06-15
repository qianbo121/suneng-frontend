import type { CookieOptions, Request } from 'express';
import { ExtractJwt } from 'passport-jwt';

export const ADMIN_SESSION_COOKIE = 'admin_session';

const ADMIN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const bearerTokenExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

export function readCookie(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null;

  const prefix = `${name}=`;
  const entry = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!entry) return null;

  return decodeURIComponent(entry.slice(prefix.length));
}

export function getJwtFromRequest(request?: Request) {
  const cookieToken = readCookie(request?.headers.cookie, ADMIN_SESSION_COOKIE);

  return cookieToken ?? bearerTokenExtractor(request);
}

export function adminSessionCookieOptions(nodeEnv: string | undefined): CookieOptions {
  return {
    httpOnly: true,
    secure: nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api/admin',
    maxAge: ADMIN_SESSION_MAX_AGE_MS,
  };
}

export function expiredAdminSessionCookieOptions(nodeEnv: string | undefined): CookieOptions {
  return {
    ...adminSessionCookieOptions(nodeEnv),
    maxAge: 0,
  };
}
