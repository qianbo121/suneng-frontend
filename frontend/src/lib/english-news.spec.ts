import { describe, expect, it, vi } from 'vitest';
import type { NewsApiItem } from '@/types/news';
import { applyEnglishNewsCopy } from './english-news';
import { getNewsRouteAvailability, newsNotFoundHtml } from './news-route-guard';
import { getNewsContentModifiedTime } from './news-dates';

const fixture = vi.hoisted(() => ({
  id: 99001,
  categoryId: 1,
  slug: 'translation-test',
  titleZh: '测试标题',
  summaryZh: '原摘要',
  contentZh: '<p>原正文含 200 kg。</p>',
  seoTitleZh: '原搜索标题',
  seoDescriptionZh: '原搜索摘要',
  publishDate: '2026-01-01T00:00:00Z',
  contentUpdatedAt: '2026-02-01T00:00:00Z',
  status: 'published',
  isPublished: true,
  coverImage: '/uploads/original.jpg',
}));
vi.mock('./english-news-copy.json', async () => {
  const { createHash } = await import('node:crypto');
  const source = JSON.stringify([
    fixture.titleZh,
    fixture.summaryZh,
    fixture.contentZh,
    fixture.seoTitleZh,
    fixture.seoDescriptionZh,
  ]);
  return {
    default: {
      [fixture.id]: {
        slug: fixture.slug,
        sourceFingerprint: createHash('sha256').update(source).digest('hex'),
        translatedAt: '2026-03-01T00:00:00Z',
        titleEn: 'English title',
        summaryEn: 'English summary',
        contentEn: '<p>Original body: 200 kg.</p>',
        seoKeywordsEn: 'furnace',
        sourceDateEn: { label: 'Source reviewed', date: '2026-02-01' },
        coverImageEn: '/images/news/english-cover.png',
      },
    },
  };
});
vi.mock('./english-news-index.json', async () => {
  const { createHash } = await import('node:crypto');
  return {
    default: {
      [fixture.id]: {
        slug: fixture.slug,
        rawSourceFingerprint: createHash('sha256')
          .update(
            JSON.stringify([
              fixture.titleZh,
              fixture.summaryZh,
              fixture.contentZh,
              fixture.seoTitleZh,
              fixture.seoDescriptionZh,
            ]),
          )
          .digest('hex'),
      },
    },
  };
});

describe('source-bound English news', () => {
  it('adds a complete translation and its real edit date without changing source or protected fields', async () => {
    const result = await applyEnglishNewsCopy(fixture as NewsApiItem);
    expect(result).toMatchObject(fixture);
    expect(result.titleEn).toBe('English title');
    expect(result.seoTitleEn).toBe(result.titleEn);
    expect(result.seoDescriptionEn).toBe(result.summaryEn);
    expect(result.englishContentUpdatedAt).toBe('2026-03-01T00:00:00Z');
    expect(result.englishSourceDate).toEqual({ label: 'Source reviewed', date: '2026-02-01' });
    expect(result.englishCoverImage).toBe('/images/news/english-cover.png');
    expect(result.coverImage).toBe(fixture.coverImage);
    expect(getNewsContentModifiedTime(result, 'en')).toBe(result.englishContentUpdatedAt);
    expect(getNewsContentModifiedTime(result, 'zh')).toBe(fixture.contentUpdatedAt);
  });
  it.each([
    { id: 99002 },
    { slug: 'another-slug' },
    { contentZh: '<p>Changed source.</p>' },
    { titleZh: 'Changed title' },
    { status: 'draft' },
    { isPublished: false },
  ])(
    'does not apply a translation to a different, edited or nonpublic source: %j',
    async (change) => {
      const item = { ...fixture, ...change } as NewsApiItem;
      expect(await applyEnglishNewsCopy(item)).toBe(item);
    },
  );
  it('preserves a complete English version subsequently supplied by the source system', async () => {
    const item = {
      ...fixture,
      titleEn: 'Source English',
      contentEn: '<p>Source text.</p>',
    } as NewsApiItem;
    expect(await applyEnglishNewsCopy(item)).toBe(item);
  });
  it('checks current upstream visibility and exact source identity before exposing an English detail', async () => {
    for (const [change, expected] of [
      [{}, 'available'],
      [{ contentZh: 'Edited' }, 'missing'],
      [{ slug: 'changed' }, 'missing'],
      [{ status: 'draft' }, 'missing'],
      [{ isPublished: false }, 'missing'],
      [{ id: 99002 }, 'missing'],
    ] as const) {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(JSON.stringify({ data: { ...fixture, ...change } })));
      expect(
        await getNewsRouteAvailability(
          '/en/news/translation-test',
          'http://example.test/api',
          fetcher,
        ),
      ).toBe(expected);
    }
  });
  it('accepts native English but keeps upstream failure distinct from missing content', async () => {
    const native = {
      ...fixture,
      id: 99002,
      titleEn: 'Native',
      contentEn: '<p>Native English.</p>',
    };
    expect(
      await getNewsRouteAvailability(
        '/en/news/native',
        'http://example.test/api',
        vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: native }))),
      ),
    ).toBe('available');
    expect(
      await getNewsRouteAvailability(
        '/en/news/native',
        'http://example.test/api',
        vi.fn().mockResolvedValue(new Response('{}', { status: 503 })),
      ),
    ).toBe('unknown');
    expect(newsNotFoundHtml('en')).toContain('Return to Resources');
    expect(newsNotFoundHtml('en')).not.toMatch(/[\u4e00-\u9fff]/);
  });
});
