export type AdminPageId = 'login' | 'news' | 'custom-requirements' | 'change-password';

export type AdminRouteDecision =
  | { kind: 'loading' }
  | { kind: 'page'; page: AdminPageId }
  | { kind: 'redirect'; to: string; state?: { from: string } };

type ResolveAdminRouteInput = {
  pathname: string;
  search: string;
  isAuthenticated: boolean;
  isInitializing: boolean;
};

export function resolveAdminRoute({
  pathname,
  search,
  isAuthenticated,
  isInitializing,
}: ResolveAdminRouteInput): AdminRouteDecision {
  if (isInitializing) {
    return { kind: 'loading' };
  }

  if (!isAuthenticated) {
    if (pathname === '/login') {
      return { kind: 'page', page: 'login' };
    }
    return { kind: 'redirect', to: '/login', state: { from: `${pathname}${search}` } };
  }

  if (pathname === '/login') {
    return { kind: 'redirect', to: '/news' };
  }

  if (pathname === '/news') {
    return { kind: 'page', page: 'news' };
  }
  if (pathname === '/custom-requirements') {
    return { kind: 'page', page: 'custom-requirements' };
  }
  if (pathname === '/profile/password') {
    return { kind: 'page', page: 'change-password' };
  }

  return { kind: 'redirect', to: '/news' };
}
