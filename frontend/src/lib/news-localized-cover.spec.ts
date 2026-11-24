import { existsSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveNewsImage } from './news';
import articleCovers from './news-bilingual-article-covers.json';

// The resolver is pure; React's server cache is supplied by Next outside this unit test.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));

describe('localized news cover', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each(Object.entries(articleCovers))('uses the matching English article cover for %s', (slug, images) => {
    const article = { slug, coverImage: images.original };
    expect(resolveNewsImage(article, { locale: 'zh' })).toBe(images.original);
    expect(resolveNewsImage(article, { locale: 'en' })).toBe(images.english);
    // Uploaded assets are served by the public proxy, not the Next server's
    // local filesystem. Relative /uploads URLs fail inside the image optimizer.
    if (images.english.startsWith('/images/news/fork-en/')) {
      expect(images.english).toMatch(/^\/images\/news\/fork-en\/(?:15[3-9]|160)-cover\.webp$/);
      expect(existsSync(path.join(process.cwd(), 'public', images.english))).toBe(true);
    } else {
      const englishUrl = new URL(images.english);
      expect(englishUrl.origin).toBe('https://www.jssngyl.cn');
      expect(englishUrl.pathname).toMatch(/^\/uploads\/2026\/11\/.+\.webp$/);
    }
    expect(resolveNewsImage({ ...article, coverImage: '/uploads/revised.webp' }, { locale: 'en' })).toBe('/uploads/revised.webp');
  });

  it('keeps the original Chinese cover and selects the independent English image only for English', () => {
    vi.stubEnv('API_BASE_URL_INTERNAL', 'http://localhost:3001/api');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api');
    const item = {
      coverImage: '/uploads/original.webp',
      englishCoverImage: '/images/news/english.webp',
    };
    expect(resolveNewsImage(item, { locale: 'zh' })).toBe('/uploads/original.webp');
    expect(resolveNewsImage(item, { locale: 'en' })).toBe('/images/news/english.webp');
    expect(item.coverImage).toBe('/uploads/original.webp');
  });

  it('uses the reviewed English diagram for the pressure article without changing its Chinese cover', () => {
    const item = {
      slug: 'atmosphere-furnace-pressure-fluctuation-process-or-equipment',
      coverImage: '/uploads/original.webp',
    };
    expect(resolveNewsImage(item, { locale: 'en' })).toBe(
      '/images/news/english/atmosphere-pressure-review.png',
    );
    expect(resolveNewsImage(item, { locale: 'zh' })).toBe('/uploads/original.webp');
    expect(item.coverImage).toBe('/uploads/original.webp');
  });

  it('keeps an explicit English cover ahead of the reviewed fallback', () => {
    expect(resolveNewsImage({
      slug: 'atmosphere-furnace-pressure-fluctuation-process-or-equipment',
      coverImage: '/uploads/original.webp',
      englishCoverImage: '/images/news/english-custom.webp',
    }, { locale: 'en' })).toBe('/images/news/english-custom.webp');
  });

  it('preserves the shared original for an unrelated article without an English cover', () => {
    expect(resolveNewsImage({ slug: 'unreviewed-article', coverImage: '/uploads/original.webp' }, { locale: 'en' })).toBe(
      '/uploads/original.webp',
    );
  });
});
