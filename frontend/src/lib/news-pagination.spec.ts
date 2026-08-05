import { describe, expect, it } from 'vitest';

import {
  getNewsListCanonicalPath,
  getNewsListPageTitle,
  normalizeNewsPage,
} from '@/lib/news-pagination';

describe('news pagination SEO', () => {
  it('uses a self-canonical URL and unique title for each paginated list', () => {
    expect(getNewsListCanonicalPath('zh', 1)).toBe('/zh/news');
    expect(getNewsListCanonicalPath('zh', 2)).toBe('/zh/news?page=2');
    expect(getNewsListPageTitle('资料中心', 'zh', 3)).toBe('资料中心（第 3 页）');
  });

  it('normalizes invalid page values without creating duplicate page-one URLs', () => {
    expect(normalizeNewsPage(undefined)).toBe(1);
    expect(normalizeNewsPage('0')).toBe(1);
    expect(normalizeNewsPage('2.8')).toBe(2);
  });
});
