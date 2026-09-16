import { describe, expect, it, vi } from 'vitest';
import source from '../../tests/fixtures/news-reviewed-copy-source.json';
import type { NewsApiItem } from '@/types/news';
import { applyReviewedNewsCopy } from './news-reviewed-copy';
import { safeApiGet } from './api/client';
import { getNewsDetail, getNewsList } from './api/news';
import { mapNewsCard, normalizeNewsHtml } from './news';
import { applyNewsListCopy } from './news-list-copy';

vi.mock('./api/client', () => ({ safeApiGet: vi.fn(), toAssetUrl: (url: string) => url }));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));
const original = source as NewsApiItem;

describe('reviewed news copy', () => {
  it('revises the reviewed source without changing identity, images, publication or English copy', async () => {
    const item = { ...original, contentEn: 'Existing English article', viewCount: 321 };
    const result = await applyReviewedNewsCopy(item);
    expect(result.contentZh).toContain('不能将其直接用于');
    expect(result.contentZh).not.toContain('产能提升约 20%');
    expect(result.summaryZh).toContain('700℃版本');
    for (const key of [
      'id',
      'slug',
      'publishDate',
      'status',
      'coverImage',
      'contentEn',
      'viewCount',
    ] as const) {
      expect(result[key]).toEqual(item[key]);
    }
    expect(item.contentZh).toBe(original.contentZh);
  });

  it.each(['titleZh', 'summaryZh', 'contentZh', 'seoTitleZh', 'seoDescriptionZh'] as const)(
    'preserves a later CMS edit to %s',
    async (key) => {
      const edited = { ...original, [key]: 'A newer editorial version' };
      expect(await applyReviewedNewsCopy(edited)).toBe(edited);
    },
  );

  it('does not revive withdrawn content, match other articles or reapply an applied revision', async () => {
    for (const change of [
      { status: 'offline' as const },
      { isPublished: false },
      { slug: 'another-article' },
      { id: 999999 },
    ]) {
      const item = { ...original, ...change };
      expect(await applyReviewedNewsCopy(item)).toBe(item);
    }
    const revised = await applyReviewedNewsCopy(original);
    expect(await applyReviewedNewsCopy(revised)).toBe(revised);
  });

  it('uses the same reviewed text for list/search, article HTML and metadata source', async () => {
    vi.mocked(safeApiGet)
      .mockResolvedValueOnce({
        data: { items: [original], page: 1, pageSize: 10, total: 1 },
        error: null,
      })
      .mockResolvedValueOnce({ data: original, error: null });
    const list = await getNewsList();
    const detail = await getNewsDetail(original.slug);
    const item = detail.data!;
    const card = applyNewsListCopy(mapNewsCard('zh', list.data!.items[0]));
    expect(list.data!.items[0].contentZh).toEqual(item.contentZh);
    expect(card.summary.zh).toContain('700℃版本');
    expect(card.searchText).not.toContain('产能提升约 20%');
    expect(normalizeNewsHtml('zh', item)).not.toContain('产能提升约 20%');
    expect(item.seoDescriptionZh).toBe(item.summaryZh);
  });

  it('preserves unavailable detail and list results without a local fallback article', async () => {
    vi.mocked(safeApiGet).mockResolvedValue({ data: null, error: 'Not found' });
    expect(await getNewsDetail(original.slug)).toEqual({ data: null, error: 'Not found' });
    expect(await getNewsList()).toEqual({ data: null, error: 'Not found' });
  });
});
