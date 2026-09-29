import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Locale } from '@/types/site';
import { NewsPagination } from './NewsPagination';

const filters = {
  query: '炉 & 报价',
  topic: 'procurement',
  furnace: 'trolley',
  sort: 'updated',
} as const;

function pageHref(locale: Locale, page: number) {
  const params = new URLSearchParams({
    q: filters.query,
    topic: filters.topic,
    furnace: filters.furnace,
    sort: filters.sort,
  });
  if (page > 1) params.set('page', String(page));
  return `/${locale}/news?${params.toString()}`;
}

function render(locale: Locale, page: number, pageCount = 12) {
  return renderToStaticMarkup(
    createElement(NewsPagination, {
      locale,
      page,
      pageCount,
      href: (nextPage) => pageHref(locale, nextPage),
      ariaLabel: locale === 'en' ? 'Resource pages' : '资料分页',
    }),
  );
}

function links(html: string) {
  return Array.from(html.matchAll(/<a\b([^>]*)>(.*?)<\/a>/gs), ([, attributes, text]) => ({
    text,
    href: attributes.match(/\bhref="([^"]*)"/)?.[1].replace(/&amp;/g, '&') ?? '',
  }));
}

describe('news pagination rendered behaviour', () => {
  for (const locale of ['zh', 'en'] as const) {
    const labels =
      locale === 'en'
        ? { first: 'First', previous: 'Previous', next: 'Next', last: 'Last', go: 'Go' }
        : { first: '首页', previous: '上一页', next: '下一页', last: '尾页', go: '确定' };

    it(`disables first/previous and retains working last/next links on the first ${locale} page`, () => {
      const html = render(locale, 1);
      for (const label of [labels.first, labels.previous]) {
        expect(html).toMatch(new RegExp(`<span[^>]*aria-disabled="true"[^>]*>${label}</span>`));
        expect(links(html).some((link) => link.text === label)).toBe(false);
      }
      for (const [label, page] of [
        [labels.next, 2],
        [labels.last, 12],
      ] as const) {
        const link = links(html).find((item) => item.text === label);
        expect(new URL(link!.href, 'https://site.test').searchParams.get('page')).toBe(
          String(page),
        );
      }
      expect(html).toMatch(new RegExp(`<button[^>]*>${labels.go}</button>`));
      expect(html).toContain(
        locale === 'en' ? 'aria-label="Resource pages"' : 'aria-label="资料分页"',
      );
    });

    it(`disables last/next and keeps five numbered links on the last ${locale} page`, () => {
      const html = render(locale, 12);
      for (const label of [labels.next, labels.last]) {
        expect(html).toMatch(new RegExp(`<span[^>]*aria-disabled="true"[^>]*>${label}</span>`));
        expect(links(html).some((link) => link.text === label)).toBe(false);
      }
      expect(
        links(html)
          .filter((link) => /^\d+$/.test(link.text))
          .map((link) => Number(link.text)),
      ).toEqual([8, 9, 10, 11, 12]);
      expect(html.match(/aria-current="page"/g)).toHaveLength(1);
      expect(html).toMatch(/<a\b[^>]*aria-current="page"[^>]*>12<\/a>/);
      expect(links(html).some((link) => link.text === labels.first)).toBe(true);
      expect(links(html).some((link) => link.text === labels.previous)).toBe(true);
      expect(html).toContain(locale === 'en' ? 'aria-label="Page 12"' : 'aria-label="第 12 页"');
    });

    it(`preserves search and all filters in every real ${locale} pagination link`, () => {
      const renderedLinks = links(render(locale, 5));
      expect(renderedLinks.length).toBeGreaterThan(5);
      for (const link of renderedLinks) {
        const url = new URL(link.href, 'https://site.test');
        expect(url.pathname).toBe(`/${locale}/news`);
        expect(url.searchParams.get('q')).toBe(filters.query);
        expect(url.searchParams.get('topic')).toBe(filters.topic);
        expect(url.searchParams.get('furnace')).toBe(filters.furnace);
        expect(url.searchParams.get('sort')).toBe(filters.sort);
      }
    });
  }

  it('hides pagination when there is only one page', () => {
    expect(render('zh', 1, 1)).toBe('');
    expect(render('en', 1, 1)).toBe('');
  });
});
