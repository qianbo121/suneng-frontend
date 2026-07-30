import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/news', () => ({
  getNewsList: vi.fn(async () => ({
    data: { items: [] },
    error: null,
  })),
}));

import buildSitemap from '@/app/sitemap';
import {
  CONTINUOUS_HEAT_TREATMENT_LINE_SEO,
  FURNACE_RENOVATION_OVERHAUL_SEO,
  INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO,
} from '@/lib/seo/page-data';

const DEEP_CRAWL_TARGETS = [
  '/zh/articles/gongye-lu-baojia-canshu',
  '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
  '/zh/case/anonymous-tsingshan-1250-renovation',
  '/zh/case/henan-annealing-solution-line',
  '/zh/case/jining-support-roller-heat-treatment-line',
  '/zh/products/detail/annealing-solution-line',
  '/zh/products/detail/bell-furnace',
  '/zh/products/detail/box-furnace',
  '/zh/products/detail/copper-wire-annealing-line',
  '/zh/products/detail/mesh-belt-furnace',
  '/zh/products/detail/pit-furnace',
  '/zh/products/detail/pusher-furnace',
  '/zh/products/detail/roller-hearth-furnace',
  '/zh/products/detail/roller-mesh-belt-line',
  '/zh/products/detail/rotary-hearth-furnace',
  '/zh/products/detail/trolley-furnace',
  '/zh/service/furnace-renovation-overhaul',
  '/zh/solutions/continuous-heat-treatment-line',
  '/zh/solutions/jiangsu-gongye-lu-changjia',
  '/zh/solutions/rechuli-lu-changjia',
];

describe('sitemap freshness signals', () => {
  it('only emits lastModified when a real content date is available', async () => {
    const entries = await buildSitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

    expect(byUrl.get('https://www.jssngyl.cn/zh')?.lastModified).toBeUndefined();
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/service/furnace-renovation-overhaul')?.lastModified,
    ).toEqual(new Date(FURNACE_RENOVATION_OVERHAUL_SEO.modifiedTime));
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/articles/gongye-lu-baojia-canshu')?.lastModified,
    ).toEqual(new Date(INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime));
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/solutions/continuous-heat-treatment-line')?.lastModified,
    ).toEqual(new Date(CONTINUOUS_HEAT_TREATMENT_LINE_SEO.modifiedTime));
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/products/detail/trolley-furnace')?.lastModified,
    ).toEqual(new Date('2026-07-30'));
  });

  it('keeps all 20 deep-crawl targets in the sitemap', async () => {
    const entries = await buildSitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    expect(DEEP_CRAWL_TARGETS).toHaveLength(20);
    for (const path of DEEP_CRAWL_TARGETS) {
      expect(urls.has(`https://www.jssngyl.cn${path}`), path).toBe(true);
    }
  });
});
