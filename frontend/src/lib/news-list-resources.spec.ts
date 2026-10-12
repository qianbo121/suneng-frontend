import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { NewsListCards } from '@/components/news/NewsListCards';
import { NewsListRoute } from '@/components/news/NewsListRoute';
import { filterAndSortNewsDecisionItems } from '@/lib/news-decision-center';
import { getNewsListView, parseNewsListState, toNewsListLiteCards } from '@/lib/news-list-client';
import type { NewsListCardItem } from '@/types/news';
import {
  getNewsListCardHref,
  includeStandaloneNewsResources,
  PROCUREMENT_RESOURCE_HREF,
  PROCUREMENT_RESOURCE_SLUG,
} from './news-list-resources';

vi.mock('@/components/news/NewsDecisionCenter', () => ({ NewsDecisionCenter: () => null }));

const news = Array.from({ length: 11 }, (_, index): NewsListCardItem => ({
  id: index + 1,
  slug: `regular-${index + 1}`,
  image: '/images/home/suneng-factory-hero-1600.webp',
  title: { zh: `工业炉采购资料${index + 1}`, en: `Resource ${index + 1}` },
  summary: { zh: '正常资料摘要。', en: 'Resource summary.' },
  date: '2026-09-01',
  viewCount: 100 - index,
  category: { zh: '报价采购', en: 'Purchasing' },
}));

describe('standalone procurement resource in the normal news list', () => {
  it('adds one Chinese card without altering existing articles or fabricating dates and views', () => {
    const cards = includeStandaloneNewsResources(news, 'zh');
    const resource = cards.at(-1)!;
    expect(news).toHaveLength(11);
    expect(cards).toHaveLength(12);
    expect(includeStandaloneNewsResources(cards, 'zh')).toHaveLength(12);
    expect(includeStandaloneNewsResources(news, 'en')).toBe(news);
    expect(resource.date).toBe('');
    expect(resource.updatedAt).toBeUndefined();
    expect(resource.viewCount).toBeUndefined();
    expect(getNewsListCardHref(resource, 'zh')).toBe(PROCUREMENT_RESOURCE_HREF);
    expect(getNewsListCardHref(news[0], 'en')).toBe('/en/news/regular-1');
  });

  it('is searchable and included in purchasing, without falsely assigning a specific furnace structure', () => {
    const cards = includeStandaloneNewsResources(news, 'zh');
    for (const filters of [{ query: '采购评估' }, { query: '球化', topic: 'procurement' }]) {
      expect(filterAndSortNewsDecisionItems(cards, filters).map((item) => item.slug))
        .toEqual([PROCUREMENT_RESOURCE_SLUG]);
    }
    expect(filterAndSortNewsDecisionItems(cards, { topic: 'selection', query: '采购评估' }))
      .toHaveLength(0);
    expect(filterAndSortNewsDecisionItems(cards, { furnace: 'trolley', query: '采购评估' }))
      .toHaveLength(0);
  });

  it('keeps ten cards per page and retains every displaced article on later pages', () => {
    const cards = includeStandaloneNewsResources(news, 'zh');
    const first = getNewsListView(cards, parseNewsListState('sort=recommended'), 10);
    const second = getNewsListView(cards, parseNewsListState('sort=recommended&page=2'), 10);
    expect(first.total).toBe(12);
    expect(first.items[0]).toBe(news[0]);
    expect(first.items[1].slug).toBe(PROCUREMENT_RESOURCE_SLUG);
    expect(first.items).toHaveLength(10);
    expect(second.items).toHaveLength(2);
    expect(new Set([...first.items, ...second.items].map((item) => item.id)).size).toBe(12);
    expect(filterAndSortNewsDecisionItems(cards, { sort: 'updated' }).at(-1)?.slug)
      .toBe(PROCUREMENT_RESOURCE_SLUG);
  });

  it('keeps the original article address and ordering when client filters replace the list', () => {
    const cards = includeStandaloneNewsResources(news, 'zh');
    const lite = toNewsListLiteCards(cards, 'zh');
    for (const query of ['', 'topic=procurement', 'sort=updated', 'page=2']) {
      const state = parseNewsListState(query);
      const before = getNewsListView(cards, state, 10);
      const after = getNewsListView(lite, state, 10);
      expect(after.items.map((item) => getNewsListCardHref(item, 'zh')))
        .toEqual(before.items.map((item) => getNewsListCardHref(item, 'zh')));
    }
  });

  it('renders a real link with the ordinary style, no recommendation badge and no invented date', () => {
    const resource = includeStandaloneNewsResources([], 'zh')[0];
    const html = renderToStaticMarkup(createElement(NewsListCards, {
      locale: 'zh', items: [resource],
    }));
    expect(html).toContain(`href="${PROCUREMENT_RESOURCE_HREF}"`);
    expect(html).toContain('data-featured="false"');
    expect(html).toContain('报价采购');
    expect(html).not.toContain('推荐阅读');
    expect(html).not.toContain('<time');
    expect(html).not.toContain(`/zh/news/${PROCUREMENT_RESOURCE_SLUG}`);
  });

  it('uses the original article address in the machine-readable list as well as the card', () => {
    const html = renderToStaticMarkup(createElement(NewsListRoute, {
      locale: 'zh',
      sourceItems: includeStandaloneNewsResources(news, 'zh'),
      error: null, page: 1, query: '', topic: 'all', furnace: 'all', sort: 'recommended',
    }));
    expect(html).toContain(`https://www.jssngyl.cn${PROCUREMENT_RESOURCE_HREF}`);
    expect(html).not.toContain(`/zh/news/${PROCUREMENT_RESOURCE_SLUG}`);
  });
});
