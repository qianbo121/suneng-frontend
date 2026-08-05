import { describe, expect, it } from 'vitest';

import {
  filterCanonicalNewsItems,
  getCanonicalNewsSlug,
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

  it('maps and filters the known duplicate source slug', () => {
    const duplicate = 'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1';
    const canonical = 'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong';

    expect(getCanonicalNewsSlug(duplicate)).toBe(canonical);
    expect(filterCanonicalNewsItems([{ ...base, slug: canonical }, { ...base, id: 2, slug: duplicate }])).toHaveLength(1);
  });
});
