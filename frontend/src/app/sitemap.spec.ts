import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/news', () => ({
  getNewsList: vi.fn(async () => ({
    data: { items: [] },
    error: null,
  })),
}));

import buildSitemap from '@/app/sitemap';
import { INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO } from '@/lib/seo/page-data';

describe('sitemap freshness signals', () => {
  it('only emits lastModified when a real content date is available', async () => {
    const entries = await buildSitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

    expect(byUrl.get('https://www.jssngyl.cn/zh')?.lastModified).toBeUndefined();
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/products/detail/trolley-furnace')?.lastModified,
    ).toBeUndefined();
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/service/furnace-renovation-overhaul')?.lastModified,
    ).toBeUndefined();
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/articles/gongye-lu-baojia-canshu')?.lastModified,
    ).toEqual(new Date(INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime));
  });
});
