import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: () => unknown) => { let value: unknown; return () => value ??= fn(); },
}));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('404'); } }));
const overrides = vi.hoisted(() => ({
  dates: undefined as { sourceDate: string; datePublished: string; dateModified: string } | undefined,
  buyerLinks: undefined as { href: string; label: string; text: string }[] | undefined,
}));
vi.mock('@/lib/cases/english', async (original) => {
  const actual = await original<typeof import('@/lib/cases/english')>();
  return {
    ...actual,
    getEnglishCase: (slug: string) => {
      const item = actual.getEnglishCase(slug);
      return item && overrides.dates ? { ...item, ...overrides.dates } : item;
    },
  };
});
vi.mock('@/lib/cases/buyer-links-en', async (original) => {
  const actual = await original<typeof import('@/lib/cases/buyer-links-en')>();
  return {
    ...actual,
    getEnglishCaseBuyerLinks: (slug: string) => overrides.buyerLinks ?? actual.getEnglishCaseBuyerLinks(slug),
  };
});
import { EnglishCaseArticle, EnglishCaseIndex, englishCaseMetadata } from './EnglishCasePages';
import { getEnglishCases, getEnglishCaseResults } from '@/lib/cases/english';
import { getPublicCases } from '@/lib/cases/server';
import { getCaseBuyerLinks } from '@/lib/buyer-selection-guides';

import { parseCaseQuery } from '@/lib/cases/query';
import englishSlugs from '@/lib/cases/english-slugs.json';
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

const sorted = (values: Iterable<string>) => [...values].sort();
const approvedSlug = 'henan-annealing-solution-line';
const renderArticle = (slug: string) =>
  renderToStaticMarkup(createElement(EnglishCaseArticle, { slug, searchParams: {} }));
const articleJsonLd = (html: string) =>
  JSON.parse(html.match(/<script[^>]+id="case-article-jsonld"[^>]*>(.*?)<\/script>/s)![1]);

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
  it('dates the English page in China time and presents no publication date of its own', () => {
    // Just after midnight in China is still the previous day in UTC.
    overrides.dates = {
      sourceDate: '2017-07-26T00:30:00+08:00',
      datePublished: '2026-07-24T20:30:00+08:00',
      dateModified: '2026-09-17T01:00:00+08:00',
    };
    try {
      const html = renderArticle(approvedSlug);
      expect(html).toMatch(/Source date: <time [^>]*>26 July 2017<\/time>/);
      expect(html).toMatch(/Source updated: <time [^>]*>17 September 2026<\/time>/);
      expect(html).not.toMatch(/Published:/);
      expect(html).not.toContain('24 July 2026');
      const [article] = articleJsonLd(html);
      expect(article).not.toHaveProperty('datePublished');
      expect(article.dateModified).toBe('2026-09-17T01:00:00+08:00');
      const meta = englishCaseMetadata(approvedSlug);
      expect(meta.openGraph).not.toHaveProperty('publishedTime');
      expect(meta.openGraph).toHaveProperty('modifiedTime', '2026-09-17T01:00:00+08:00');
    } finally {
      overrides.dates = undefined;
    }
  });
  it('drops withdrawn buyer guides from the English page and its contents list', () => {
    const withdrawn = [
      { href: '/en/solutions/continuous-heat-treatment-line#guide', label: 'Withdrawn solution guide', text: 'Withdrawn.' },
      { href: '/en/%61rticles/gongye-lu-baojia-canshu', label: 'Encoded withdrawn guide', text: 'Encoded.' },
    ];
    try {
      overrides.buyerLinks = [...withdrawn, { href: '/en/products#selection', label: 'Live selection page', text: 'Live.' }];
      const html = renderArticle(approvedSlug);
      expect(html).toContain('href="/en/products#selection"');
      expect(html).toContain('href="#case-buyer-selection"');
      expect(html).not.toMatch(/Withdrawn solution guide|Encoded withdrawn guide|\/en\/solutions\/|%61rticles/);
      overrides.buyerLinks = withdrawn;
      expect(renderArticle(approvedSlug)).not.toContain('case-buyer-selection');
    } finally {
      overrides.buyerLinks = undefined;
    }
  });
  it('offers the record type filter only when it can narrow the public records', () => {
    const types = new Set(getEnglishCases().map((item) => item.contentType));
    const html = renderToStaticMarkup(createElement(EnglishCaseIndex, { query: parseCaseQuery({}) }));
    expect(html.includes('name="type"')).toBe(types.size > 1);
    // An active filter stays visible so the reader can clear it.
    const filtered = renderToStaticMarkup(createElement(EnglishCaseIndex, { query: parseCaseQuery({ type: 'proposal' }) }));
    expect(filtered).toContain('name="type"');
  });
});
