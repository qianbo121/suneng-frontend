import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
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
const fixture = vi.hoisted(() => ({
  slug: 'link-filter-fixture',
  buyerLinks: undefined as { href: string; label: string; text: string }[] | undefined,
}));
vi.mock('@/lib/buyer-selection-guides', async (original) => {
  const actual = await original<typeof import('@/lib/buyer-selection-guides')>();
  return {
    ...actual,
    getCaseBuyerLinks: (slug: string) => fixture.buyerLinks ?? actual.getCaseBuyerLinks(slug),
  };
});
// A non-curated public case whose source still lists withdrawn destinations.
vi.mock('@/lib/cases/server', async (original) => {
  const actual = await original<typeof import('@/lib/cases/server')>();
  const record = () => {
    const source = actual.getCaseArticle('henan-annealing-solution-line');
    if (!source) throw new Error('approved source case missing');
    return {
      ...source,
      id: fixture.slug,
      slug: fixture.slug,
      relatedCases: [],
      relatedLinks: [
        { title: '已撤回的方案页', href: '/zh/solutions/continuous-heat-treatment-line' },
        { title: '编码后的撤回文章', href: '/zh/%61rticles/gongye-lu-baojia-canshu' },
        { title: '未批准的案例', href: '/zh/case/jining-support-roller-heat-treatment-line' },
        { title: '服务范围', href: '/zh/service' },
      ],
    };
  };
  return {
    ...actual,
    getPublicCases: () => [...actual.getPublicCases(), record()],
    getCaseArticle: (slug: string) => (slug === fixture.slug ? record() : actual.getCaseArticle(slug)),
  };
});
import { CaseArticlePage } from './CaseArticlePage';

const render = () =>
  renderToStaticMarkup(createElement(CaseArticlePage, { slug: fixture.slug, searchParams: {} }));
const WITHDRAWN = /\/zh\/(solutions|%61rticles|articles)\/|jining-support-roller|已撤回|撤回文章|未批准/;

describe('case pages hide withdrawn destinations', () => {
  it('keeps related links that are public and drops the rest', () => {
    const html = render();
    expect(html).toContain('href="/zh/service"');
    expect(html).toContain('href="/zh/products"');
    expect(html).not.toMatch(WITHDRAWN);
  });

  it('shows only live buyer guides and omits the section when none remain', () => {
    const withdrawn = [
      { href: '/zh/solutions/rechuli-lu-changjia#guide', label: '已撤回的选型指南', text: '撤回。' },
      { href: '/zh/%61rticles/gongye-lu-baojia-canshu', label: '编码后的撤回文章', text: '撤回。' },
    ];
    try {
      fixture.buyerLinks = [...withdrawn, { href: '/zh/products#selection', label: '在用的选型页', text: '在用。' }];
      const html = render();
      expect(html).toContain('id="case-buyer-selection"');
      expect(html).toContain('href="/zh/products#selection"');
      expect(html).not.toMatch(WITHDRAWN);
      fixture.buyerLinks = withdrawn;
      expect(render()).not.toContain('case-buyer-selection');
    } finally {
      fixture.buyerLinks = undefined;
    }
  });
});
