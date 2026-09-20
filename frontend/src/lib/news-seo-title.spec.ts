import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NewsApiItem } from '@/types/news';
import { getNewsSeoTitle } from './news-seo-title';
import { generateMetadata } from '@/app/[locale]/news/[slug]/page';
import { getNewsDetailPageData } from './news';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('NEXT_NOT_FOUND'); },
  permanentRedirect: (href: string) => { throw new Error(`REDIRECT:${href}`); },
}));
vi.mock('./news', async (original) => ({
  ...(await original<typeof import('./news')>()),
  getNewsDetailPageData: vi.fn(),
}));
const reviewed = vi.hoisted(() => ({ id: 99001, slug: 'reviewed-title', titleEn: 'Original long English question?', summaryEn: 'Original summary.', contentEn: '<p>Original body.</p>', seoTitleEn: 'Original search title', seoDescriptionEn: 'Original search description.' }));
vi.mock('./news-seo-titles-en.json', async () => {
  const { createHash } = await import('node:crypto');
  return { default: { [reviewed.slug]: {
    id: reviewed.id,
    sourceFingerprint: createHash('sha256').update(JSON.stringify([reviewed.titleEn, reviewed.summaryEn, reviewed.contentEn, reviewed.seoTitleEn, reviewed.seoDescriptionEn])).digest('hex'),
    title: 'Reviewed concise title | Suneng',
  } } };
});
const article = { ...reviewed, categoryId: 1, titleZh: '中文标题', status: 'published', isPublished: true } as NewsApiItem;
beforeEach(() => vi.mocked(getNewsDetailPageData).mockResolvedValue({ article, error: null }));

describe('news search metadata', () => {
  it('uses the reviewed title in real route metadata without mutating its heading or body', async () => {
    const before = createHash('sha256').update(JSON.stringify(article)).digest('hex');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en', slug: article.slug }) });
    expect(metadata.title).toEqual({ absolute: 'Reviewed concise title | Suneng' });
    expect(metadata.openGraph).toMatchObject({ title: 'Reviewed concise title | Suneng', description: article.seoDescriptionEn });
    expect(metadata.twitter).toMatchObject({ title: 'Reviewed concise title | Suneng' });
    expect(createHash('sha256').update(JSON.stringify(article)).digest('hex')).toBe(before);
  });
  it.each(['titleEn', 'summaryEn', 'contentEn', 'seoTitleEn', 'seoDescriptionEn'] as const)('lets a later CMS change to %s supersede the local revision', async (key) => {
    const edited = { ...article, [key]: 'A later editorial version' };
    expect(await getNewsSeoTitle('en', edited)).toBe(edited.seoTitleEn);
  });
  it.each([{ id: 99002 }, { slug: 'other' }, { status: 'offline' as const }, { isPublished: false }])('does not apply reviewed text to an ineligible article: %j', async (change) => {
    expect(await getNewsSeoTitle('en', { ...article, ...change })).toBe(article.seoTitleEn);
  });
  it('prefers explicit English search copy and falls back from a blank value', async () => {
    const item = { ...article, slug: 'other', seoTitleEn: '  Furnace selection | Suneng  ' };
    vi.mocked(getNewsDetailPageData).mockResolvedValue({ article: item, error: null });
    expect((await generateMetadata({ params: Promise.resolve({ locale: 'en', slug: item.slug }) })).title).toEqual({ absolute: 'Furnace selection | Suneng' });
    expect(await getNewsSeoTitle('en', { ...item, seoTitleEn: '  ' })).toBe(item.titleEn);
    expect(await getNewsSeoTitle('zh', item)).toBe(item.titleZh);
  });
  it('still rejects absent English content and unavailable articles', async () => {
    vi.mocked(getNewsDetailPageData).mockResolvedValue({ article: { ...article, contentEn: '' }, error: null });
    await expect(generateMetadata({ params: Promise.resolve({ locale: 'en', slug: article.slug }) })).rejects.toThrow('NEXT_NOT_FOUND');
    vi.mocked(getNewsDetailPageData).mockResolvedValue({ article: null, error: null });
    await expect(generateMetadata({ params: Promise.resolve({ locale: 'en', slug: 'missing' }) })).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
