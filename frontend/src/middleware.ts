import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

import { routing } from '@/i18n/routing';
import { isZhOnlyPath } from '@/lib/i18n/zh-only';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // next-intl emits HTTP hreflang Link headers for every configured locale.
  // Chinese-only pages intentionally have no English counterpart, so remove
  // that header and let the page's explicit HTML alternates remain authoritative.
  if (isZhOnlyPath(request.nextUrl.pathname)) {
    response.headers.delete('link');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
