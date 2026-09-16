import { describe, expect, it } from 'vitest';

import {
  ARTICLE_AUDIENCES,
  HOMEPAGE_ARTICLE_AUDIENCES_BY_SLUG,
  mapNewsToHomeAudienceArticles,
  selectHomeArticlesForAudience,
} from '@/lib/home-article-audiences';
import newsListCopy from '@/lib/news-list-copy.json';
import type { NewsApiItem } from '@/types/news';

const productionSlugs = [
  'shuju-news-30',
  'shuju-news-29',
  'shuju-news-28',
  'shuju-news-27',
  'shuju-news-26',
  'shuju-news-25',
  'shuju-news-24',
  'shuju-news-23',
  'shuju-news-22',
  'shuju-news-19',
] as const;

function article(slug: string, index: number): NewsApiItem {
  return {
    id: index + 1,
    categoryId: 1,
    titleZh: `真实文章 ${index + 1}`,
    summaryZh: `真实摘要 ${index + 1}`,
    coverImage: `/uploads/${slug}.webp`,
    publishDate: new Date(Date.UTC(2026, 7, 28 - index)).toISOString(),
    slug,
  };
}

describe('homepage article audiences', () => {
  it('uses the article summary instead of an image caption on the homepage', () => {
    const item = {
      ...article('shuju-news-30', 0),
      summaryZh: '画面用两条抽象路径呈现连续生产与周期装炉的选择关系。',
      seoDescriptionZh: '先核对工件、工艺和产量，再比较连续线与周期炉。',
    };
    expect(mapNewsToHomeAudienceArticles([item])[0].summary).toBe(item.seoDescriptionZh);
  });

  it('falls back to the real title if both summary fields contain only image descriptions', () => {
    const item = {
      ...article('shuju-news-30', 0),
      summaryZh: '画面展示设备结构。',
      seoDescriptionZh: '配图说明：设备结构示意。',
    };
    expect(mapNewsToHomeAudienceArticles([item])[0].summary).toBe(item.titleZh);
  });

  it('shares the reviewed resource summary only while the source still matches', () => {
    const item = {
      ...article('shuju-news-30', 0),
      id: 75,
      titleZh: newsListCopy['75'].sourceTitle,
      updatedAt: newsListCopy['75'].sourceDate,
      summaryZh: '画面展示两种生产方式。',
      seoDescriptionZh: '当前文章的新摘要。',
    };
    expect(mapNewsToHomeAudienceArticles([item])[0].summary).toBe(newsListCopy['75'].summary);
    expect(mapNewsToHomeAudienceArticles([{ ...item, updatedAt: '2026-09-10T00:00:00.000Z' }])[0].summary).toBe(item.seoDescriptionZh);
  });

  it('defines all five requested audience tabs', () => {
    expect(ARTICLE_AUDIENCES.map((item) => item.id)).toEqual([
      'owner',
      'procurement',
      'process',
      'production',
      'engineering',
    ]);
    expect(ARTICLE_AUDIENCES.every((item) => item.description.trim().length > 0)).toBe(true);
  });

  it('keeps explicit mappings large enough for four real articles per audience', () => {
    for (const audience of ARTICLE_AUDIENCES) {
      const mappedCount = Object.values(HOMEPAGE_ARTICLE_AUDIENCES_BY_SLUG).filter((items) =>
        items.includes(audience.id),
      ).length;

      expect(mappedCount).toBeGreaterThanOrEqual(4);
    }
  });

  it('treats the continuous-line decision guide as production content too', () => {
    expect(HOMEPAGE_ARTICLE_AUDIENCES_BY_SLUG['shuju-news-30']).toContain('production');
  });

  it('sorts by publish date and selects one featured plus three list articles', () => {
    const mapped = mapNewsToHomeAudienceArticles(
      productionSlugs.map((slug, index) => article(slug, index)),
    );
    const expectedSlugs = {
      owner: ['shuju-news-30', 'shuju-news-29', 'shuju-news-28', 'shuju-news-22'],
      procurement: ['shuju-news-29', 'shuju-news-28', 'shuju-news-22', 'shuju-news-19'],
      process: ['shuju-news-30', 'shuju-news-27', 'shuju-news-26', 'shuju-news-25'],
      production: ['shuju-news-30', 'shuju-news-27', 'shuju-news-24', 'shuju-news-23'],
      engineering: ['shuju-news-26', 'shuju-news-25', 'shuju-news-24', 'shuju-news-23'],
    } as const;

    for (const audience of ARTICLE_AUDIENCES) {
      const selected = selectHomeArticlesForAudience(mapped, audience.id);

      expect(selected.map((item) => item.href.replace('/zh/news/', ''))).toEqual(
        expectedSlugs[audience.id],
      );
      expect(selected.every((item) => item.title.startsWith('真实文章'))).toBe(true);
    }
  });

  it('excludes test copy and legacy duplicate news rows', () => {
    const testItem = {
      ...article('shuju-news-30', 0),
      titleZh: '联调测试新闻',
    };
    const duplicate = article(
      'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1',
      1,
    );

    expect(mapNewsToHomeAudienceArticles([testItem, duplicate])).toEqual([]);
  });
});
