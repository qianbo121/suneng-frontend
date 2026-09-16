import { describe, expect, it } from 'vitest';

import {
  filterCanonicalNewsItems,
  getCanonicalNewsSlug,
  getPublicNewsRedirectSlug,
  hasPublishableEnglishNews,
} from '@/lib/news-routing';
import type { NewsApiItem } from '@/types/news';

const base: NewsApiItem = {
  id: 1,
  categoryId: 1,
  titleZh: '中文标题',
  publishDate: '2026-06-01T00:00:00.000Z',
  slug: 'sample',
};

describe('news route integrity', () => {
  it('requires both an English title and substantive English body', () => {
    expect(hasPublishableEnglishNews({ ...base, titleEn: 'English title', contentEn: '<p>English body</p>' })).toBe(true);
    expect(hasPublishableEnglishNews({ ...base, titleEn: 'English title', contentEn: '' })).toBe(false);
    expect(hasPublishableEnglishNews({ ...base, titleEn: null, contentEn: '<p>Body</p>' })).toBe(false);
  });

  it('resolves the withdrawn duplicate as itself while preserving list exclusions', () => {
    const duplicate = 'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1';
    const canonical = 'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong';

    expect(getCanonicalNewsSlug(duplicate)).toBe(duplicate);
    expect(getCanonicalNewsSlug(canonical)).toBe(canonical);
    expect(filterCanonicalNewsItems([{ ...base, slug: canonical }, { ...base, id: 2, slug: duplicate }])).toHaveLength(1);
  });

  it('redirects numeric lookup aliases to the existing public slug in one step', () => {
    const slug = 'tai-che-lu-lu-men-lou-re';
    expect(getPublicNewsRedirectSlug('80', { slug })).toBe(slug);
    expect(getPublicNewsRedirectSlug(slug, { slug })).toBeNull();
  });
});
