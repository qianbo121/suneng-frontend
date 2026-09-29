import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({ default: () => () => NextResponse.next() }));
vi.mock('@/lib/news-list-route-guard', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/news-list-route-guard')>(),
  getNewsListStatus: vi.fn().mockResolvedValue(null),
}));

import middleware from '../middleware';

const run = (path: string) => middleware(new NextRequest(`https://www.jssngyl.cn${path}`));
const fetcher = vi.fn<typeof fetch>();
const published = { id: 80, slug: 'published-resource', status: 'published', isPublished: true };

function mockDelayedPublicNews(delayMs: number) {
  fetcher.mockImplementationOnce((_url, init) => new Promise<Response>((resolve, reject) => {
    const signal = init?.signal;
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve(new Response(JSON.stringify({
        data: { ...published, titleEn: 'Published resource', contentEn: '<p>Article text</p>' },
      })));
    }, delayMs);
    function onAbort() {
      clearTimeout(timer);
      reject(new DOMException('Request aborted', 'AbortError'));
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  }));
}

beforeEach(() => {
  vi.stubEnv('API_BASE_URL_INTERNAL', 'http://backend:3001/api');
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubGlobal('fetch', fetcher);
  fetcher.mockReset();
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe.each(['zh', 'en'])('%s fixed route HTTP outcomes', (locale) => {
  it.each([
    '/strength/no-such-category',
    '/products/detail/no-such-product/inquiry-checklist',
    '/products/detail/mesh-belt-furnace/inquiry-checklist',
    '/products/animation-review',
  ])('preserves the existing page rendering for %s while its status fix awaits UI confirmation', async (path) => {
    const response = await run(`/${locale}${path}`);
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get('X-Robots-Tag')).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(['/strength/honors', '/products/detail/copper-wire-annealing-line/inquiry-checklist'])
    ('preserves the valid %s page', async (path) => {
      const response = await run(`/${locale}${path}`);
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(fetcher).not.toHaveBeenCalled();
    });

  it.each([
    ['/strength', '/strength/honors'],
    ['/strength/certificates', '/strength/honors#management-systems'],
    ['/strength/technical-team', '/about'],
  ])('permanently redirects %s to its existing destination', async (path, destination) => {
    const response = await run(`/${locale}${path}?source=old`);
    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe(`https://www.jssngyl.cn/${locale}${destination}`);
  });

  it('retains the development-only animation preview', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect((await run(`/${locale}/products/animation-review`)).headers.get('x-middleware-next')).toBe('1');
  });

  it('resolves the numeric news URL once and redirects to the published same-language slug', async () => {
    fetcher.mockResolvedValue(new Response(JSON.stringify({
      data: { ...published, titleEn: 'Published resource', contentEn: '<p>Article text</p>' },
    })));
    const response = await run(`/${locale}/news/80?source=old`);
    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe(`https://www.jssngyl.cn/${locale}/news/published-resource`);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe('http://backend:3001/api/v1/news/80');
  });

  it('redirects a legacy numeric URL when its public lookup takes three seconds', async () => {
    vi.useFakeTimers();
    mockDelayedPublicNews(3_000);
    const pending = run(`/${locale}/news/80`);
    await vi.advanceTimersByTimeAsync(2_500);
    expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(500);
    const response = await pending;
    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe(`https://www.jssngyl.cn/${locale}/news/published-resource`);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps the two-second guard on ordinary article URLs', async () => {
    vi.useFakeTimers();
    mockDelayedPublicNews(3_000);
    const pending = run(`/${locale}/news/published-resource`);
    await vi.advanceTimersByTimeAsync(2_000);
    const response = await pending;
    expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('X-Robots-Tag')).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops a numeric lookup after five seconds without declaring the article missing', async () => {
    vi.useFakeTimers();
    mockDelayedPublicNews(6_000);
    const pending = run(`/${locale}/news/80`);
    await vi.advanceTimersByTimeAsync(5_000);
    const response = await pending;
    expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('X-Robots-Tag')).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not redirect missing or unpublished news', async () => {
    fetcher.mockResolvedValueOnce(new Response('{}', { status: 404 }));
    const missing = await run(`/${locale}/news/999999`);
    expect(missing.status).toBe(404);
    expect(missing.headers.get('Location')).toBeNull();
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ data: { ...published, status: 'draft', isPublished: false } })));
    const draft = await run(`/${locale}/news/80`);
    expect(draft.status).toBe(404);
    expect(draft.headers.get('Location')).toBeNull();
  });

  it('does not turn upstream failures into permanent removal responses', async () => {
    for (const upstream of [new Response('{}', { status: 503 }), new Response('{}'), new Response('invalid JSON')]) {
      fetcher.mockResolvedValueOnce(upstream);
      const response = await run(`/${locale}/news/80`);
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(response.headers.get('Location')).toBeNull();
      expect(response.headers.get('X-Robots-Tag')).toBeNull();
    }
    fetcher.mockRejectedValueOnce(new Error('Backend unavailable'));
    expect((await run(`/${locale}/news/80`)).headers.get('x-middleware-next')).toBe('1');
  });

  it.each(['//other.test/path', 'https://other.test', '../contact', 'path?contact=123', 'path#fragment'])
    ('does not redirect using malformed upstream slug %s', async (slug) => {
      fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ data: { ...published, slug } })));
      const response = await run(`/${locale}/news/80`);
      expect(response.headers.get('Location')).toBeNull();
      expect(response.headers.get('X-Robots-Tag')).toBeNull();
    });
});

it('does not redirect a numeric English URL when no approved English version exists', async () => {
  fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ data: { ...published, id: 999999 } })));
  const response = await run('/en/news/80');
  expect(response.status).toBe(404);
  expect(response.headers.get('Location')).toBeNull();
});

it('uses the same public API URL fallback as page requests when no internal base is configured', async () => {
  vi.stubEnv('API_BASE_URL_INTERNAL', '');
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://public-api.test/api');
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
  fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ data: published })));
  const response = await run('/zh/news/80');
  expect(response.status).toBe(308);
  expect(fetcher.mock.calls[0][0]).toBe('https://public-api.test/api/v1/news/80');
});
