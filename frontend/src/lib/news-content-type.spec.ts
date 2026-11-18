import { describe, expect, it } from 'vitest';
import { buildNewsDecisionHref, filterAndSortNewsDecisionItems } from './news-decision-center';
import { getInfographicCards } from './infographics';
import { normalizeNewsContentFormat } from './news-content-type';
import { includeInfographicNewsResources, includeStandaloneNewsResources } from './news-list-resources';
import {
  getNewsListView,
  hasNewsListFilters,
  isSameNewsListState,
  parseNewsListState,
  toNewsListLiteCards,
} from './news-list-client';

describe('independent infographic resources', () => {
  const cards = includeInfographicNewsResources(includeStandaloneNewsResources([], 'zh'), 'zh');

  it('keeps article and infographic results separate in both server and hydrated lists', () => {
    for (const source of [cards, toNewsListLiteCards(cards, 'zh')]) {
      const graphics = getNewsListView(source, parseNewsListState('format=infographic'), 10);
      const articles = getNewsListView(source, parseNewsListState('format=article'), 10);
      expect(graphics.total).toBe(10);
      expect(graphics.items).toHaveLength(10);
      expect(graphics.items.every((item) => item.contentType === 'infographic')).toBe(true);
      expect(articles.items.every((item) => item.contentType !== 'infographic')).toBe(true);
      expect(graphics.total + articles.total).toBe(cards.length);
      expect(graphics.items[0].href).toBe('/zh/infographics/mesh-belt-500-screws');
      expect(graphics.items[0].date).toBe('');
    }
  });

  it('defaults plain, legacy all and unknown URLs to articles without changing pagination URLs', () => {
    for (const query of ['', 'format=all', 'format=unknown', 'format=article']) {
      const state = parseNewsListState(query);
      expect(getNewsListView(cards, state, 10).items.every((item) => item.contentType !== 'infographic')).toBe(true);
      expect(buildNewsDecisionHref('/zh/news', { ...state, page: 2 })).toBe('/zh/news?page=2');
    }
  });

  it('keeps English lists on articles when a Chinese infographic query is shared', () => {
    expect(normalizeNewsContentFormat('infographic', 'en')).toBe('article');
    expect(parseNewsListState('format=infographic&topic=quality', 'en'))
      .toEqual(parseNewsListState('topic=quality', 'en'));
  });

  it('combines image-text search with topic, equipment and content format', () => {
    const matching = {
      format: 'infographic',
      query: '4700',
      topic: 'quality',
      furnace: 'mesh-belt',
    };
    expect(filterAndSortNewsDecisionItems(cards, matching)).toHaveLength(1);
    expect(filterAndSortNewsDecisionItems(cards, { ...matching, format: 'article' })).toHaveLength(
      0,
    );
    expect(filterAndSortNewsDecisionItems(cards, { ...matching, furnace: 'pit' })).toHaveLength(0);
    expect(
      filterAndSortNewsDecisionItems(cards, { ...matching, topic: 'procurement' }),
    ).toHaveLength(0);
    expect(
      includeInfographicNewsResources(getInfographicCards(), 'zh').filter(
        (item) => item.contentType === 'infographic',
      ),
    ).toHaveLength(10);
  });

  it('keeps the imported supply and solid-solution topics out of unrelated equipment results', () => {
    const cooling = filterAndSortNewsDecisionItems(cards, {
      format: 'infographic',
      query: '304',
      topic: 'procurement',
      furnace: 'mesh-belt',
    });
    expect(cooling.map((item) => item.slug)).toEqual(['mesh-belt-cooling-water-supply']);
    const liner = filterAndSortNewsDecisionItems(cards, { format: 'infographic', query: '1600' });
    expect(liner.map((item) => item.slug)).toEqual(['aluminum-liner-solution-furnace-basket-load']);
    expect(
      filterAndSortNewsDecisionItems(cards, {
        format: 'infographic',
        query: '1600',
        furnace: 'mesh-belt',
      }),
    ).toEqual([]);
  });

  it('retains content format through shareable URLs, page changes and history comparisons', () => {
    const href = buildNewsDecisionHref('/zh/news', {
      format: 'infographic',
      topic: 'quality',
      furnace: 'mesh-belt',
      page: 2,
    });
    const state = parseNewsListState(href.split('?')[1]);
    expect(state).toMatchObject({
      format: 'infographic',
      topic: 'quality',
      furnace: 'mesh-belt',
      page: 2,
    });
    expect(hasNewsListFilters(parseNewsListState('format=article'))).toBe(false);
    expect(isSameNewsListState(parseNewsListState(''), parseNewsListState('format=article'))).toBe(
      true,
    );
    expect(isSameNewsListState(parseNewsListState(''), parseNewsListState('format=unknown'))).toBe(
      true,
    );
    expect(getNewsListView(cards, state, 10).page).toBe(1);
  });
});
