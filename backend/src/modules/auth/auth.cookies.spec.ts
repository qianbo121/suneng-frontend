import type { Request } from 'express';

import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  getJwtFromRequest,
  readCookie,
} from '@/modules/auth/auth.cookies';

function request(headers: Record<string, string | undefined>): Request {
  return { headers } as unknown as Request;
}

describe('admin auth cookie helpers', () => {
  it('reads the admin session cookie from a cookie header', () => {
    expect(
      readCookie(`foo=1; ${ADMIN_SESSION_COOKIE}=cookie-token; bar=2`, ADMIN_SESSION_COOKIE),
    ).toBe('cookie-token');
  });

  it('prefers HttpOnly cookie token over bearer token during migration', () => {
    expect(
      getJwtFromRequest(
        request({
          cookie: `${ADMIN_SESSION_COOKIE}=cookie-token`,
          authorization: 'Bearer bearer-token',
        }),
      ),
    ).toBe('cookie-token');
  });

  it('falls back to bearer token for compatibility', () => {
    expect(getJwtFromRequest(request({ authorization: 'Bearer bearer-token' }))).toBe(
      'bearer-token',
    );
  });

  it('uses secure cookies in production only', () => {
    expect(adminSessionCookieOptions('development')).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/admin',
    });
    expect(adminSessionCookieOptions('production')).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api/admin',
    });
  });
});
