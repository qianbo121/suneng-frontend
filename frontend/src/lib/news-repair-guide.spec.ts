import { describe, expect, it, vi } from 'vitest';
import source from './__fixtures__/repair-guide-source.json';
import type { NewsApiItem } from '@/types/news';
import { applyReviewedNewsCopy } from './news-reviewed-copy';
import { safeApiGet } from './api/client';
import { getNewsDetail, getNewsList } from './api/news';
import { prepareNewsArticleHtml } from './sanitize';

vi.mock('./api/client', () => ({ safeApiGet: vi.fn() }));
const original = source as NewsApiItem;

describe('merged repair guide', () => {
  it('keeps article identity and publication while applying the reviewed guide', async () => {
    const result = await applyReviewedNewsCopy(original);
    expect(result.titleZh).toBe('旧热处理炉维修、改造还是换新？判断表与资料清单');
    expect(result.contentZh).toContain('不将某个项目的参数外推为其他项目的通用指标');
    expect(result.contentZh).not.toContain('它们不是已交付或已验收的证明');
    expect(result.seoDescriptionZh).toBe(result.summaryZh);
    for (const key of ['id', 'slug', 'publishDate', 'coverImage', 'contentEn', 'status'] as const) {
      expect(result[key]).toEqual(original[key]);
    }
  });

  it.each(['titleZh', 'summaryZh', 'contentZh', 'seoTitleZh', 'seoDescriptionZh'] as const)(
    'preserves later source edits to %s',
    async (key) => {
      const item = { ...original, [key]: 'Later editorial change' };
      expect(await applyReviewedNewsCopy(item)).toBe(item);
    },
  );

  it('does not revive withdrawn content or overwrite an unrelated article', async () => {
    for (const change of [
      { status: 'offline' as const }, { isPublished: false }, { slug: 'unrelated' }, { id: -1 },
    ]) {
      const item = { ...original, ...change };
      expect(await applyReviewedNewsCopy(item)).toBe(item);
    }
    const result = await applyReviewedNewsCopy(original);
    expect(await applyReviewedNewsCopy(result)).toBe(result);
  });

  it('keeps the mobile table labels through article sanitization', async () => {
    const result = await applyReviewedNewsCopy(original);
    const html = prepareNewsArticleHtml(result.contentZh);
    expect(html).toContain('class="furnace-decision-table"');
    expect(html.match(/data-label=/g)).toHaveLength(15);
    expect(html.match(/scope="col"/g)).toHaveLength(3);
  });

  it('applies the same revision to list and detail reads', async () => {
    vi.mocked(safeApiGet)
      .mockResolvedValueOnce({ data: { items: [original], total: 1, page: 1, pageSize: 10 }, error: null })
      .mockResolvedValueOnce({ data: original, error: null });
    const list = await getNewsList();
    const detail = await getNewsDetail(original.slug);
    expect(list.data?.items[0].contentZh).toBe(detail.data?.contentZh);
    expect(detail.data?.titleZh).toContain('判断表与资料清单');
  });

  it('keeps unavailable content unavailable', async () => {
    vi.mocked(safeApiGet).mockResolvedValue({ data: null, error: 'Not found' });
    expect(await getNewsDetail(original.slug)).toEqual({ data: null, error: 'Not found' });
    expect(await getNewsList()).toEqual({ data: null, error: 'Not found' });
  });
});
