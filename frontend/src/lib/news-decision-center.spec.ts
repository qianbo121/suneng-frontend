import { describe, expect, it } from 'vitest';
import type { NewsListCardItem } from '@/types/news';
import {
  buildNewsDecisionHref,
  filterAndSortNewsDecisionItems,
  getNewsDecisionDisplayMeta,
  getNewsFurnaceFilters,
  isFeaturedNewsPage,
} from './news-decision-center';
import { applyNewsListCopy, cleanNewsListSummary } from './news-list-copy';
import { toNewsListLiteCards } from './news-list-client';

function article(
  id: number,
  viewCount?: number,
  date = '2026-08-30',
  title = '台车炉报价参数',
): NewsListCardItem {
  return {
    id,
    slug: `article-${id}`,
    image: '/cover.webp',
    title: { zh: title, en: title },
    summary: { zh: '采购核对', en: '' },
    date,
    updatedAt: '2026-09-28',
    viewCount,
    category: { zh: '技术资料', en: '' },
  };
}

// Original identities and titles from the seven reviewed public articles.
const reviewedFurnaceArticles = [
  [132, 'mesh-belt-quenching-furnace-principle-process-checklist', '网带淬火炉怎么工作？工艺温度和故障处理先看哪些条件', 'mesh-belt'],
  [107, 'cold-coiled-compression-spring-stress-relief-furnace-manufacturers', '我们冷卷压簧要去应力回火，准备买网带回火炉，能推荐几家厂家吗？', 'mesh-belt'],
  [106, 'grade-10-nut-mesh-belt-line-capability', '10级螺母采购网带调质线，怎么判断厂家有没有同类能力？', 'mesh-belt'],
  [105, 'carbon-steel-self-drilling-screw-carburizing-line-selection', '碳钢自钻螺钉做渗碳淬火，选网带线厂家要核对什么？', 'mesh-belt'],
  [100, 'self-tapping-screw-carbonitriding-line-selection', '自攻螺钉碳氮共渗网带线怎么选？先核对层深、心部和连续产量', 'mesh-belt'],
  [99, 'bolt-mesh-belt-quench-temper-capability', '8.8级和10.9级螺栓买网带调质线，怎么判断厂家有没有同类能力？', 'mesh-belt'],
  [115, 'titanium-alloy-thick-plate-roller-hearth-furnace-selection', '钛合金厚板加热炉怎么选？先把板材组合排进辊道炉', 'roller-hearth'],
] as const;

describe('reviewed furnace classification repairs', () => {
  it.each(reviewedFurnaceArticles)('includes reviewed article %i without changing its presentation', (id, slug, title, furnace) => {
    const item = { ...article(id, 1, '2026-09-28', title), slug };
    expect(getNewsFurnaceFilters(item)).toEqual([furnace]);
    expect(getNewsFurnaceFilters({ ...item, listFurnaces: [] })).toEqual([furnace]);
    expect(filterAndSortNewsDecisionItems([item], { furnace })).toEqual([item]);
    expect(getNewsDecisionDisplayMeta(item).furnaceLabel).toBe(
      furnace === 'mesh-belt' ? '网带炉' : '辊底炉',
    );
    expect(item.title.zh).toBe(title);
    expect(item.slug).toBe(slug);
    expect(item.date).toBe('2026-09-28');
  });

  it.each(reviewedFurnaceArticles)('requires article %i identity and original title together', (id, slug, title) => {
    const item = { ...article(id, 1, '2026-09-28', title), slug };
    for (const changed of [
      { ...item, id: 99999 },
      { ...item, slug: `${slug}-other` },
      { ...item, title: { ...item.title, zh: `${title}（已修订）` } },
    ]) {
      expect(getNewsFurnaceFilters(changed)).toEqual([]);
      expect(getNewsFurnaceFilters({ ...changed, listFurnaces: [] })).toEqual([]);
    }
    const retitled = { ...item, title: { ...item.title, zh: '井式炉和台车炉怎么选？' } };
    expect(getNewsFurnaceFilters(retitled)).toEqual(['trolley', 'pit']);
  });

  it.each(reviewedFurnaceArticles)('keeps nonempty editorial classification ahead of repair %i', (id, slug, title) => {
    const item: NewsListCardItem = {
      ...article(id, 1, '2026-09-28', title),
      slug,
      listFurnaces: ['pit', 'box'],
    };
    expect(getNewsFurnaceFilters(item)).toBe(item.listFurnaces);
    expect(getNewsFurnaceFilters(item)).toEqual(['pit', 'box']);
  });

  it.each(reviewedFurnaceArticles)('retains repaired article %i after trimming for client filters', (id, slug, title, furnace) => {
    const item = { ...article(id, 1, '2026-09-28', title), slug, listFurnaces: [] };
    for (const locale of ['zh', 'en'] as const) {
      const [lite] = toNewsListLiteCards([item], locale);
      expect(getNewsFurnaceFilters(lite)).toEqual([furnace]);
      expect(filterAndSortNewsDecisionItems([lite], { furnace })).toEqual([lite]);
      expect(lite.slug).toBe(slug);
      expect(lite.date).toBe(item.date);
    }
  });

  it('keeps the existing cross-furnace article 110 and empty unrelated classifications', () => {
    const comparison = {
      ...article(110, 1, '2026-09-29', '长螺栓调质怕弯，选井式炉还是网带炉？'),
      slug: 'long-bolt-quench-temper-pit-mesh-belt-furnace-selection',
    };
    expect(getNewsFurnaceFilters(comparison)).toEqual(['mesh-belt', 'pit']);
    expect(getNewsDecisionDisplayMeta(comparison).furnaceLabel).toBe('网带炉 / 井式炉');
    const [lite] = toNewsListLiteCards([comparison], 'zh');
    expect(getNewsFurnaceFilters(lite)).toEqual(['mesh-belt', 'pit']);
    expect(getNewsFurnaceFilters({ ...article(99999), listFurnaces: [] })).toEqual([]);
  });
});

