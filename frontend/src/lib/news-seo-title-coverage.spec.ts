import { describe, expect, it } from 'vitest';
import sources from '../../tests/fixtures/news-seo-title-sources-20260920.json';
import translations from './english-news-copy.json';
import revisions from './news-seo-titles-en.json';
import { getNewsSeoTitle } from './news-seo-title';
import type { NewsApiItem } from '@/types/news';

type Translation = { slug: string; titleEn: string; summaryEn: string; contentEn: string };

function reviewedArticle(id: number, slug: string): NewsApiItem {
  const cms = sources.cms.find((item) => item.id === id);
  if (cms) return { titleZh: '原中文标题', ...cms } as NewsApiItem;
  const copy = (translations as Record<string, Translation>)[String(id)];
  if (!copy || copy.slug !== slug) throw new Error(`Missing reviewed source: ${slug}`);
  return {
    id,
    slug,
    titleZh: '原中文标题',
    status: 'published',
    isPublished: true,
    titleEn: copy.titleEn,
    summaryEn: copy.summaryEn,
    contentEn: copy.contentEn,
    seoTitleEn: copy.titleEn,
    seoDescriptionEn: copy.summaryEn,
  } as NewsApiItem;
}

describe('complete reviewed English title inventory', () => {
  it('covers every published English news page in the independently captured inventory', () => {
    expect(sources.inventory).toHaveLength(72);
    expect(Object.keys(revisions).sort()).toEqual(
      sources.inventory.map((item) => item.slug).sort(),
    );
  });

  it.each(sources.inventory)(
    'uses the real source-bound short title for $slug without changing visible copy',
    async ({ id, slug }) => {
      const article = reviewedArticle(id, slug);
      const before = JSON.stringify(article);
      const title = await getNewsSeoTitle('en', article);
      const revision = (revisions as Record<string, { id: number; title: string }>)[slug];
      expect(revision.id).toBe(id);
      expect(title).toBe(revision.title);
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(await getNewsSeoTitle('zh', article)).toBe(article.titleZh);
      expect(JSON.stringify(article)).toBe(before);
    },
  );

  it.each(['titleEn', 'summaryEn', 'contentEn', 'seoTitleEn', 'seoDescriptionEn'] as const)(
    'preserves later CMS edits to %s across the whole inventory',
    async (key) => {
      for (const { id, slug } of sources.inventory) {
        const edited = {
          ...reviewedArticle(id, slug),
          [key]: 'A newly approved editorial version.',
        };
        expect(await getNewsSeoTitle('en', edited)).toBe(
          edited.seoTitleEn?.trim() || edited.titleEn,
        );
      }
    },
  );
});
