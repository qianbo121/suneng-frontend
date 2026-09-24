import { describe, expect, it, vi } from 'vitest';
import revisedArticles from '@/lib/news-reviewed-copy.json';

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('server-only', () => ({}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

vi.mock('@/lib/api/news', () => ({
  getAllNewsForDecisionCenter: vi.fn(async () => ({
    data: [
      {
        id: 3,
        categoryId: 1,
        slug: 'translated-news',
        titleZh: '已翻译',
        titleEn: 'Translated news',
        contentEn: '<p>Complete English.</p>',
        publishDate: '2026-06-01T00:00:00Z',
        englishContentUpdatedAt: '2026-09-01T12:00:00Z',
        status: 'published',
        isPublished: true,
      },
      {
        id: 21,
        categoryId: 1,
        titleZh: revisedArticles['21'].titleZh,
        slug: revisedArticles['21'].slug,
        publishDate: '2026-06-01T00:00:00.000Z',
        status: 'published',
        isPublished: true,
      },
      {
        id: 1,
        categoryId: 1,
        titleZh: '标准新闻',
        titleEn: 'Only a title, no English body',
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
    error: null,
  })),
}));

import buildSitemap from '@/app/sitemap';

import { FURNACE_RENOVATION_OVERHAUL_SEO, PRODUCT_DETAIL_SEO } from '@/lib/seo/page-data';
import { APPROVED_GUIDE_PATHS, isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { REVIEWED_PUBLIC_CASES } from '@/lib/cases/public-case-allowlist';

const site = 'https://www.jssngyl.cn';
// Only owner-approved case pages may appear, plus the index of each locale that has one.
const APPROVED_CASE_URLS = [
  ...REVIEWED_PUBLIC_CASES.flatMap((item) => [
    `${site}/zh/case/${item.slug}`,
    ...(item.english ? [`${site}/en/case/${item.slug}`] : []),
  ]),
  ...(REVIEWED_PUBLIC_CASES.length ? [`${site}/zh/case`] : []),
  ...(REVIEWED_PUBLIC_CASES.some((item) => item.english) ? [`${site}/en/case`] : []),
].sort();
const casePathUrls = (urls: string[]) =>
  urls.filter((url) => /^\/(zh|en)\/case(\/|$)/.test(new URL(url).pathname)).sort();

const DEEP_CRAWL_TARGETS = [
  '/zh/articles/gongye-lu-baojia-canshu',
  `/zh/news/${revisedArticles['21'].slug}`,
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
  it('keeps a verified Chinese product date out of the independently maintained English page', async () => {
    const productSeo = PRODUCT_DETAIL_SEO['box-furnace'];
    const previous = productSeo.modifiedTime;
    try {
      productSeo.modifiedTime = '2026-01-02T03:04:05+08:00';
      const entries = new Map((await buildSitemap()).map((entry) => [entry.url, entry]));
      expect(entries.get(`${site}/zh/products/detail/box-furnace`)?.lastModified).toEqual(
        new Date(productSeo.modifiedTime),
      );
      expect(entries.get(`${site}/en/products/detail/box-furnace`)?.lastModified).toBeUndefined();
    } finally {
      if (previous === undefined) delete productSeo.modifiedTime;
      else productSeo.modifiedTime = previous;
    }
  });

  it.each(['not-a-date', '2999-01-01'])('omits invalid or future product and guide dates: %s', async (date) => {
    const productSeo = PRODUCT_DETAIL_SEO['box-furnace'];
    const previousProductDate = productSeo.modifiedTime;
    const previousGuideDate = FURNACE_RENOVATION_OVERHAUL_SEO.modifiedTime;
    try {
      productSeo.modifiedTime = date;
      FURNACE_RENOVATION_OVERHAUL_SEO.modifiedTime = date;
      const entries = new Map((await buildSitemap()).map((entry) => [entry.url, entry]));
      for (const path of ['/zh/products/detail/box-furnace', '/zh/service/furnace-renovation-overhaul']) {
        expect(entries.has(site + path)).toBe(true);
        expect(entries.get(site + path)).not.toHaveProperty('lastModified');
      }
    } finally {
      if (previousProductDate === undefined) delete productSeo.modifiedTime;
      else productSeo.modifiedTime = previousProductDate;
      FURNACE_RENOVATION_OVERHAUL_SEO.modifiedTime = previousGuideDate;
    }
  });

  it('retains real modification dates for live pages and omits withdrawn guides', async () => {
    const entries = await buildSitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));
    for (const path of [
      '/zh',
      '/zh/about',
      '/zh/products/detail/trolley-furnace',
      '/zh/products/detail/box-furnace',
    ]) {
      expect(byUrl.has('https://www.jssngyl.cn' + path)).toBe(true);
      expect(byUrl.get('https://www.jssngyl.cn' + path)?.lastModified).toBeUndefined();
    }
    expect(
      byUrl.get('https://www.jssngyl.cn/zh/service/furnace-renovation-overhaul')?.lastModified,
    ).toEqual(new Date(FURNACE_RENOVATION_OVERHAUL_SEO.modifiedTime));
    expect(
      entries
        .filter((entry) => /\/(articles|solutions)(\/|$)/.test(new URL(entry.url).pathname))
        .map((entry) => new URL(entry.url).pathname)
        .sort(),
    ).toEqual([...APPROVED_GUIDE_PATHS].sort());
    expect(casePathUrls(entries.map((entry) => entry.url))).toEqual(APPROVED_CASE_URLS);
  });

  it('fails when one shared hard-coded date covers 3 or more pages', async () => {
    const entries = await buildSitemap();
    const pageSpecificUrls = new Set([
      ...[...APPROVED_GUIDE_PATHS].map((path) => site + path),
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

  it('keeps live deep-crawl targets while excluding retired technical paths', async () => {
    const urls = new Set((await buildSitemap()).map((x) => x.url));
    expect(DEEP_CRAWL_TARGETS).toHaveLength(26);
    for (const path of DEEP_CRAWL_TARGETS)
      expect(urls.has('https://www.jssngyl.cn' + path), path).toBe(!isWithdrawnTechnicalPath(path));
  });

  it('includes the English news hub while excluding empty strength routes and the duplicate news slug', async () => {
    const entries = await buildSitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

    expect(byUrl.has('https://www.jssngyl.cn/en/news')).toBe(true);
    expect(byUrl.has('https://www.jssngyl.cn/en/news/canonical-news')).toBe(false);
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

it('excludes unapproved guides and unavailable English alternates', async () => {
  const entries = await buildSitemap();
  expect(entries.length).toBeGreaterThan(20);
  for (const entry of entries) {
    expect(isWithdrawnTechnicalPath(entry.url)).toBe(false);
    for (const target of Object.values(entry.alternates?.languages ?? {}))
      expect(isWithdrawnTechnicalPath(String(target))).toBe(false);
  }
});

it('includes all four additional furnaces in both languages with reciprocal addresses', async () => {
  const sitemap = await buildSitemap();
  for (const slug of [
    'shovel-furnace',
    'walking-beam-furnace',
    'elevator-hearth-furnace',
    'gas-nitriding-furnace',
  ]) {
    const zh = sitemap.find((item) => item.url.endsWith(`/zh/products/detail/${slug}`));
    const en = sitemap.find((item) => item.url.endsWith(`/en/products/detail/${slug}`));
    expect(zh, slug).toBeDefined();
    expect(en, slug).toBeDefined();
    expect(zh?.alternates?.languages).toEqual(en?.alternates?.languages);
    expect(zh?.alternates?.languages?.['zh-CN']).toBe(zh?.url);
    expect(en?.alternates?.languages?.['en-US']).toBe(en?.url);
  }
});

it('emits reciprocal English news addresses only for complete translations with the English edit date', async () => {
  const entries = await buildSitemap();
  const en = entries.find((entry) => entry.url.endsWith('/en/news/translated-news'));
  const zh = entries.find((entry) => entry.url.endsWith('/zh/news/translated-news'));
  expect(en).toBeDefined();
  expect(en?.alternates).toEqual(zh?.alternates);
  expect(en?.lastModified).toEqual(new Date('2026-09-01T12:00:00Z'));
  expect(zh?.lastModified).toEqual(new Date('2026-06-01T00:00:00Z'));
});

it('lists only approved cases and guides without pagination or withdrawn alternates', async () => {
  const entries = await buildSitemap();
  expect(entries.some((x) => x.url.endsWith('/en/news'))).toBe(true);
  expect(
    entries
      .filter((x) => /\/articles(\/|\?|$)/.test(x.url))
      .map((x) => new URL(x.url).pathname)
      .sort(),
  ).toEqual([...APPROVED_GUIDE_PATHS].filter((path) => path.includes('/articles/')).sort());
  expect(entries.some((x) => /\/case\?/.test(x.url))).toBe(false);
  expect(casePathUrls(entries.map((x) => x.url))).toEqual(APPROVED_CASE_URLS);
  for (const entry of entries)
    for (const url of Object.values(entry.alternates?.languages ?? {}))
      expect(isWithdrawnTechnicalPath(String(url)), `${entry.url} -> ${url}`).toBe(false);
});

it('includes reciprocal language links for the completed English service pages', async () => {
  const sitemap = await buildSitemap();
  const paths = [
    '/service',
    '/service/furnace-renovation-overhaul',
    '/service/furnace-relocation-restart',
    '/service/installation-after-sales',
    '/service/selection-retrofit-guide',
  ];
  for (const path of paths) {
    const zh = `https://www.jssngyl.cn/zh${path}`;
    const en = `https://www.jssngyl.cn/en${path}`;
    for (const url of [zh, en]) {
      const entries = sitemap.filter((entry) => entry.url === url);
      expect(entries).toHaveLength(1);
      expect(entries[0].alternates?.languages).toEqual({ 'zh-CN': zh, 'en-US': en, 'x-default': zh });
    }
  }
});

it('includes reciprocal language links for the eight completed English production lines', async () => {
  const sitemap = await buildSitemap();
  const slugs = [
    'track-shoe-press-quench-line', 'forging-waste-heat-qt-line',
    'fastener-quench-temper-line', 'mesh-belt-carbonitriding-line',
    'multi-furnace-quench-cell', 'aluminum-solution-aging-line',
    'aluminum-forging-heating-line', 'cylinder-curing-line',
  ];
  for (const slug of slugs) {
    const zh = `https://www.jssngyl.cn/zh/products/detail/${slug}`;
    const en = `https://www.jssngyl.cn/en/products/detail/${slug}`;
    for (const url of [zh, en]) {
      const entries = sitemap.filter((entry) => entry.url === url);
      expect(entries).toHaveLength(1);
      expect(entries[0].alternates?.languages).toEqual({ 'zh-CN': zh, 'en-US': en, 'x-default': zh });
    }
  }
});
