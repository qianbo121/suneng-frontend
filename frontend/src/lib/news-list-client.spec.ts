import { describe, expect, it } from 'vitest';

import { buildNewsDecisionHref, filterAndSortNewsDecisionItems } from '@/lib/news-decision-center';
import { formatNewsDisplayDate } from '@/lib/news-display-date';
import type { NewsListCardItem } from '@/types/news';

import {
  getNewsListView,
  hasNewsListFilters,
  isSameNewsListState,
  parseNewsListState,
  toNewsListLiteCards,
} from './news-list-client';

function article(id: number, title: string, viewCount: number, updatedAt = '2026-08-30'): NewsListCardItem {
  return {
    id,
    slug: `article-${id}`,
    image: `/cover-${id}.webp`,
    title: { zh: title, en: `EN ${title}` },
    summary: { zh: `${title}的摘要`, en: `Summary ${id}` },
    date: '2026-07-01T08:00:00.000Z',
    updatedAt,
    viewCount,
    category: { zh: '技术资料', en: 'Resources' },
    searchText: `${title} 正文全文很长`,
  };
}

const cards = [
  article(1, '台车炉报价参数怎么准备', 5),
  article(2, '井式炉选型要点', 9),
  article(3, '网带炉验收看哪些指标', 1),
  article(4, '台车炉大修还是换新', 7),
  article(5, '箱式炉选型怎么选', 3),
];

describe('news list browser state', () => {
  it('reads the same state the server derives from the URL', () => {
    // An absent or unreadable sort falls back to the default, newest first.
    expect(parseNewsListState('')).toEqual({ topic: 'all', furnace: 'all', sort: 'updated', page: 1 });
    expect(parseNewsListState('?topic=selection&furnace=pit&sort=recommended&page=3')).toEqual({
      topic: 'selection',
      furnace: 'pit',
      sort: 'recommended',
      page: 3,
    });
    expect(parseNewsListState('topic=unknown&furnace=x&sort=y&page=0')).toEqual({
      topic: 'all',
      furnace: 'all',
      sort: 'updated',
      page: 1,
    });
  });

  it('round-trips through the public list href', () => {
    const state = { topic: 'procurement', furnace: 'trolley', sort: 'recommended', page: 2 } as const;
    const href = buildNewsDecisionHref('/zh/news', state);
    expect(isSameNewsListState(parseNewsListState(href.split('?')[1] ?? ''), state)).toBe(true);
    expect(hasNewsListFilters(state)).toBe(true);
    expect(hasNewsListFilters(parseNewsListState('page=4'))).toBe(false);
  });

  it('matches server filtering, sorting and page clamping', () => {
    const state = parseNewsListState('furnace=trolley&page=9');
    const view = getNewsListView(cards, state, 1);
    const expected = filterAndSortNewsDecisionItems(cards, state);
    expect(view.total).toBe(expected.length);
    expect(view.page).toBe(expected.length);
    expect(view.items.map((item) => item.id)).toEqual([expected[expected.length - 1].id]);
    expect(getNewsListView(cards, parseNewsListState('topic=engineering'), 10).items.map((i) => i.id)).toEqual([3]);
  });
});

describe('lite list cards', () => {
  it('drops search text, bodies and the other language but keeps list behaviour', () => {
    const lite = toNewsListLiteCards(cards, 'zh');
    for (const item of lite) {
      expect(item).not.toHaveProperty('searchText');
      expect(item).not.toHaveProperty('source');
      expect(item.title.en).toBe('');
      expect(item.summary.en).toBe('');
      expect(item.listTopic).toBeDefined();
      expect(item.listFurnaces).toBeDefined();
    }
    for (const state of ['', 'topic=selection', 'furnace=trolley&sort=updated', 'topic=operations']) {
      const parsed = parseNewsListState(state);
      expect(filterAndSortNewsDecisionItems(lite, parsed).map((i) => i.id), state).toEqual(
        filterAndSortNewsDecisionItems(cards, parsed).map((i) => i.id),
      );
    }
  });

  it('keeps English classification even without Chinese text', () => {
    const lite = toNewsListLiteCards(cards, 'en');
    expect(lite[0].title).toEqual({ zh: '', en: 'EN 台车炉报价参数怎么准备' });
    expect(filterAndSortNewsDecisionItems(lite, { furnace: 'trolley' }).map((i) => i.id)).toEqual(
      filterAndSortNewsDecisionItems(cards, { furnace: 'trolley' }).map((i) => i.id),
    );
  });

  it('formats the card date on the server with the existing formatter', () => {
    const [first] = toNewsListLiteCards([article(9, '回火炉温度', 1, '2026-09-15T20:30:00.000Z')], 'zh');
    expect(first.listDisplayDate).toBe(formatNewsDisplayDate('2026-09-15T20:30:00.000Z'));
  });
});
