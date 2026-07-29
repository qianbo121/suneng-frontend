import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

import { isLocalizedPublicPath, PUBLIC_PAGE_CACHE_CONTROL, routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  if (isLocalizedPublicPath(request.nextUrl.pathname, request.method)) {
    response.headers.set('Cache-Control', PUBLIC_PAGE_CACHE_CONTROL);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
