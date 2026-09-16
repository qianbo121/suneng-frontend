import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CaseArticlePage } from './CaseArticlePage';
import { INTERNAL_CAPTION_NOTE } from './CaseCoverCaption';
import { AnnealingCaseResources } from './AnnealingCaseResources';
import { getPublicCases } from '@/lib/cases/server';
import { PUBLIC_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  // Match the request cache: repeated page renders must not reload and sanitize
  // the whole content directory twice for every case in this check.
  cache: (fn: () => unknown) => {
    let value: unknown;
    return () => (value ??= fn());
  },
}));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('404');
  },
}));

const curated = new Set([
  'henan-annealing-solution-line',
  'jining-support-roller-heat-treatment-line',
]);

function expectPublishedBody(rendered: string, original: string, slug: string) {
  // Compare the rendered lead + body in order, including every table and link.
  const fragments = [
    ...rendered.matchAll(
      /<div class="[^"]* news-article [^"]*">([\s\S]*?)<\/div>(?=<\/div>|<section)/g,
    ),
  ];
  expect(fragments.map((match) => match[1]).join(''), slug).toBe(original);
}

describe('case resources preserve the published content', () => {
  it('renders registered covers in the reading header with their reader-facing caption', () => {
    for (const item of getPublicCases()) {
      const html = renderToStaticMarkup(
        createElement(CaseArticlePage, { slug: item.slug, searchParams: {} }),
      );
      if (!item.cover) {
        expect(html, item.slug).not.toContain('class="case-article-cover"');
        continue;
      }
      expect(html.match(/class="case-article-cover"/g), item.slug).toHaveLength(1);
      const figure = html.split('class="case-article-cover"')[1].split('</figure>')[0];
      expect(figure, item.slug).toContain(`alt="${item.cover.alt}"`);
      expect(figure, item.slug).toContain(`object-fit:${item.cover.fit || 'contain'}`);
      // An approved cover must say what it is, in reader-facing words rather than a production note.
      expect(item.cover.caption, item.slug).toBeTruthy();
      expect(INTERNAL_CAPTION_NOTE.test(item.cover.caption ?? ''), item.slug).toBe(false);
      expect(figure, item.slug).toContain(`<figcaption>${item.cover.caption}</figcaption>`);
      expect(html.indexOf('class="case-article-header"'), item.slug).toBeLessThan(
        html.indexOf('class="case-article-cover"'),
      );
      expect(html, item.slug).not.toContain('class="case-article-dates"');
      expectPublishedBody(html, item.html, item.slug);
    }
  });

  it("returns only owner-approved case records", () => {
    expect(getPublicCases().map((item) => item.slug).sort()).toEqual([...PUBLIC_CASE_SLUGS].sort());
  });

  it("keeps the approved Henan page free of links to withdrawn guides and solutions", () => {
    const html = renderToStaticMarkup(createElement(CaseArticlePage, { slug: 'henan-annealing-solution-line', searchParams: {} }));
    expect(html).toContain('<figcaption>参考图，非项目现场照片</figcaption>');
    expect(html).not.toMatch(/href="\/zh\/(solutions|articles)(\/|")/);
    expect(html).toContain('href="/zh/products/detail/annealing-solution-line"');
    expect(html).toContain('href="/zh/products"');
  });

  it("rejects the old eight-furnace article with 404", () => {
    expect(()=>renderToStaticMarkup(createElement(CaseArticlePage,{slug:'alloy-eight-furnaces-acceptance-supply-boundaries-proposal',searchParams:{}}))).toThrow('404');
  });

  it("keeps at least two live destinations when curated cards point at withdrawn pages", () => {
    for (const variant of ['annealing', 'support-roller'] as const) {
      const html = renderToStaticMarkup(createElement(AnnealingCaseResources, {
        compact: true, backHref: '/zh/case', caseId: 'fixture', sourceSummary: '', variant,
      }));
      expect(html, variant).toMatch(/data-count="[2-9]"/);
      expect(html, variant).not.toMatch(/href="\/zh\/(solutions|articles)(\/|")/);
      expect(html, variant).toContain('href="/zh/products"');
    }
  });

  it("rejects formerly curated articles that the owner has not approved", () => {
    const pending = [...curated].filter((slug) => !PUBLIC_CASE_SLUGS.has(slug));
    expect(pending).toContain('jining-support-roller-heat-treatment-line');
    for(const slug of pending)expect(()=>renderToStaticMarkup(createElement(CaseArticlePage,{slug,searchParams:{}}))).toThrow('404');
  });
});
