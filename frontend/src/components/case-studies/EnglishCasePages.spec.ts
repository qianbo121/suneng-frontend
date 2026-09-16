import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: () => unknown) => { let value: unknown; return () => value ??= fn(); },
}));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('404'); } }));
import { EnglishCaseArticle, englishCaseMetadata } from './EnglishCasePages';
import { getEnglishCases, getEnglishCaseResults } from '@/lib/cases/english';
import { getPublicCases } from '@/lib/cases/server';
import { getCaseBuyerLinks } from '@/lib/buyer-selection-guides';

import { parseCaseQuery } from '@/lib/cases/query';
import englishSlugs from '@/lib/cases/english-slugs.json';

describe('complete English case integration', () => {
  it("keeps translated sources registered but withdraws every public counterpart", () => {
    expect(englishSlugs).toHaveLength(148);
    expect(getEnglishCases()).toEqual([]);
    expect(getPublicCases()).toEqual([]);
    for(const slug of englishSlugs)expect(()=>renderToStaticMarkup(createElement(EnglishCaseArticle,{slug,searchParams:{}}))).toThrow('404');
  });
  it('renders the complete body, final title, canonical and social titles consistently', () => {
    for (const item of getEnglishCases()) {
      const html = renderToStaticMarkup(createElement(EnglishCaseArticle, { slug: item.slug, searchParams: {} }));
      expect(html, item.slug).toContain(item.html);
      const headline = html.match(/<h1>(.*?)<\/h1>/s)?.[1];
      const decoded = headline?.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      expect(decoded, item.slug).toBe(item.title);
      const meta = englishCaseMetadata(item.slug);
      const seoTitle = (meta.title as { absolute: string }).absolute;
      expect(seoTitle).toContain(item.title);
      expect(meta.openGraph?.title).toBe(seoTitle);
      expect(meta.twitter?.title).toBe(seoTitle);
      expect(meta.alternates?.canonical).toContain(`/en/case/${item.slug}`);
      expect(meta.alternates?.languages?.['zh-CN']).toContain(`/zh/case/${item.slug}`);
      const data = JSON.parse(html.match(/<script[^>]+id="case-article-jsonld"[^>]*>(.*?)<\/script>/s)![1]);
      expect(data[0].headline).toBe(item.title);
      expect(data[0].inLanguage).toBe('en-US');
      const result = getEnglishCaseResults(parseCaseQuery({ q: item.title }));
      expect(result.items.some((record) => record.id === item.id), item.slug).toBe(true);
    }
  });
  it("returns no withdrawn guide search results in English", () => {
    expect(getEnglishCaseResults(parseCaseQuery({q:'furnace'})).items).toEqual([]);
    expect(getPublicCases().filter(item=>getCaseBuyerLinks(item.slug).length)).toEqual([]);
  });
});
