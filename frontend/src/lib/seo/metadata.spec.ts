import type { Metadata } from 'next';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react', () => ({
  cache: <Args extends unknown[], Return>(fn: (...args: Args) => Return) => fn,
}));

import { createAboutPageMetadata } from '@/lib/about';
import { createNewsListMetadata, getNewsCanonicalUrl } from '@/lib/news';
import { buildMetadata } from '@/lib/seo/metadata';
import { createStrengthMetadata } from '@/lib/strength';

function titleText(metadata: Metadata) {
  const title = metadata.title;

  if (typeof title === 'string') return title;
  if (title && typeof title === 'object' && 'absolute' in title) return title.absolute;

  return '';
}

describe('SEO metadata generation', () => {
  it('keeps news list metadata localized after migrating to buildMetadata', async () => {
    const metadata = await createNewsListMetadata('zh');

    expect(titleText(metadata)).toBe('资料中心｜苏能工业炉');
    expect(metadata.alternates?.canonical).toBe('https://www.jssngyl.cn/zh/news');
    expect(metadata.alternates?.languages).toEqual({
      'zh-CN': 'https://www.jssngyl.cn/zh/news',
      'en-US': 'https://www.jssngyl.cn/en/news',
      'x-default': 'https://www.jssngyl.cn/zh/news',
    });
    expect(metadata.openGraph).toMatchObject({
      locale: 'zh_CN',
      url: 'https://www.jssngyl.cn/zh/news',
      type: 'website',
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: '资料中心｜苏能工业炉',
    });
  });

  it('keeps strength category metadata on the shared strength keyword set', async () => {
    const metadata = await createStrengthMetadata('en', 'honors');

    expect(titleText(metadata)).toBe('Honors | Suneng Industrial Furnace');
    expect(metadata.alternates?.canonical).toBe('https://www.jssngyl.cn/en/strength/honors');
    expect(metadata.keywords).toEqual(
      expect.arrayContaining([
        'company strength',
        'industrial furnace manufacturing capability',
        'heat-treatment furnace production equipment',
      ]),
    );
    expect(metadata.openGraph).toMatchObject({
      locale: 'en_US',
      url: 'https://www.jssngyl.cn/en/strength/honors',
    });
  });

  it('keeps about helper metadata canonicalized per locale', async () => {
    const metadata = await createAboutPageMetadata('profile', 'zh', '/about');

    expect(titleText(metadata)).toBe('公司简介｜苏能工业炉');
    expect(metadata.alternates?.canonical).toBe('https://www.jssngyl.cn/zh/about');
    expect(metadata.alternates?.languages).toEqual({
      'zh-CN': 'https://www.jssngyl.cn/zh/about',
      'en-US': 'https://www.jssngyl.cn/en/about',
      'x-default': 'https://www.jssngyl.cn/zh/about',
    });
  });

  it('accepts string keywords for migrated detail helpers', () => {
    const metadata = buildMetadata({
      title: 'Article Detail',
      description: 'Article description',
      path: '/zh/news/example',
      pageKey: 'news-detail-example',
      locale: 'zh',
      keywords: 'alpha, beta',
      type: 'article',
      publishedTime: '2026-06-29',
      modifiedTime: '2026-06-29',
    });

    expect(metadata.keywords).toEqual(expect.arrayContaining(['alpha', 'beta', '工业炉']));
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-06-29',
      modifiedTime: '2026-06-29',
    });
  });

  it('keeps canonical URL helper on absolute localized URLs', () => {
    expect(getNewsCanonicalUrl('en', 'sample-slug')).toBe(
      'https://www.jssngyl.cn/en/news/sample-slug',
    );
  });
});
