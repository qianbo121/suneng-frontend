import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveNewsImage } from './news';

// The resolver is pure; React's server cache is supplied by Next outside this unit test.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));

describe('localized news cover', () => {
  afterEach(() => vi.unstubAllEnvs());

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
