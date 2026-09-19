import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';

vi.mock('@/lib/news-route-guard', async (original) => ({
  ...(await original<typeof import('@/lib/news-route-guard')>()),
  getNewsRouteAvailability: vi.fn(async () => 'available'),
}));

import middleware, { config } from './middleware';

const run = (address: string) => middleware(new NextRequest(new URL(address, 'https://www.jssngyl.cn')));

describe('withdrawn content routing', () => {
  it('accepts an approved canonical address after standard URL dot-segment normalization', async () => {
    const response = await run('/zh/products/%2e%2e/articles/gongye-lu-baojia-canshu');
    expect(response.status).toBe(200);
  });

  it.each([
    ['/zh/%73olutions/continuous-heat-treatment-line', 'zh'],
    ['/zh/sol%09utions/continuous-heat-treatment-line', 'zh'],
    ['/zh/%0Asolutions/continuous-heat-treatment-line', 'zh'],
    ['/en/solutions%0D/continuous-heat-treatment-line', 'en'],
    ['/zh/art%09icles/gongye-lu-baojia-canshu', 'zh'],
    ['/zh/solutions%20', 'zh'],
    ['/en/solutions%1F', 'en'],
    ['/zh/products/%252e%252e/solutions/continuous-heat-treatment-line', 'zh'],
    ['/zh/%63ase/jining-support-roller-heat-treatment-line', 'zh'],
    ['/%65n/solutions/continuous-heat-treatment-line', 'en'],
    ['/EN/solutions/continuous-heat-treatment-line', 'en'],
    ['/En/case/jining-support-roller-heat-treatment-line', 'en'],
    ['/zh/solutions%2Fcontinuous-heat-treatment-line', 'zh'],
    ['/zh/%5Csolutions', 'zh'],
    ['/en/%3F/%252e%252e/solutions', 'en'],
    // A case page must be named exactly: Next reads each of these as another slug.
    ['/zh/case/jining-support-roller-heat-treatment-line%2F%2e%2e%2Fhenan-annealing-solution-line', 'zh'],
    ['/zh/case/%2e%2e%2Fcase%2Fhenan-annealing-solution-line', 'zh'],
    ['/en/case/x%2F%252e%252e%2Fhenan-annealing-solution-line', 'en'],
    ['/zh/case/%2568enan-annealing-solution-line', 'zh'],
    ['/zh/case/henan-annealing-solution-line%09', 'zh'],
    ['/zh/case/henan-annealing-solution-line%20', 'zh'],
    ['/zh/case/henan-annealing-solution-line%1F', 'zh'],
    ['/zh/case/henan-annealing-solution-line%2F', 'zh'],
    ['/zh/case/henan-annealing-solution-line%0A', 'zh'],
    ['/en/case/%5Chenan-annealing-solution-line', 'en'],
    ['/zh/case/%2Fhenan-annealing-solution-line', 'zh'],
    ['/zh/case/foo.bar', 'zh'],
    ['/en/case/jining-support-roller-heat-treatment-line.', 'en'],
  ])('refuses %s with a real 404 in the reader language', async (address, locale) => {
    const response = await run(address);
    expect(response.status, address).toBe(404);
    expect(response.headers.get('x-middleware-rewrite'), address).toBeNull();
    expect(response.headers.get('x-robots-tag'), address).toBe('noindex');
    expect(response.headers.get('cache-control'), address).toBe('no-store');
    const html = await response.text();
    expect(html, address).toContain(locale === 'en' ? 'lang="en"' : 'lang="zh-CN"');
    expect(html, address).toContain(locale === 'en' ? 'href="/en/news"' : 'href="/zh/news"');
  });

  it('refuses every rewritten address the release tool probes', async () => {
    const release = fs.readFileSync(path.join(process.cwd(), '..', 'ops/releases/frontend_release.py'), 'utf8');
    const block = release.match(/ENCODED_WITHDRAWN_PATHS = \[([\s\S]*?)\n\]/)?.[1] ?? '';
    const probes = [...block.matchAll(/'([^']+)'/g)].map((match) => match[1]);
    expect(probes.length).toBeGreaterThanOrEqual(9);
    for (const probe of probes) expect((await run(probe)).status, probe).toBe(404);
  });

  it('checks where next-intl rewrites a request, not only the request path', async () => {
    vi.resetModules();
    vi.doMock('next-intl/middleware', () => ({
      default: () => (request: NextRequest) =>
        NextResponse.rewrite(new URL('/zh/solutions/continuous-heat-treatment-line', request.url)),
    }));
    try {
      const { default: rewritten } = await import('./middleware');
      const response = await rewritten(new NextRequest(new URL('/zh/products', 'https://www.jssngyl.cn')));
      expect(response.status).toBe(404);
      expect(response.headers.get('x-middleware-rewrite')).toBeNull();
      expect(await response.text()).toContain('lang="zh-CN"');
    } finally {
      vi.doUnmock('next-intl/middleware');
      vi.resetModules();
    }
  });

  it('hands an undecodable path outside the withdrawn sections to Next unchanged', async () => {
    const response = await run('/zh/products/%E0%A4%A');
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('runs for case addresses even when they contain a dot', () => {
    const matches = (address: string) =>
      unstable_doesMiddlewareMatch({ config, url: new URL(address, 'https://www.jssngyl.cn').href });
    for (const address of ['/zh', '/zh/case', '/zh/case/foo.bar', '/en/case/henan-annealing-solution-line.', '/zh/solutions/x'])
      expect(matches(address), address).toBe(true);
    for (const address of ['/images/products/a.png', '/_next/static/chunks/a.js', '/api/v1/news', '/favicon-32x32.png'])
      expect(matches(address), address).toBe(false);
  });

  it.each([
    '/zh',
    '/zh/products',
    '/zh/case',
    '/zh/case/',
    '/zh/case/henan-annealing-solution-line',
    '/zh/%63ase/henan-annealing-solution-line',
    '/en/case',
    '/en/case/henan-annealing-solution-line',
    '/en/case/henan-annealing-solution-line?returnTo=%2Fen%2Fcase',
  ])('keeps %s reachable', async (address) => {
    const response = await run(address);
    expect(response.status, address).not.toBe(404);
  });
});

describe('Chinese-only pages under /en', () => {
  it.each([
    '/en/inquiry',
    '/en/products/detail/track-shoe-press-quench-line',
    '/en/products/detail/cylinder-curing-line',
    '/en/products/detail/copper-wire-annealing-line/inquiry-checklist',
    '/en/service/installation-after-sales',
    '/EN/inquiry',
    '/en/inqui%72y',
    '/en/inquiry/',
  ])('answers %s with a real 404, not a 200 shell', async (address) => {
    const response = await run(address);
    expect(response?.status).toBe(404);
    expect(response?.headers.get('X-Robots-Tag')).toBe('noindex');
  });

  it.each([
    '/zh/inquiry',
    '/en/products/detail/shovel-furnace',
    '/en/case/henan-annealing-solution-line',
    '/en/contact',
  ])('leaves %s reachable', async (address) => {
    const response = await run(address);
    expect(response?.status).not.toBe(404);
  });
});

describe('product detail pages with no product behind them', () => {
  it.each([
    '/zh/products/detail/no-such-furnace',
    '/en/products/detail/no-such-furnace',
    '/zh/products/detail/no-such-furnace/',
    '/zh/products/detail/trolley-furnace-typo',
    '/zh/products/detail/%74rolley-furnace-typo',
  ])('answers %s with a real 404', async (address) => {
    const response = await run(address);
    expect(response?.status, address).toBe(404);
    expect(response?.headers.get('X-Robots-Tag')).toBe('noindex');
  });

  it.each([
    '/zh/products/detail/trolley-furnace',
    '/en/products/detail/trolley-furnace',
    '/zh/products/detail/cylinder-curing-line',
    '/zh/products/detail/copper-wire-annealing-line/inquiry-checklist',
    '/zh/products',
  ])('leaves %s reachable', async (address) => {
    const response = await run(address);
    expect(response?.status, address).not.toBe(404);
  });
});
