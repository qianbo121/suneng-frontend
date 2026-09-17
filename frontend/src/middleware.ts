import { isWithdrawnRequestPath, withdrawnPageLocale } from '@/lib/publication-scope';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { FALLBACK_NEWS_SLUGS } from '@/constants/news-fallback-slugs';
import { isLocalizedPublicPath, PUBLIC_PAGE_CACHE_CONTROL, routing } from '@/i18n/routing';
import { getNewsRouteAvailability, getZhNewsSlug, newsNotFoundHtml } from '@/lib/news-route-guard';

const intlMiddleware = createMiddleware(routing);

function permanentRedirect(request: NextRequest, pathname: string) {
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  target.search = '';
  return NextResponse.redirect(target, 308);
}

function withdrawnContentHtml(locale: 'zh' | 'en') {
  const en = locale === 'en';
  const title = en ? 'This page is currently unavailable' : '该资料暂未公开';
  return `<!doctype html><html lang="${en ? 'en' : 'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Suneng</title><style>body{margin:0;font:18px/1.7 system-ui,sans-serif;color:#142d4e;background:#f6f8fb}main{max-width:720px;margin:10vh auto;padding:32px}h1{font-size:32px}a{color:#145ca8;display:inline-block;margin:12px 24px 12px 0;padding:8px 0}a:focus-visible{outline:2px solid;outline-offset:4px}</style></head><body><main><h1>${title}</h1><p>${en ? 'You can browse our news, equipment or contact our team.' : '您可以继续查看新闻、设备产品，或联系我们。'}</p><a href="/${locale}/news">${en ? 'Browse news' : '查看新闻'}</a><a href="/${locale}/products">${en ? 'Browse products' : '查看产品'}</a><a href="/${locale}/contact">${en ? 'Contact us' : '联系我们'}</a></main></body></html>`;
}

function withdrawnResponse(pathname: string) {
  return new NextResponse(withdrawnContentHtml(withdrawnPageLocale(pathname)), {
    status: 404,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isWithdrawnRequestPath(pathname)) return withdrawnResponse(pathname);
  if (pathname === '/') return permanentRedirect(request, '/zh');
  const hasLocalePrefix = routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  // These are fixed route-governance outcomes, so return real HTTP redirects
  // before Next renders a static shell. A page-level notFound/redirect can be
  // encoded in the React stream while the outer response remains 200.
  if (pathname === '/en/partner') {
    return permanentRedirect(request, '/en/about');
  }
  if (pathname === '/zh/strength/technical-team' || pathname === '/en/strength/technical-team') {
    return permanentRedirect(request, pathname.startsWith('/en/') ? '/en/about' : '/zh/about');
  }
  if (pathname === '/zh/strength') {
    return permanentRedirect(request, '/zh/strength/honors');
  }
  if (pathname === '/zh/strength/certificates') {
    const response = permanentRedirect(request, '/zh/strength/honors');
    response.headers.set('Location', `${response.headers.get('Location')}#management-systems`);
    return response;
  }

  const englishNewsDetail = pathname.startsWith('/en/news/');
  const newsSlug = getZhNewsSlug(englishNewsDetail ? pathname.replace('/en/', '/zh/') : pathname);
  if (newsSlug && (englishNewsDetail || !FALLBACK_NEWS_SLUGS.has(newsSlug))) {
    const availability = await getNewsRouteAvailability(
      pathname,
      process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
    );
    if (availability === 'missing') {
      return new NextResponse(newsNotFoundHtml(englishNewsDetail ? 'en' : 'zh'), {
        status: 404,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex',
        },
      });
    }
  }

  // Keep every public URL deterministic for crawlers. Locale negotiation on
  // unprefixed paths produced temporary 307 redirects and exposed different
  // targets depending on Accept-Language. English remains available only at
  // its explicit /en URL.
  if (pathname !== '/' && !hasLocalePrefix) {
    return permanentRedirect(request, `/zh${pathname}`);
  }

  const response = intlMiddleware(request);
  // next-intl normalises the path and may rewrite it; check where the request will actually go.
  const rewrite = response.headers.get('x-middleware-rewrite');
  if (rewrite) {
    let target: string | null = null;
    try {
      target = new URL(rewrite, request.url).pathname;
    } catch {
      target = null;
    }
    if (target === null || isWithdrawnRequestPath(target)) return withdrawnResponse(target ?? pathname);
  }

  if (isLocalizedPublicPath(request.nextUrl.pathname, request.method)) {
    response.headers.set('Cache-Control', newsSlug ? 'no-store' : PUBLIC_PAGE_CACHE_CONTROL);
  }

  return response;
}

export const config = {
  // The first rule skips any path with a dot in it; case addresses are checked regardless.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/:locale(zh|en)/case/:path*'],
};
