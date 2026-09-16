import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({ default: () => () => NextResponse.next() }));
vi.mock('@/lib/news-route-guard', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/news-route-guard')>();
  return { ...original, getNewsRouteAvailability: vi.fn().mockResolvedValue('available') };
});

import middleware from '../middleware';

const run = (path: string) => middleware(new NextRequest(`https://www.jssngyl.cn${path}`));

describe('prerendered resource list middleware', () => {
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

  it.each(['/zh/news', '/zh/news?page=2', '/zh/news?topic=selection', '/en/news'])(
    'passes %s on to routing (the rewrite happens in next.config)',
    async (path) => {
      const response = await run(path);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    },
  );
});
