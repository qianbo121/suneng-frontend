import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CaseArticlePage } from './CaseArticlePage';
import { getPublicCases } from '@/lib/cases/server';

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
  it('renders registered covers in the reading header without visible image labels', () => {
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
      expect(figure, item.slug).not.toContain('<figcaption>');
      expect(html.indexOf('class="case-article-header"'), item.slug).toBeLessThan(
        html.indexOf('class="case-article-cover"'),
      );
      expect(html, item.slug).not.toContain('class="case-article-dates"');
      expectPublishedBody(html, item.html, item.slug);
    }
  });

  it("returns no public case records after withdrawal", () => {
    expect(getPublicCases()).toEqual([]);
  });

  it("rejects the old eight-furnace article with 404", () => {
    expect(()=>renderToStaticMarkup(createElement(CaseArticlePage,{slug:'alloy-eight-furnaces-acceptance-supply-boundaries-proposal',searchParams:{}}))).toThrow('404');
  });

  it("rejects formerly curated articles rather than republishing their bookmarks", () => {
    for(const slug of curated)expect(()=>renderToStaticMarkup(createElement(CaseArticlePage,{slug,searchParams:{}}))).toThrow('404');
  });
});
