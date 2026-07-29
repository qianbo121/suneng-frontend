import { describe, expect, it } from 'vitest';

import { isLocalizedPublicPath, PUBLIC_PAGE_CACHE_CONTROL, routing } from '@/i18n/routing';

describe('localized routing headers and cookies', () => {
  it('keeps locale-prefixed public pages cookie-free and uses HTML alternates', () => {
    expect(routing.localePrefix).toBe('always');
    expect(routing.localeCookie).toBe(false);
    expect(routing.alternateLinks).toBe(false);
  });

  it('only shares cacheable localized GET and HEAD pages', () => {
    expect(PUBLIC_PAGE_CACHE_CONTROL).toBe(
      'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    );
    expect(isLocalizedPublicPath('/zh/products', 'GET')).toBe(true);
    expect(isLocalizedPublicPath('/en', 'HEAD')).toBe(true);
    expect(isLocalizedPublicPath('/', 'GET')).toBe(false);
    expect(isLocalizedPublicPath('/zh/contact', 'POST')).toBe(false);
  });
});
