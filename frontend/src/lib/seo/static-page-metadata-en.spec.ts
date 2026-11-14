import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({ usePathname: () => '/en/about' }));

import { ENGLISH_STATIC_PAGE_METADATA } from '@/lib/seo/static-page-metadata-en';
import { generateMetadata as aboutMetadata } from '@/app/[locale]/about/page';
import { generateMetadata as serviceMetadata } from '@/app/[locale]/service/page';
import { ABOUT_ZH_SEO } from '@/components/about/AboutZhContent';
import { servicePages } from '@/components/service-pages/service-content';
import { getReviewedPageCopy } from './reviewed-page-copy';

describe('English static page metadata', () => {
  it('keeps every title and description within search-result limits', () => {
    for (const metadata of Object.values(ENGLISH_STATIC_PAGE_METADATA)) {
      expect(metadata.title.length).toBeLessThanOrEqual(60);
      expect(metadata.description.length).toBeLessThanOrEqual(160);
    }
  });

  it.each([
    ['about', aboutMetadata],
    ['service', serviceMetadata],
  ] as const)('uses dedicated search copy for the actual English %s route', async (kind, generate) => {
    const metadata = await generate({ params: Promise.resolve({ locale: 'en' }) });
    const copy = ENGLISH_STATIC_PAGE_METADATA[kind];
    const reviewed = getReviewedPageCopy(`/en/${kind}`, copy.title, copy.description);
    expect(metadata.title).toEqual({ absolute: reviewed.title });
    expect(metadata.description).toBe(copy.description);
    expect(metadata.openGraph?.description).toBe(copy.description);
    expect(metadata.alternates?.canonical).toBe(`https://www.jssngyl.cn/en/${kind}`);
  });

  it('uses reviewed Chinese about copy and preserves the service description', async () => {
    const about = await aboutMetadata({ params: Promise.resolve({ locale: 'zh' }) });
    const service = await serviceMetadata({ params: Promise.resolve({ locale: 'zh' }) });
    expect(about.description).toBe(getReviewedPageCopy('/zh/about', '', ABOUT_ZH_SEO.description).description);
    expect(service.description).toBe(servicePages.overview.metadataDescription);
  });
});
