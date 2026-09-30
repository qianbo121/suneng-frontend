import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localePrefix: 'always',
  // Locale-prefixed URLs are authoritative, so no preference cookie is needed.
  // Keeping public pages cookie-free also lets shared caches reuse responses.
  localeCookie: false,
  // Every indexable page emits explicit HTML alternates. Disable the middleware
  // Link header so crawlers receive one consistent hreflang/x-default set.
  alternateLinks: false,
});

// HTML refers to release-specific chunks. Never let an edge serve yesterday's
// document after those chunks have been replaced; static assets keep their own
// immutable cache policy. Existing edge copies must also be purged at release.
export const PUBLIC_PAGE_CACHE_CONTROL = 'private, no-store, max-age=0';

export function isLocalizedPublicPath(pathname: string, method: string) {
  if (method !== 'GET' && method !== 'HEAD') return false;

  return routing.locales.some((locale) => {
    const prefix = `/${locale}`;
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export type AppLocale = (typeof routing.locales)[number];
