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

  it('preserves the shared original when no English cover is present', () => {
    expect(resolveNewsImage({ coverImage: '/uploads/original.webp' }, { locale: 'en' })).toBe(
      '/uploads/original.webp',
    );
  });
});
