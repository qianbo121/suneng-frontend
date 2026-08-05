import { describe, expect, it } from 'vitest';

import { resolveAdminRoute } from '@/app/router/route-resolution';

describe('resolveAdminRoute', () => {
  it('waits for authentication initialization', () => {
    expect(
      resolveAdminRoute({
        pathname: '/news',
        search: '',
        isAuthenticated: false,
        isInitializing: true,
      }),
    ).toEqual({ kind: 'loading' });
  });

  it('allows an unauthenticated user to view login', () => {
    expect(
      resolveAdminRoute({
        pathname: '/login',
        search: '',
        isAuthenticated: false,
        isInitializing: false,
      }),
    ).toEqual({ kind: 'page', page: 'login' });
  });

  it('preserves a protected URL when redirecting to login', () => {
    expect(
      resolveAdminRoute({
        pathname: '/custom-requirements',
        search: '?status=new',
        isAuthenticated: false,
        isInitializing: false,
      }),
    ).toEqual({
      kind: 'redirect',
      to: '/login',
      state: { from: '/custom-requirements?status=new' },
    });
  });

  it('keeps authenticated users out of login', () => {
    expect(
      resolveAdminRoute({
        pathname: '/login',
        search: '',
        isAuthenticated: true,
        isInitializing: false,
      }),
    ).toEqual({ kind: 'redirect', to: '/news' });
  });

  it.each([
    ['/news', 'news'],
    ['/custom-requirements', 'custom-requirements'],
    ['/profile/password', 'change-password'],
  ] as const)('resolves %s to %s', (pathname, page) => {
    expect(
      resolveAdminRoute({
        pathname,
        search: '',
        isAuthenticated: true,
        isInitializing: false,
      }),
    ).toEqual({ kind: 'page', page });
  });

  it('redirects unknown authenticated routes to news', () => {
    expect(
      resolveAdminRoute({
        pathname: '/unknown',
        search: '',
        isAuthenticated: true,
        isInitializing: false,
      }),
    ).toEqual({ kind: 'redirect', to: '/news' });
  });
});
