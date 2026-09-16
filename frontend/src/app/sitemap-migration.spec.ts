import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('server-only', () => ({}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

vi.mock('@/lib/api/news', () => ({
  getAllNewsForDecisionCenter: vi.fn(async () => ({
    data: [
        {
          id: 1,
          categoryId: 1,
          titleZh: '标准新闻',
          slug: 'canonical-news',
          publishDate: '2026-06-01T00:00:00.000Z',
          contentUpdatedAt: '2026-07-01T00:00:00.000Z',
          status: 'published',
          isPublished: true,
        },
        {
          id: 2,
          categoryId: 1,
          titleZh: '重复新闻',
          slug: 'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1',
          publishDate: '2026-06-02T00:00:00.000Z',
          status: 'published',
          isPublished: true,
        },
      ],
    error: null,
  })),
}));

import buildSitemap from '@/app/sitemap';
import { getAllNewsForDecisionCenter } from '@/lib/api/news';

// Extra checks from the pre-migration worktree; the frozen main guard remains unchanged.
describe('sitemap migration supplementary checks', () => {
  it('does not publish a partial sitemap when the article source fails', async () => {
    vi.mocked(getAllNewsForDecisionCenter).mockResolvedValueOnce({ data: null, error: 'upstream unavailable' });
    await expect(buildSitemap()).rejects.toThrow('Cannot generate a complete sitemap');
  });
  it('keeps content modification dates stable when the crawl date changes', async () => {
    const before = (await buildSitemap()).map(({ url, lastModified }) => ({ url, lastModified }));
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      vi.setSystemTime(new Date('2026-10-08T00:00:00Z'));
      const after = (await buildSitemap()).map(({ url, lastModified }) => ({ url, lastModified }));
      expect(after).toEqual(before);
    } finally { vi.useRealTimers(); }
  });

  it('includes the real English qualifications and copper-wire inquiry checklist once', async () => {
    const entries = await buildSitemap();
    for (const suffix of ['/en/strength/honors', '/zh/products/detail/copper-wire-annealing-line/inquiry-checklist']) {
      expect(entries.filter((entry) => entry.url === `https://www.jssngyl.cn${suffix}`)).toHaveLength(1);
    }
    expect(entries.some((entry) => entry.url.endsWith('/en/strength/certificates'))).toBe(false);
    // Case detail pages appear only after owner approval.
    expect(entries.filter((entry) => entry.url.includes('/case/')).map((entry) => entry.url).sort()).toEqual([
      'https://www.jssngyl.cn/en/case/henan-annealing-solution-line',
      'https://www.jssngyl.cn/zh/case/henan-annealing-solution-line',
    ]);
  });

});
