import { describe, expect, it } from 'vitest';

import {
  getArticleJsonLd,
  getOrganizationJsonLd,
  getProductDetailJsonLd,
} from '@/lib/seo/jsonld';

describe('SEO JSON-LD entities', () => {
  it('describes content pages as articles with truthful publication dates', () => {
    const article = getArticleJsonLd({
      slug: 'sample',
      path: '/zh/articles/sample',
      headline: '示例文章',
      description: '示例文章说明',
      datePublished: '2026-06-12T15:00:00+08:00',
      dateModified: '2026-06-12T15:00:00+08:00',
    });

    expect(article).toMatchObject({
      '@type': 'Article',
      datePublished: '2026-06-12T15:00:00+08:00',
      dateModified: '2026-06-12T15:00:00+08:00',
      author: { '@id': 'https://www.jssngyl.cn/#organization' },
      publisher: { '@id': 'https://www.jssngyl.cn/#organization' },
      mainEntityOfPage: 'https://www.jssngyl.cn/zh/articles/sample',
    });
  });

  it('keeps one canonical business identity with the real sales phone', () => {
    expect(getOrganizationJsonLd('zh')).toMatchObject({
      '@type': 'LocalBusiness',
      '@id': 'https://www.jssngyl.cn/#organization',
      telephone: '+86-130-5298-6814',
    });
  });

  it('adds the real technical reviewer only to content explicitly marked as reviewed', () => {
    const article = getArticleJsonLd({
      slug: 'reviewed-sample',
      path: '/zh/articles/reviewed-sample',
      headline: '已审核文章',
      description: '已审核文章说明',
      datePublished: '2026-06-12',
      dateModified: '2026-07-29',
      reviewedByTechnicalEngineer: true,
    });
    const product = getProductDetailJsonLd({
      slug: 'trolley-furnace',
      path: '/zh/products/detail/trolley-furnace',
      name: '台车炉',
      description: '台车炉说明',
      dateModified: '2026-07-29',
      reviewedByTechnicalEngineer: true,
    });

    expect(article).toMatchObject({
      reviewedBy: {
        '@type': 'Person',
        '@id': 'https://www.jssngyl.cn/#technical-reviewer-tang-dengrong',
        name: '唐登荣',
        worksFor: { '@id': 'https://www.jssngyl.cn/#organization' },
      },
    });
    expect(product).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'WebPage',
          dateModified: '2026-07-29',
          reviewedBy: expect.objectContaining({
            '@type': 'Person',
            name: '唐登荣',
          }),
        }),
      ]),
    );
  });
});
