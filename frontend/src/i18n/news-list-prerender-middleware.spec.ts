import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/news-list-route-guard', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/news-list-route-guard')>();
  return { ...original, getNewsListStatus: vi.fn().mockResolvedValue(null) };
});
vi.mock('@/lib/news-decision-center.server', () => ({ getNewsDecisionCenterCards: vi.fn() }));

vi.mock('next-intl/middleware', () => ({ default: () => () => NextResponse.next() }));
vi.mock('@/lib/news-route-guard', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/news-route-guard')>();
  return { ...original, getNewsRouteAvailability: vi.fn().mockResolvedValue('available') };
});

import middleware from '../middleware';
import { getNewsListStatus } from '@/lib/news-list-route-guard';

beforeEach(() => { vi.mocked(getNewsListStatus).mockResolvedValue(null); });

const run = (path: string) => middleware(new NextRequest(`https://www.jssngyl.cn${path}`));

describe('prerendered resource list middleware', () => {
  it('returns a real 404 before rendering the list shell', async () => {
    vi.mocked(getNewsListStatus).mockResolvedValue(404);
    const response = await run('/en/news?page=100');
    expect(response.status).toBe(404);
    expect(response.headers.get('x-middleware-next')).toBeNull();
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    expect(await response.text()).toContain('Return to Resources');
  });
  it('returns a temporary failure without a removal directive when data is unavailable', async () => {
    vi.mocked(getNewsListStatus).mockResolvedValue(503);
    const response = await run('/zh/news?page=2');
    expect(response.status).toBe(503);
    expect(response.headers.get('Retry-After')).toBe('30');
    expect(response.headers.get('X-Robots-Tag')).toBeNull();
  });
  it.each([
    '/zh/news-prerendered/1',
    '/en/news-prerendered/2',
    '/zh/news-prerendered',
    '/zh/news%2Dprerendered/1',
    '/zh/%6Eews-prerendered/2',
    '/zh/news-pre%09rendered/3',
  ])(
    'refuses direct requests for %s',
    async (path) => {
      const response = await run(path);
      expect(response.status).toBe(404);
      expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    },
  );

  it.each([
    ['/zh/NEWS', 'zh'],
    ['/en/News?page=2', 'en'],
    ['/zh/news?page=', 'zh'],
    ['/zh/news?page=9&page=3', 'zh'],
    ['/zh/news?page=0', 'zh'],
    ['/en/news?page=01', 'en'],
    ['/zh/news?topic=selection&page=abc', 'zh'],
  ])('keeps the misspelled list address %s a 404', async (path, locale) => {
    const response = await run(path);
    expect(response.status).toBe(404);
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    expect(await response.text()).toContain(locale === 'en' ? 'lang="en"' : 'lang="zh-CN"');
  });

  it.each(['/zh/news', '/zh/news?page=2', '/zh/news?page=12', '/zh/news?topic=selection', '/zh/news?topic=selection&page=2', '/en/news'])(
    'passes %s on to routing (the rewrite happens in next.config)',
    async (path) => {
      const response = await run(path);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    },
  );
});
