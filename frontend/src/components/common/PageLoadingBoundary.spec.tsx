import { PassThrough } from 'node:stream';
import { createElement, Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { PageLoadingBoundary } from './PageLoadingBoundary';
import { APPROVED_GUIDE_PATHS, APPROVED_PROCUREMENT_PATHS, isWithdrawnRequestPath } from '@/lib/publication-scope';
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

const route = vi.hoisted(() => ({ pathname: '/zh/news' as string | null }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));
vi.mock('@/components/common/LoadingFeedback', () => ({
  LoadingFeedback: () => createElement('div', null, 'Shared pending'),
}));

// Exercise streamed HTML with delayed page data: a parent Suspense boundary
// otherwise moves real links into a hidden segment until its script runs.
async function streamDelayedPage(pathname: string, listOwnBoundary = false) {
  route.pathname = pathname;
  let ready = false;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  const timer = setTimeout(() => { ready = true; release(); }, 40);
  function Page() {
    if (!ready) throw pending;
    return createElement('section', null,
      createElement('h1', null, 'Technical resources'),
      createElement('a', { href: '/zh/news/example' }, 'Article entry'),
    );
  }
  const page = createElement(Page);
  const children = listOwnBoundary
    ? createElement(Suspense, { fallback: createElement('div', null, 'List pending') }, page)
    : page;
  try {
    return await new Promise<string>((resolve, reject) => {
      const output = new PassThrough();
      let html = '';
      output.on('data', (chunk) => { html += chunk.toString(); });
      output.on('end', () => resolve(html));
      output.on('error', reject);
      const stream = renderToPipeableStream(
        <PageLoadingBoundary locale={pathname.startsWith('/en') ? 'en' : 'zh'}>{children}</PageLoadingBoundary>,
        { onShellReady() { stream.pipe(output); }, onShellError: reject, onError: reject },
      );
    });
  } finally {
    clearTimeout(timer);
  }
}

describe('plain news entry initial HTML', () => {
  it.each(['/zh/news', '/en/news', '/zh/news-prerendered/2', '/en/news-prerendered/2'])(
    'keeps delayed article links directly visible at %s', async (pathname) => {
      const html = await streamDelayedPage(pathname);
      expect(html).toContain('<h1>Technical resources</h1>');
      expect(html).toContain('href="/zh/news/example"');
      expect(html).not.toMatch(/<div hidden\b/);
      expect(html).not.toContain('Shared pending');
    },
  );

  it('retains the search and filter route own loading boundary', async () => {
    const html = await streamDelayedPage('/zh/news', true);
    expect(html).toContain('List pending');
    expect(html).toMatch(/<div hidden\b/);
    expect(html).toContain('href="/zh/news/example"');
    expect(html).not.toContain('Shared pending');
  });

  it('keeps an unrelated route protected by the shared boundary', async () => {
    const html = await streamDelayedPage('/zh/products/animation-review');
    expect(html).toContain('Shared pending');
    expect(html).toMatch(/<div hidden\b/);
  });

  it('keeps article detail content directly visible', async () => {
    const html = await streamDelayedPage('/zh/news/example');
    expect(html).toContain('<h1>Technical resources</h1>');
    expect(html).not.toMatch(/<div hidden\b/);
    expect(html).not.toContain('Shared pending');
  });
});

describe('public page initial HTML with delayed data', () => {
  const informationRoutes = ['products', 'about', 'contact', 'partner', 'strength', 'strength/honors'];
  const serviceRoutes = [
    'service',
    'service/furnace-renovation-overhaul',
    'service/installation-after-sales',
    'service/furnace-relocation-restart',
    'service/selection-retrofit-guide',
  ];
  const readableRoutes = [
    '/zh/inquiry',
    '/zh/inquiry/',
    ...['zh', 'en'].flatMap((locale) => [
      `/${locale}`,
      `/${locale}/products/detail/box-furnace`,
      `/${locale}/products/detail/annealing-solution-line/`,
      `/${locale}/products/detail/copper-wire-annealing-line/inquiry-checklist`,
      `/${locale}/products/detail/copper-wire-annealing-line/inquiry-checklist/`,
      ...informationRoutes.map((path) => `/${locale}/${path}`),
      ...serviceRoutes.map((path) => `/${locale}/${path}`),
      `/${locale}/case`,
    ]),
    ...APPROVED_GUIDE_PATHS,
    ...APPROVED_PROCUREMENT_PATHS,
    ...[...PUBLIC_CASE_SLUGS].map((slug) => `/zh/case/${slug}`),
    ...[...PUBLIC_ENGLISH_CASE_SLUGS].map((slug) => `/en/case/${slug}`),
  ];

  it.each(readableRoutes)('keeps the heading and body outside streamed hidden segments at %s', async (pathname) => {
    const html = await streamDelayedPage(pathname);
    expect(html).toContain('<h1>Technical resources</h1>');
    expect(html).toContain('href="/zh/news/example"');
    expect(html).not.toMatch(/<div hidden\b/);
    expect(html).not.toContain('Shared pending');
  });

  it.each(['/en/inquiry', '/en/inquiry/', ...['zh', 'en'].flatMap((locale) => [
    `/${locale}/inquiry/unknown-page`,
    `/${locale}/products/detail/unknown-product/inquiry-checklist`,
    `/${locale}/products/detail/copper-wire-annealing-line/inquiry-checklist/unknown-page`,
    `/${locale}/products/detail/box-furnace/inquiry`,
    `/${locale}/service/unknown-service`,
    `/${locale}/about/unknown-page`,
    `/${locale}/strength/unknown-category`,
  ])])('keeps unpublished inquiry and unlisted routes behind their existing boundary at %s', async (pathname) => {
    const html = await streamDelayedPage(pathname);
    expect(html).toContain('Shared pending');
    expect(html).toMatch(/<div hidden\b/);
  });

  it.each([
    ...[...APPROVED_GUIDE_PATHS].map((path) => path.replace('/zh/', '/en/')),
    ...['zh', 'en'].flatMap((locale) => [
      `/${locale}/case/anonymous-tsingshan-1250-renovation`,
      `/${locale}/case/jining-support-roller-heat-treatment-line`,
    ]),
  ])('does not widen the existing publication scope at %s', async (pathname) => {
    expect(isWithdrawnRequestPath(pathname)).toBe(true);
    const html = await streamDelayedPage(pathname);
    expect(html).toContain('Shared pending');
    expect(html).toMatch(/<div hidden\b/);
  });
});
