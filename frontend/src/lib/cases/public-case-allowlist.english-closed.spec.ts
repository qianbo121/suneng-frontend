import { describe, expect, it, vi } from 'vitest';

// Chinese page approved, English copy not yet approved.
vi.mock('./public-case-allowlist', () => {
  const REVIEWED_PUBLIC_CASES = [{
    id: 'henan-annealing-solution', slug: 'henan-annealing-solution-line', batch: 1,
    english: false, approvedBy: 'site-owner', approvedAt: '2026-09-17',
  }];
  return {
    REVIEWED_PUBLIC_CASES,
    PUBLIC_CASE_SLUGS: new Set(['henan-annealing-solution-line']),
    PUBLIC_ENGLISH_CASE_SLUGS: new Set<string>(),
  };
});
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('404'); } }));
vi.mock('@/lib/api/news', () => ({
  getAllNewsForDecisionCenter: vi.fn(async () => ({
    data: [{ id: 1, categoryId: 1, titleZh: '标准新闻', slug: 'canonical-news', publishDate: '2026-06-01T00:00:00.000Z', status: 'published', isPublished: true }],
    error: null,
  })),
}));

import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { isZhOnlyPath, localizeOrHideHref } from '@/lib/i18n/zh-only';
import { getLocalizedNavigation, getRouteLabelMap } from '@/mock/navigation';
import { getPublicCases } from './server';
import { getEnglishCases } from './english';
import buildSitemap from '@/app/sitemap';
import CasePage, { generateMetadata } from '@/app/[locale]/case/page';

const henan = 'henan-annealing-solution-line';
const props = (locale: string) => ({ params: Promise.resolve({ locale }), searchParams: Promise.resolve({}) });

describe('a case approved in Chinese only', () => {
  it('keeps the English hub and page withdrawn', () => {
    expect(isWithdrawnTechnicalPath('/zh/case')).toBe(false);
    expect(isWithdrawnTechnicalPath(`/zh/case/${henan}`)).toBe(false);
    expect(isWithdrawnTechnicalPath('/en/case')).toBe(true);
    expect(isWithdrawnTechnicalPath(`/en/case/${henan}`)).toBe(true);
    expect(getPublicCases().map((item) => item.slug)).toEqual([henan]);
    expect(getEnglishCases()).toEqual([]);
  });

  it('names the case hub only for Chinese readers and never switches them to a missing English page', () => {
    // Neither menu lists the hub now, so the locale gate is read where it still
    // shows: the breadcrumb names the hub in Chinese and must not in English.
    for (const locale of ['zh', 'en'] as const)
      expect(getLocalizedNavigation(locale).some((item) => item.key === 'cases')).toBe(false);
    expect(getRouteLabelMap('zh').get('/case')).toBe('项目案例');
    expect(getRouteLabelMap('en').has('/case')).toBe(false);
    expect(isZhOnlyPath('/zh/case')).toBe(true);
    expect(isZhOnlyPath(`/zh/case/${henan}`)).toBe(true);
    expect(localizeOrHideHref(`/zh/case/${henan}`, 'en')).toBeNull();
    expect(localizeOrHideHref(`/zh/case/${henan}`, 'zh')).toBe(`/zh/case/${henan}`);
  });

  it('refuses the English case index route and its metadata', async () => {
    await expect(CasePage(props('en'))).rejects.toThrow('404');
    await expect(generateMetadata(props('en'))).rejects.toThrow('404');
    const zh = await generateMetadata(props('zh'));
    expect(JSON.stringify(zh.alternates ?? {})).not.toContain('/en/case');
  });

  it('lists only Chinese case addresses and no English alternates in the sitemap', async () => {
    const entries = await buildSitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain('https://www.jssngyl.cn/zh/case');
    expect(urls).toContain(`https://www.jssngyl.cn/zh/case/${henan}`);
    expect(urls.some((url) => url.includes('/en/case'))).toBe(false);
    for (const entry of entries)
      expect(Object.values(entry.alternates?.languages ?? {}).some((url) => String(url).includes('/en/case')), entry.url).toBe(false);
  });
});
