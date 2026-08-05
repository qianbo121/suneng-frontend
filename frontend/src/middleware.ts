import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { isLocalizedPublicPath, PUBLIC_PAGE_CACHE_CONTROL, routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);
const DUPLICATE_NEWS_PATH =
  '/zh/news/jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1';
const CANONICAL_NEWS_PATH =
  '/zh/news/jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong';

function permanentRedirect(request: NextRequest, pathname: string) {
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  target.search = '';
  return NextResponse.redirect(target, 308);
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocalePrefix = routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  // These are fixed route-governance outcomes, so return real HTTP redirects
  // before Next renders a static shell. A page-level notFound/redirect can be
  // encoded in the React stream while the outer response remains 200.
  if (pathname === '/en/news' || pathname.startsWith('/en/news/')) {
    return permanentRedirect(request, '/en');
  }
  if (pathname === '/en/partner') {
    return permanentRedirect(request, '/en/about');
  }
  if (pathname === '/zh/strength') {
    return permanentRedirect(request, '/zh/strength/honors');
  }
  if (pathname === '/zh/strength/certificates') {
    const response = permanentRedirect(request, '/zh/strength/honors');
    response.headers.set('Location', `${response.headers.get('Location')}#management-systems`);
    return response;
  }
  if (pathname === DUPLICATE_NEWS_PATH) {
    return permanentRedirect(request, CANONICAL_NEWS_PATH);
  }

  // Keep every public URL deterministic for crawlers. Locale negotiation on
  // unprefixed paths produced temporary 307 redirects and exposed different
  // targets depending on Accept-Language. English remains available only at
  // its explicit /en URL.
  if (pathname !== '/' && !hasLocalePrefix) {
    return permanentRedirect(request, `/zh${pathname}`);
  }

  const response = intlMiddleware(request);

  if (isLocalizedPublicPath(request.nextUrl.pathname, request.method)) {
    response.headers.set('Cache-Control', PUBLIC_PAGE_CACHE_CONTROL);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
