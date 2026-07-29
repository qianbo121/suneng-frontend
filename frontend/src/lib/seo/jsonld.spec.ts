import { describe, expect, it } from 'vitest';

import { getArticleJsonLd, getOrganizationJsonLd } from '@/lib/seo/jsonld';

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
});
