import { describe, expect, it } from 'vitest';

import { isLocalizedPublicPath, PUBLIC_PAGE_CACHE_CONTROL, routing } from '@/i18n/routing';

describe('localized routing headers and cookies', () => {
  it('keeps locale-prefixed public pages cookie-free and uses HTML alternates', () => {
    expect(routing.localePrefix).toBe('always');
    expect(routing.localeCookie).toBe(false);
    expect(routing.alternateLinks).toBe(false);
  });

  it('prevents shared caches from retaining release-specific HTML', () => {
    expect(PUBLIC_PAGE_CACHE_CONTROL).toBe(
      'private, no-store, max-age=0',
    );
    expect(isLocalizedPublicPath('/zh/products', 'GET')).toBe(true);
    expect(isLocalizedPublicPath('/en', 'HEAD')).toBe(true);
    expect(isLocalizedPublicPath('/', 'GET')).toBe(false);
    expect(isLocalizedPublicPath('/zh/contact', 'POST')).toBe(false);
  });
});
