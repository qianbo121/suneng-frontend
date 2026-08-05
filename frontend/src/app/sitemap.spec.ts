import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/news', () => ({
  getNewsList: vi.fn(async () => ({
    data: {
      items: [
        {
          id: 1,
          categoryId: 1,
          titleZh: '标准新闻',
          slug: 'canonical-news',
          publishDate: '2026-06-01T00:00:00.000Z',
          contentUpdatedAt: '2026-07-01T00:00:00.000Z',
          status: 'published',
          isPublished: true,
        },
        {
          id: 2,
          categoryId: 1,
          titleZh: '重复新闻',
          slug: 'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1',
          publishDate: '2026-06-02T00:00:00.000Z',
          status: 'published',
          isPublished: true,
        },
      ],
    },
    error: null,
  })),
}));

import buildSitemap from '@/app/sitemap';
import {
  ABOUT_SEO,
  CONTINUOUS_HEAT_TREATMENT_LINE_SEO,
  FURNACE_CONTROL_SYSTEM_UPGRADE_SEO,
  FURNACE_ENERGY_CONVERSION_HEAT_RECOVERY_SEO,
  FURNACE_LINING_RENOVATION_GUIDE_SEO,
  FURNACE_RESTART_RELOCATION_REMANUFACTURING_SEO,
  FURNACE_RENOVATION_RISK_CYCLE_GUIDE_SEO,
  FURNACE_RENOVATION_OVERHAUL_SEO,
  INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO,
  PRODUCT_DETAIL_SEO,
  TEMPERATURE_UNIFORMITY_REMEDIATION_SEO,
} from '@/lib/seo/page-data';

const DEEP_CRAWL_TARGETS = [
  '/zh/articles/gongye-lu-baojia-canshu',
  '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
  '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi',
  '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou',
  '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji',
  '/zh/solutions/rechuli-lu-luchen-fanxin',
  '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan',
  '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai',
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

    expect(byUrl.get('https://www.jssngyl.cn/zh')?.lastModified).toEqual(new Date('2026-07-30'));
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
    ).toEqual(new Date(PRODUCT_DETAIL_SEO['trolley-furnace'].modifiedTime!));
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/solutions/rechuli-lu-wendu-bujun-zhenggai')
        ?.lastModified,
    ).toEqual(new Date(TEMPERATURE_UNIFORMITY_REMEDIATION_SEO.modifiedTime));
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi')
        ?.lastModified,
    ).toEqual(new Date(FURNACE_RENOVATION_RISK_CYCLE_GUIDE_SEO.modifiedTime));
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/solutions/rechuli-lu-luchen-fanxin')?.lastModified,
    ).toEqual(new Date(FURNACE_LINING_RENOVATION_GUIDE_SEO.modifiedTime));
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou')
        ?.lastModified,
    ).toEqual(new Date(FURNACE_ENERGY_CONVERSION_HEAT_RECOVERY_SEO.modifiedTime));
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/solutions/rechuli-lu-kongzhi-xitong-shengji')
        ?.lastModified,
    ).toEqual(new Date(FURNACE_CONTROL_SYSTEM_UPGRADE_SEO.modifiedTime));
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan')
        ?.lastModified,
    ).toEqual(new Date(FURNACE_RESTART_RELOCATION_REMANUFACTURING_SEO.modifiedTime));
    expect(byUrl.get('https://www.jssngyl.cn/zh/about')?.lastModified).toEqual(
      new Date(ABOUT_SEO.modifiedTime),
    );
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/products/detail/box-furnace')?.lastModified,
    ).toBeUndefined();

    const july30Urls = entries
      .filter(
        (entry) =>
          entry.lastModified &&
          new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(entry.lastModified)) === '2026-07-30',
      )
      .map((entry) => entry.url);
    expect(july30Urls).toEqual([
      'https://www.jssngyl.cn/zh',
      'https://www.jssngyl.cn/zh/about',
      'https://www.jssngyl.cn/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
    ]);
  });

  it('fails when one shared hard-coded date covers 3 or more pages', async () => {
    const entries = await buildSitemap();
    const pageSpecificUrls = new Set([
      'https://www.jssngyl.cn/zh',
      'https://www.jssngyl.cn/zh/articles/gongye-lu-baojia-canshu',
      'https://www.jssngyl.cn/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
      'https://www.jssngyl.cn/zh/solutions/continuous-heat-treatment-line',
      'https://www.jssngyl.cn/zh/case/anonymous-tsingshan-1250-renovation',
      'https://www.jssngyl.cn/zh/case/jining-support-roller-heat-treatment-line',
      'https://www.jssngyl.cn/zh/case/henan-annealing-solution-line',
      'https://www.jssngyl.cn/zh/products/detail/trolley-furnace',
    ]);
    const sharedDates = new Map<string, string[]>();

    for (const entry of entries) {
      if (
        !entry.lastModified ||
        pageSpecificUrls.has(entry.url) ||
        entry.url.includes('/zh/news/')
      ) {
        continue;
      }

      const timestamp = new Date(entry.lastModified).toISOString();
      sharedDates.set(timestamp, [...(sharedDates.get(timestamp) ?? []), entry.url]);
    }

    const regressions = [...sharedDates.entries()].filter(([, urls]) => urls.length >= 3);
    expect(regressions).toEqual([]);
  });

  it('keeps all authority and deep-crawl targets in the sitemap', async () => {
    const entries = await buildSitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    expect(DEEP_CRAWL_TARGETS).toHaveLength(26);
    for (const path of DEEP_CRAWL_TARGETS) {
      expect(urls.has(`https://www.jssngyl.cn${path}`), path).toBe(true);
    }
  });

  it('removes leaked English and empty strength routes plus the duplicate news slug', async () => {
    const entries = await buildSitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

    expect(byUrl.has('https://www.jssngyl.cn/en/news')).toBe(false);
    expect(byUrl.has('https://www.jssngyl.cn/zh/strength')).toBe(false);
    expect(byUrl.has('https://www.jssngyl.cn/zh/strength/certificates')).toBe(false);
    expect(
      byUrl.has(
        'https://www.jssngyl.cn/zh/news/jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1',
      ),
    ).toBe(false);
    expect(byUrl.get('https://www.jssngyl.cn/zh/news/canonical-news')?.lastModified).toEqual(
      new Date('2026-07-01T00:00:00.000Z'),
    );
  });
});
