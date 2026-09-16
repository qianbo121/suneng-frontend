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
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

const sorted = (values: Iterable<string>) => [...values].sort();

describe('complete English case integration', () => {
  it("keeps translated sources registered and publishes only owner-approved English pages", () => {
    expect(englishSlugs).toHaveLength(148);
    expect(sorted(getEnglishCases().map((item) => item.slug))).toEqual(sorted(PUBLIC_ENGLISH_CASE_SLUGS));
    expect(sorted(getPublicCases().map((item) => item.slug))).toEqual(sorted(PUBLIC_CASE_SLUGS));
    for (const slug of englishSlugs) {
      const render = () => renderToStaticMarkup(createElement(EnglishCaseArticle, { slug, searchParams: {} }));
      if (PUBLIC_ENGLISH_CASE_SLUGS.has(slug)) expect(render, slug).not.toThrow();
      else expect(render, slug).toThrow('404');
    }
  });
  it('lists only table-of-contents anchors that exist on the page', () => {
    for (const item of getEnglishCases()) {
      const html = renderToStaticMarkup(createElement(EnglishCaseArticle, { slug: item.slug, searchParams: {} }));
      for (const [, id] of html.matchAll(/href="#([^"]+)"/g))
        expect(html, `${item.slug} #${id}`).toContain(`id="${id}"`);
    }
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
  it("searches only approved English records and links no withdrawn buyer guides", () => {
    const found = getEnglishCaseResults(parseCaseQuery({ q: 'furnace' })).items.map((item) => item.slug);
    expect(found.every((slug) => PUBLIC_ENGLISH_CASE_SLUGS.has(slug))).toBe(true);
    expect(found).toContain('henan-annealing-solution-line');
    expect(getPublicCases().filter(item=>getCaseBuyerLinks(item.slug).length)).toEqual([]);
  });
});
