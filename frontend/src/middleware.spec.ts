import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/news-route-guard', async (original) => ({
  ...(await original<typeof import('@/lib/news-route-guard')>()),
  getNewsRouteAvailability: vi.fn(async () => 'available'),
}));

import middleware from './middleware';

const run = (path: string) => middleware(new NextRequest(new URL(path, 'https://www.jssngyl.cn')));

describe('withdrawn content routing', () => {
  it.each([
    ['/zh/%73olutions/continuous-heat-treatment-line', 'zh'],
    ['/zh/sol%09utions/continuous-heat-treatment-line', 'zh'],
    ['/zh/%0Asolutions/continuous-heat-treatment-line', 'zh'],
    ['/en/solutions%0D/continuous-heat-treatment-line', 'en'],
    ['/zh/art%09icles/gongye-lu-baojia-canshu', 'zh'],
    ['/zh/solutions%20', 'zh'],
    ['/en/solutions%1F', 'en'],
    ['/zh/products/%252e%252e/solutions/continuous-heat-treatment-line', 'zh'],
    ['/zh/products/%2e%2e/articles/gongye-lu-baojia-canshu', 'zh'],
    ['/zh/%63ase/jining-support-roller-heat-treatment-line', 'zh'],
    ['/%65n/solutions/continuous-heat-treatment-line', 'en'],
    ['/EN/solutions/continuous-heat-treatment-line', 'en'],
    ['/En/case/jining-support-roller-heat-treatment-line', 'en'],
    ['/zh/solutions%2Fcontinuous-heat-treatment-line', 'zh'],
    ['/zh/%5Csolutions', 'zh'],
    ['/en/%3F/%252e%252e/solutions', 'en'],
  ])('refuses %s with a real 404 in the reader language', async (path, locale) => {
    const response = await run(path);
    expect(response.status, path).toBe(404);
    expect(response.headers.get('x-middleware-rewrite'), path).toBeNull();
    const html = await response.text();
    expect(html, path).toContain(locale === 'en' ? 'lang="en"' : 'lang="zh-CN"');
    expect(html, path).toContain(locale === 'en' ? 'href="/en/news"' : 'href="/zh/news"');
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

  it.each([
    '/zh',
    '/zh/products',
    '/zh/case',
    '/zh/case/henan-annealing-solution-line',
    '/zh/%63ase/henan-annealing-solution-line',
    '/en/case',
    '/en/case/henan-annealing-solution-line',
  ])('keeps %s reachable', async (path) => {
    const response = await run(path);
    expect(response.status, path).not.toBe(404);
  });
});