describe('resource center sorting contract', () => {
  it('sorts the whole matching set before pagination, never pins a quote article', () => {
    const items = Array.from({ length: 110 }, (_, i) => article(i + 1, i));
    items[0] = article(1, 2, '2026-09-08', '热处理生产线备件和售后怎么约定？');
    items[109] = article(110, 109, '2026-06-01', '技术交流活动');
    // The default order is newest first, so the most recently published article
    // leads even though 109 others have more views.
    expect(
      filterAndSortNewsDecisionItems(items)
        .slice(0, 3)
        .map((a) => a.id),
    ).toEqual([1, 2, 3]);
    expect(filterAndSortNewsDecisionItems(items).at(-1)?.id).toBe(110);
    // "Recommended" still ranks by views across the whole set.
    expect(
      filterAndSortNewsDecisionItems(items, { sort: 'recommended' })
        .slice(0, 6)
        .map((a) => a.id),
    ).toEqual([110, 109, 108, 107, 106, 105]);
    const filtered = filterAndSortNewsDecisionItems(items, {
      sort: 'recommended',
      query: '台车炉',
      furnace: 'trolley',
      topic: 'procurement',
    });
    expect(filtered.slice(0, 6).map((a) => a.id)).toEqual([109, 108, 107, 106, 105, 104]);
    expect(items[0].id).toBe(1);
  });
  it('breaks equal views by publication date then stable id, independent of input order', () => {
    const items = [
      article(4, 12, '2026-08-31'),
      article(3, 12),
      article(2, 12),
      article(1, undefined, '2026-09-08'),
    ];
    expect(filterAndSortNewsDecisionItems(items, { sort: 'recommended' }).map((a) => a.id)).toEqual([4, 2, 3, 1]);
    expect(
      filterAndSortNewsDecisionItems([...items].reverse(), { sort: 'recommended' }).map((a) => a.id),
    ).toEqual([4, 2, 3, 1]);
    expect(
      filterAndSortNewsDecisionItems([article(2, undefined), article(1, 0)]).map((a) => a.id),
    ).toEqual([1, 2]);
  });
  it('ignores recent edits when ordering historical publications and never invents missing dates', () => {
    const items = [
      { ...article(1, 999, '2026-07-10'), updatedAt: '2026-09-28' },
      { ...article(2, 0, ''), date: '2026-09-01' },
      article(3, 2, '2026-08-01'),
      { ...article(4, 0, ''), updatedAt: '2026-09-29' },
      article(5, 0, 'invalid'),
    ];
    expect(filterAndSortNewsDecisionItems(items, { sort: 'updated' }).map((a) => a.id)).toEqual([
      2, 3, 1, 4, 5,
    ]);
  });
  it('only features the unfiltered first page in the default order', () => {
    expect(isFeaturedNewsPage({})).toBe(true);
    expect(isFeaturedNewsPage({ sort: 'updated' })).toBe(true);
    for (const filters of [
      { page: 2 },
      { query: '台车炉' },
      { topic: 'selection' },
      { furnace: 'line' },
      { sort: 'recommended' },
    ])
      expect(isFeaturedNewsPage(filters)).toBe(false);
  });
  it('preserves filter identifiers and ordering in refresh/back URLs while resetting page', () => {
    // 'recommended' is the non-default order, so it has to survive in the URL;
    // the default order is left out to keep the plain list address canonical.
    const filters = { query: ' 报价 ', topic: 'procurement', furnace: 'trolley', sort: 'recommended' };
    const url = new URL(buildNewsDecisionHref('/zh/news', { ...filters, page: 3 }), 'http://local');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      sort: 'recommended',
      q: '报价',
      topic: 'procurement',
      furnace: 'trolley',
      page: '3',
    });
    expect(buildNewsDecisionHref('/zh/news', filters)).not.toContain('page=');
    expect(buildNewsDecisionHref('/zh/news', { sort: 'updated' })).toBe('/zh/news');
  });
  it('does not assign general comparisons to an incidental single furnace in their body', () => {
    const item = {
      ...article(75, 1, '2026-08-28', '连续式热处理线和周期炉怎么选？'),
      searchText: '连续式热处理线和周期炉怎么选？台车炉 井式炉',
    };
    expect(getNewsFurnaceFilters(item)).toEqual(['line']);
    expect(getNewsFurnaceFilters(article(65, 1, '', '长轴调质先比较井式炉和台车炉'))).toEqual([
      'trolley',
      'pit',
    ]);
  });
  it('cleans caption-only summaries without changing bodies or original links', () => {
    expect(cleanNewsListSummary('画面以备件表达交付边界。核对备件和售后责任。')).toBe(
      '核对备件和售后责任。',
    );
    const item = article(9999, 3, '2026-08-28', '未来新文章');
    const mapped = applyNewsListCopy(item);
    expect(mapped.slug).toBe(item.slug);
    expect(mapped.viewCount).toBe(3);
  });
});
