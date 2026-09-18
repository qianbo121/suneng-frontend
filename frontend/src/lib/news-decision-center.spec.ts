import { describe, expect, it } from 'vitest';
import type { NewsListCardItem } from '@/types/news';
import {
  buildNewsDecisionHref,
  filterAndSortNewsDecisionItems,
  getNewsFurnaceFilters,
  isFeaturedNewsPage,
} from './news-decision-center';
import { applyNewsListCopy, cleanNewsListSummary } from './news-list-copy';

function article(
  id: number,
  viewCount?: number,
  updatedAt = '2026-08-30',
  title = '台车炉报价参数',
): NewsListCardItem {
  return {
    id,
    slug: `article-${id}`,
    image: '/cover.webp',
    title: { zh: title, en: title },
    summary: { zh: '采购核对', en: '' },
    date: '2026-07-01',
    updatedAt,
    viewCount,
    category: { zh: '技术资料', en: '' },
  };
}

describe('resource center sorting contract', () => {
  it('sorts the whole matching set before pagination, never pins a quote article', () => {
    const items = Array.from({ length: 110 }, (_, i) => article(i + 1, i));
    items[0] = article(1, 2, '2026-09-08', '热处理生产线备件和售后怎么约定？');
    items[109] = article(110, 109, '2026-06-01', '技术交流活动');
    // The default order is newest first, so the most recently updated article
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
  it('breaks equal views by true modification date then stable id, independent of input order', () => {
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
  it('uses update/publication dates for recently updated without inventing dates', () => {
    const items = [
      article(1, 999, '2026-07-10'),
      { ...article(2, 0, ''), date: '2026-09-01' },
      article(3, 2, '2026-08-01'),
    ];
    expect(filterAndSortNewsDecisionItems(items, { sort: 'updated' }).map((a) => a.id)).toEqual([
      2, 3, 1,
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
