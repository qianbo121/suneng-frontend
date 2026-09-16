import { describe, expect, it } from 'vitest';
import type { NewsListCardItem } from '@/types/news';
import { filterAndSortNewsDecisionItems } from './news-decision-center';
import {
  HOME_ARTICLE_TOPICS,
  mapNewsToHomeTopicArticles,
  selectHomeArticlesForTopic,
} from './home-article-topics';

function card(id: number, listTopic?: NewsListCardItem['listTopic']): NewsListCardItem {
  return {
    id,
    listTopic,
    slug: `new-resource-${id}`,
    image: '/cover.webp',
    title: { zh: '工业炉报价与验收', en: 'Furnace quotation and acceptance' },
    summary: { zh: '核对项目条件。', en: 'Check project requirements.' },
    category: { zh: '技术资料', en: 'Resources' },
    date: '2026-09-15',
  };
}

describe('homepage resources by topic', () => {
  it('classifies explicit title questions ahead of incidental summary keywords', () => {
    const items = [
      ['固化炉温度均匀性怎么验收？', '采购前核对报价。', 'engineering'],
      ['辊棒炉适合处理哪些工件？', '运行时还需要维护和备件。', 'selection'],
      ['热处理生产线厂家怎么选？苏能七项整线责任核验法', '统一报价与验收条件。', 'selection'],
      ['台车炉操作规程要注意什么？', '按工艺温度运行。', 'operations'],
    ].map(([title, summary, topic], index) => ({
      ...card(index),
      title: { zh: title, en: '' },
      summary: { zh: summary, en: '' },
      expectedTopic: topic,
    }));
    for (const item of items) {
      expect(mapNewsToHomeTopicArticles([item], 'zh')[0].topic).toBe(item.expectedTopic);
    }
  });

  it('matches the resource center membership, including editorial overrides and new articles', () => {
    const items = [
      card(1, 'selection'),
      card(2),
      card(3, 'quality'),
      card(4, 'engineering'),
      card(5, 'operations'),
    ];
    const home = mapNewsToHomeTopicArticles(items, 'zh');
    for (const topic of HOME_ARTICLE_TOPICS) {
      const expected = filterAndSortNewsDecisionItems(items, { topic: topic.id }).map(
        (item) => item.id,
      );
      expect(selectHomeArticlesForTopic(home, topic.id).map((item) => item.id)).toEqual(expected);
    }
  });

  it('never fills a sparse or empty category with unrelated articles', () => {
    const home = mapNewsToHomeTopicArticles([card(1, 'selection'), card(2, 'procurement')], 'zh');
    expect(selectHomeArticlesForTopic(home, 'selection').map((item) => item.id)).toEqual([1]);
    expect(selectHomeArticlesForTopic(home, 'operations')).toEqual([]);
  });

  it('keeps newest publications first and limits each category to four cards', () => {
    const items = Array.from({ length: 6 }, (_, index) => ({
      ...card(index, 'selection'),
      date: `2026-09-${10 + index}`,
    }));
    const home = mapNewsToHomeTopicArticles(items, 'zh');
    expect(selectHomeArticlesForTopic(home, 'selection').map((item) => item.id)).toEqual([
      5, 4, 3, 2,
    ]);
    expect(items[0].id).toBe(0);
  });

  it('shortens the approved quote title while retaining its summary and current-source fallback', () => {
    const item = card(74, 'procurement');
    item.title.zh = '热处理生产线报价需要哪些参数？先准备11组输入再比价';
    item.summary.zh = '按11组参数整理询价资料。';
    const [home] = mapNewsToHomeTopicArticles([item], 'zh');
    expect(home.title).toBe('热处理生产线报价前，需要准备哪些参数？');
    expect(home.summary).toBe(item.summary.zh);
    item.title.zh = '更新后的报价要求';
    expect(mapNewsToHomeTopicArticles([item], 'zh')[0].title).toBe(item.title.zh);
  });

  it('keeps translated copy, local article links and topic membership together', () => {
    const item = card(1, 'engineering');
    const [home] = mapNewsToHomeTopicArticles([item], 'en');
    expect(home).toMatchObject({
      title: item.title.en,
      summary: item.summary.en,
      href: '/en/news/new-resource-1',
      topic: 'engineering',
    });
  });
});
