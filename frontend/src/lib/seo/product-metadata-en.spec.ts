import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/en/products/detail/trolley-furnace',
  notFound: () => { throw new Error('404'); },
}));

import { ENGLISH_PRODUCT_METADATA } from '@/lib/seo/product-metadata-en';
import { generateMetadata } from '@/app/[locale]/products/detail/[slug]/page';
import { PRODUCT_DETAIL_SEO } from '@/lib/seo/page-data';
import { getEnglishProductionLine } from '@/lib/english-production-lines';

describe('English product metadata', () => {
  it('keeps every product title and description within search-result working limits', () => {
    expect(Object.keys(ENGLISH_PRODUCT_METADATA)).toHaveLength(11);

    for (const [slug, metadata] of Object.entries(ENGLISH_PRODUCT_METADATA)) {
      expect(metadata.title.length, `${slug} title`).toBeLessThanOrEqual(60);
      expect(metadata.description.length, `${slug} description`).toBeLessThanOrEqual(160);
      expect(metadata.title, `${slug} brand`).toMatch(/Suneng/i);
    }
  });

  it.each(Object.entries(ENGLISH_PRODUCT_METADATA))('emits the reviewed search copy from the actual %s route', async (slug, expected) => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en', slug }) });
    expect(metadata.title).toEqual({ absolute: expected.title });
    expect(metadata.description).toBe(expected.description);
    expect(metadata.openGraph?.title).toBe(expected.title);
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
    expect(metadata.alternates?.canonical).toBe(`https://www.jssngyl.cn/en/products/detail/${slug}`);
    expect(metadata.alternates?.languages).toEqual({
      'zh-CN': `https://www.jssngyl.cn/zh/products/detail/${slug}`,
      'en-US': `https://www.jssngyl.cn/en/products/detail/${slug}`,
      'x-default': `https://www.jssngyl.cn/zh/products/detail/${slug}`,
    });
  });

  it('preserves Chinese trolley and English lines without dedicated search copy', async () => {
    const chinese = await generateMetadata({ params: Promise.resolve({ locale: 'zh', slug: 'trolley-furnace' }) });
    const line = await generateMetadata({ params: Promise.resolve({ locale: 'en', slug: 'track-shoe-press-quench-line' }) });
    expect(chinese.description).toBe(PRODUCT_DETAIL_SEO['trolley-furnace'].description);
    expect(line.description).toBe(getEnglishProductionLine('track-shoe-press-quench-line')?.description);
  });
});
