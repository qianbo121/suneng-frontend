import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unstable_cache } from 'next/cache';
import { getAllNewsForDecisionCenter } from '@/lib/api/news';
import { getNewsDecisionCenterData } from './news-decision-center.server';
import type { NewsApiItem } from '@/types/news';

vi.mock('server-only', () => ({}));
vi.mock('react', async () => ({
  ...(await vi.importActual<typeof import('react')>('react')),
  cache: <T>(callback: T) => callback,
}));
// Exercise loader/error boundaries here; real cache hits are checked against
// the running Next server, rather than reimplementing its cache in this test.
vi.mock('next/cache', () => ({ unstable_cache: vi.fn((loader) => loader) }));
vi.mock('@/lib/api/news', () => ({ getAllNewsForDecisionCenter: vi.fn() }));

const article: NewsApiItem = {
  id: 1001,
  categoryId: 1,
  slug: 'loading-cache-test',
  titleZh: '台车炉资料',
  summaryZh: '资料摘要。',
  contentZh: '<p>正文独有搜索词。</p>',
  publishDate: '2026-09-01T00:00:00.000Z',
  contentUpdatedAt: '2026-09-02T00:00:00.000Z',
  viewCount: 12,
  isPublished: true,
  status: 'published',
};

beforeEach(() => vi.mocked(getAllNewsForDecisionCenter).mockReset());

describe('prepared news collection', () => {
  it('caches the prepared collection for five minutes while retaining search and sorting data', async () => {
    vi.mocked(getAllNewsForDecisionCenter).mockResolvedValue({ data: [article], error: null });
    const result = await getNewsDecisionCenterData('zh');
    expect(vi.mocked(unstable_cache).mock.calls[0][2]).toEqual({ revalidate: 300 });
    expect(result.error).toBeNull();
    expect(result.data?.[0]).toMatchObject({
      id: article.id,
      date: article.publishDate,
      updatedAt: article.contentUpdatedAt,
      viewCount: 12,
    });
    expect(result.data?.[0].searchText).toContain('正文独有搜索词');
    expect(result.data?.[0]).not.toHaveProperty('source');
  });

  it('throws inside the cache boundary on failure instead of caching an error or partial list', async () => {
    vi.mocked(getAllNewsForDecisionCenter).mockResolvedValue({ data: null, error: 'offline' });
    const cachedLoader = vi.mocked(unstable_cache).mock.calls[0][0];
    await expect(cachedLoader('zh')).rejects.toThrow('offline');
    await expect(getNewsDecisionCenterData('zh')).resolves.toEqual({
      data: null,
      error: '资料暂时无法加载',
    });

    vi.mocked(getAllNewsForDecisionCenter).mockResolvedValue({ data: [article], error: null });
    expect((await getNewsDecisionCenterData('zh')).data).toHaveLength(1);
  });

  it('accepts a successfully loaded empty collection', async () => {
    vi.mocked(getAllNewsForDecisionCenter).mockResolvedValue({ data: [], error: null });
    await expect(getNewsDecisionCenterData('zh')).resolves.toEqual({ data: [], error: null });
  });
});

it('keeps English lists restricted to complete translations and uses English search content', async () => {
  const translated = {
    ...article,
    id: 1002,
    titleEn: 'Trolley furnace selection',
    summaryEn: 'English summary',
    contentEn: '<p>English-only search phrase.</p>',
  };
  vi.mocked(getAllNewsForDecisionCenter).mockResolvedValue({
    data: [article, translated],
    error: null,
  });
  const result = await getNewsDecisionCenterData('en');
  expect(result.data).toHaveLength(1);
  expect(result.data?.[0].title.en).toBe(translated.titleEn);
  expect(result.data?.[0].searchText).toContain('English-only search phrase');
  expect((await getNewsDecisionCenterData('zh')).data).toHaveLength(2);
});
