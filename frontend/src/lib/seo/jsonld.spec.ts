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
    const organization = getOrganizationJsonLd('zh');
    const serialized = JSON.stringify(organization);

    expect(organization).toMatchObject({
      '@type': 'LocalBusiness',
      '@id': 'https://www.jssngyl.cn/#organization',
      telephone: '+86-130-5298-6814',
      foundingDate: '2006-12-22',
      identifier: {
        '@type': 'PropertyValue',
        propertyID: '统一社会信用代码',
        value: '91321204796529654Q',
      },
    });
    expect(organization).not.toHaveProperty('numberOfEmployees');
    expect(serialized).not.toContain('ISO 14001');
    expect(serialized).not.toContain('ISO 45001');
    expect(serialized).not.toContain('姜堰市苏能工业炉有限公司');
    expect(serialized).not.toContain('jssngyl.com');
    expect(serialized).not.toContain('13952644646');
    expect(serialized).not.toContain('88540315');
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
        '@id': 'https://www.jssngyl.cn/#technical-reviewer-tang',
        name: '唐工',
        worksFor: { '@id': 'https://www.jssngyl.cn/#organization' },
      },
    });
    const formerFullName = ['唐', '登', '荣'].join('');
    expect(JSON.stringify(article)).not.toContain(formerFullName);
    expect(JSON.stringify(product)).not.toContain(formerFullName);
    expect(product).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'WebPage',
          dateModified: '2026-07-29',
          reviewedBy: expect.objectContaining({
            '@type': 'Person',
            name: '唐工',
          }),
        }),
      ]),
    );
  });

  it('supports the explicitly confirmed Wang reviewer on authority content', () => {
    const article = getArticleJsonLd({
      slug: 'authority-sample',
      path: '/zh/solutions/authority-sample',
      headline: '权威主题页',
      description: '权威主题页说明',
      datePublished: '2026-07-31T13:40:12+08:00',
      dateModified: '2026-07-31T13:40:12+08:00',
      reviewerName: '王工',
    });

    expect(article).toMatchObject({
      reviewedBy: {
        '@type': 'Person',
        '@id': 'https://www.jssngyl.cn/#technical-reviewer-wang',
        name: '王工',
        worksFor: { '@id': 'https://www.jssngyl.cn/#organization' },
      },
    });
  });

  it('connects product facts to one crawlable Product entity', () => {
    const graph = getProductDetailJsonLd({
      slug: 'trolley-furnace',
      path: '/zh/products/detail/trolley-furnace',
      name: '台车炉',
      alternateName: ['台车式热处理炉'],
      description: '台车炉说明',
      keywords: ['台车炉', '台车式热处理炉'],
      additionalProperties: [
        { name: '额定温度', value: '按工艺要求确认' },
        { name: '台车承重', value: '按工件与装炉量核算', unitText: 't' },
      ],
    });

    const productId = 'https://www.jssngyl.cn/zh/products/detail/trolley-furnace#product';

    expect(graph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'Product',
          '@id': productId,
          alternateName: ['台车式热处理炉'],
          keywords: ['台车炉', '台车式热处理炉'],
          manufacturer: { '@id': 'https://www.jssngyl.cn/#organization' },
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: '额定温度',
              value: '按工艺要求确认',
            },
            {
              '@type': 'PropertyValue',
              name: '台车承重',
              value: '按工件与装炉量核算',
              unitText: 't',
            },
          ],
        }),
        expect.objectContaining({
          '@type': 'WebPage',
          mainEntity: { '@id': productId },
          about: { '@id': 'https://www.jssngyl.cn/#organization' },
        }),
      ]),
    );
  });
});
