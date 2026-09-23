import { isWithdrawnRequestPath, routablePathname, withdrawnPageLocale } from '@/lib/publication-scope';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { FALLBACK_NEWS_SLUGS } from '@/constants/news-fallback-slugs';
import { isLocalizedPublicPath, PUBLIC_PAGE_CACHE_CONTROL, routing } from '@/i18n/routing';
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';
import { CASE_PAGE_SIZE } from '@/lib/cases/types';
import { isZhOnlyPath } from '@/lib/i18n/zh-only';
import { isUnknownProductDetailPath } from '@/lib/products/detail-slugs';
import { isInternalNewsListPath } from '@/lib/news-list-prerender';
import { getNewsRouteAvailability, getZhNewsSlug, newsNotFoundHtml } from '@/lib/news-route-guard';

const intlMiddleware = createMiddleware(routing);
const internationalEntryMiddleware = createMiddleware({ ...routing, defaultLocale: 'en' });

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

// The prerendered list route is only reachable through the next.config rewrite.
function isRefusedPath(pathname: string) {
  return (
    isWithdrawnRequestPath(pathname) ||
    isInternalNewsListPath(pathname) ||
    isInternalNewsListPath(routablePathname(pathname))
  );
}

function withdrawnResponse(pathname: string) {
  return new NextResponse(withdrawnContentHtml(withdrawnPageLocale(pathname)), {
    status: 404,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}

function newsNotFoundResponse(locale: 'zh' | 'en') {
  return new NextResponse(newsNotFoundHtml(locale), {
    status: 404,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}

function caseListNotFoundHtml(locale: 'zh' | 'en') {
  if (locale === 'en')
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page Unavailable | Suneng Industrial Furnace</title></head><body><main><h1>No such page of case studies</h1><p><a href="/en/case">Return to case studies</a></p></main></body></html>';
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>页码不存在｜江苏苏能工业炉有限公司</title></head><body><main><h1>没有这一页项目案例</h1><p><a href="/zh/case">返回项目案例</a></p></main></body></html>';
}

function caseListNotFoundResponse(locale: 'zh' | 'en') {
  return new NextResponse(caseListNotFoundHtml(locale), {
    status: 404,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}

// next.config rewrites the plain resource list regardless of letter case, and
// reads an empty or repeated page value loosely. Keep those spellings a 404,
// as they were before the rewrite existed.
function isMisspelledNewsList(pathname: string, searchParams: URLSearchParams) {
  if (!/^\/(?:zh|en)\/news\/?$/i.test(pathname)) return false;
  if (!/^\/(?:zh|en)\/news\/?$/.test(pathname)) return true;
  const pages = searchParams.getAll('page');
  return pages.length > 1 || (pages.length === 1 && !/^[1-9]\d*$/.test(pages[0]));
}

// Chinese-only pages have no English edition. A page-level notFound() is
// encoded inside the React stream while the outer response stays 200, which a
// crawler reads as a soft 404 even though the body already carries noindex.
// Refuse them here so the status code matches the body. Checked both ways round
// for the same reason isRefusedPath is: the widest reading of the path and the
// literal one Next uses for route parameters.
const EN_PREFIX = /^\/en(?=\/|$)/i;
function isZhOnlyEnglishPath(pathname: string) {
  const routable = routablePathname(pathname);
  if (!EN_PREFIX.test(routable)) return false;
  // isZhOnlyPath strips the locale case-sensitively, so /EN/... would keep its
  // prefix and miss the list.
  const lower = (path: string) => path.replace(EN_PREFIX, '/en');
  return isZhOnlyPath(lower(routable)) || isZhOnlyPath(lower(pathname));
}

// A product detail page with no product behind it: notFound() from the page
// leaves the outer response at 200, the same soft 404 as the Chinese-only
// addresses above. The slug list this reads is kept equal to the catalogue by
// detail-slugs.spec.ts.
function missingProductHtml(locale: 'zh' | 'en') {
  const en = locale === 'en';
  const title = en ? 'This equipment page does not exist' : '该设备页面不存在';
  return `<!doctype html><html lang="${en ? 'en' : 'zh-CN'}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Suneng</title><style>body{margin:0;font:18px/1.7 system-ui,sans-serif;color:#142d4e;background:#f6f8fb}main{max-width:720px;margin:10vh auto;padding:32px}h1{font-size:32px}a{color:#145ca8;display:inline-block;margin:12px 24px 12px 0;padding:8px 0}a:focus-visible{outline:2px solid;outline-offset:4px}</style></head><body><main><h1>${title}</h1><p>${en ? 'Browse our equipment, or tell us the working conditions and we will advise.' : '您可以查看全部设备，或把工况发给我们做初步判断。'}</p><a href="/${locale}/products">${en ? 'Browse products' : '查看设备'}</a><a href="/${locale}/contact">${en ? 'Contact us' : '联系我们'}</a></main></body></html>`;
}

function missingProductResponse(pathname: string) {
  return new NextResponse(missingProductHtml(withdrawnPageLocale(pathname)), {
    status: 404,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}

// The approved case list is short, so an unbounded ?page= would otherwise mint an
// unlimited number of distinct, indexable empty pages. Filters cannot increase the
// total: reject pages past the global limit, including an empty ?q= bypass.
function isMissingCaseListPage(pathname: string, searchParams: URLSearchParams) {
  const match = /^\/(zh|en)\/case\/?$/.exec(pathname);
  if (!match) return false;
  const pages = searchParams.getAll('page');
  if (pages.length === 0) return false;
  if (pages.length > 1 || !/^[1-9]\d*$/.test(pages[0])) return true;
  const approved = match[1] === 'en' ? PUBLIC_ENGLISH_CASE_SLUGS.size : PUBLIC_CASE_SLUGS.size;
  return Number(pages[0]) > Math.max(1, Math.ceil(approved / CASE_PAGE_SIZE));
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isRefusedPath(pathname)) return withdrawnResponse(pathname);
  if (isZhOnlyEnglishPath(pathname)) return withdrawnResponse('/en');
  if (isUnknownProductDetailPath(routablePathname(pathname)) || isUnknownProductDetailPath(pathname)) {
    return missingProductResponse(pathname);
  }
  if (pathname === '/') {
    // Only the language-neutral entry negotiates language. Missing preferences
    // retain the Chinese default; unsupported browser languages fall back to English.
    const response = request.headers.get('accept-language')?.trim()
      ? internationalEntryMiddleware(request)
      : intlMiddleware(request);
    // A visitor-specific redirect must never be reused for another language.
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.append('Vary', 'Accept-Language');
    return response;
  }
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

  if (isMisspelledNewsList(pathname, request.nextUrl.searchParams)) {
    return newsNotFoundResponse(/^\/en\//i.test(pathname) ? 'en' : 'zh');
  }

  if (isMissingCaseListPage(pathname, request.nextUrl.searchParams)) {
    return caseListNotFoundResponse(/^\/en\//i.test(pathname) ? 'en' : 'zh');
  }

  const englishNewsDetail = pathname.startsWith('/en/news/');
  const newsSlug = getZhNewsSlug(englishNewsDetail ? pathname.replace('/en/', '/zh/') : pathname);
  if (newsSlug && (englishNewsDetail || !FALLBACK_NEWS_SLUGS.has(newsSlug))) {
    const availability = await getNewsRouteAvailability(
      pathname,
      process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
    );
    if (availability === 'missing') return newsNotFoundResponse(englishNewsDetail ? 'en' : 'zh');
  }

  // Keep legacy unprefixed content URLs deterministic for crawlers. Only the
  // root negotiates language; explicit /zh and /en URLs remain authoritative.
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
    if (target === null || isRefusedPath(target)) return withdrawnResponse(target ?? pathname);
  }

  if (isLocalizedPublicPath(request.nextUrl.pathname, request.method)) {
    response.headers.set('Cache-Control', newsSlug ? 'no-store' : PUBLIC_PAGE_CACHE_CONTROL);
  }

  return response;
}

export const config = {
  // Asset filenames skip the broad rule; public detail routes must still be
  // checked when a slug contains a dot. Otherwise missing news can be indexed.
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/:locale(zh|en)/case/:path*',
    '/:locale(zh|en)/news/:path*',
    '/:locale(zh|en)/products/detail/:path*',
  ],
};
