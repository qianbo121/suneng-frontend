import { PassThrough } from 'node:stream';
import { createElement, Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { PageLoadingBoundary } from './PageLoadingBoundary';
import { APPROVED_GUIDE_PATHS, APPROVED_PROCUREMENT_PATHS, isWithdrawnRequestPath } from '@/lib/publication-scope';

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
    const html = await streamDelayedPage('/zh/about');
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


describe('product detail initial HTML', () => {
  it.each(['zh', 'en'].flatMap(locale => [
    `/${locale}/products/detail/box-furnace`,
    `/${locale}/products/detail/annealing-solution-line/`,
    `/${locale}/products/detail/copper-wire-annealing-line`,
  ]))('renders delayed product content without a hidden segment at %s', async pathname => {
    const html = await streamDelayedPage(pathname);
    expect(html).toContain('<h1>Technical resources</h1>');
    expect(html).not.toMatch(/<div hidden\b/);
    expect(html).not.toContain('Shared pending');
  });

  it.each(['zh', 'en'].flatMap(locale => [
    `/${locale}/inquiry`,
    `/${locale}/products/detail/copper-wire-annealing-line/inquiry-checklist`,
    `/${locale}/products/detail/box-furnace/inquiry`,
    `/${locale}/products/animation-review`,
  ]))('keeps nested inquiry and unrelated pages protected at %s', async pathname => {
    const html = await streamDelayedPage(pathname);
    expect(html).toContain('Shared pending');
    expect(html).toMatch(/<div hidden\b/);
  });

  it.each(['/zh/products', '/zh/service/furnace-renovation-overhaul'])(
    'preserves already readable routes at %s', async pathname => {
      expect(await streamDelayedPage(pathname)).not.toContain('Shared pending');
    },
  );
});


describe('approved procurement and service readability', () => {
  const serviceRoutes = ['service', 'service/furnace-renovation-overhaul', 'service/installation-after-sales', 'service/furnace-relocation-restart', 'service/selection-retrofit-guide'];
  const approved = [...APPROVED_GUIDE_PATHS, ...APPROVED_PROCUREMENT_PATHS, ...['zh', 'en'].flatMap(locale => serviceRoutes.map(path => `/${locale}/${path}`))];
  it.each(approved)('keeps the approved page body visible at %s', async pathname => {
    const html = await streamDelayedPage(pathname);
    expect(html).toContain('<h1>Technical resources</h1>');
    expect(html).not.toMatch(/<div hidden\b/);
    expect(html).not.toContain('Shared pending');
  });
  it.each(['/zh/service/unknown-service', '/en/service/unknown-service', '/zh/contact', '/en/about', '/zh/case/jining-support-roller-heat-treatment-line'])(
    'does not take later-batch or unknown routes into this batch at %s', async pathname => {
      expect(await streamDelayedPage(pathname)).toContain('Shared pending');
    },
  );
  it.each([...APPROVED_GUIDE_PATHS].map(path => path.replace('/zh/', '/en/')))(
    'keeps unapproved English guides protected at %s', async pathname => {
      expect(isWithdrawnRequestPath(pathname)).toBe(true);
      expect(await streamDelayedPage(pathname)).toContain('Shared pending');
    },
  );
});
