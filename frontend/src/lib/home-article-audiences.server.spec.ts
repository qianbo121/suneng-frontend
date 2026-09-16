import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/api/news', () => ({ getNewsList: vi.fn() }));
import { getNewsList } from '@/lib/api/news';
import { getHomepageAudienceArticles } from './home-article-audiences.server';

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe('homepage article availability', () => {
  it('signals the visible fallback when neither source supplies articles', async () => {
    vi.mocked(getNewsList).mockResolvedValue({ data: null, error: 'timeout' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(getHomepageAudienceArticles()).rejects.toThrow('temporarily unavailable');
  });

  it('returns real articles from the public fallback when the primary source fails', async () => {
    vi.mocked(getNewsList).mockResolvedValue({ data: null, error: 'timeout' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 0, data: { items: [{
        id: 999, categoryId: 1, titleZh: '连续生产线选型', summaryZh: '按工件和节拍选择。',
        slug: 'shuju-news-30', coverImage: '/uploads/test.webp', publishDate: '2026-09-01',
      }] } }),
    }));
    const articles = await getHomepageAudienceArticles();
    expect(articles).toHaveLength(1);
    expect(articles[0].id).toBe(999);
    expect(articles[0].href).toMatch(/\/zh\/news\/shuju-news-30$/);
  });
});
