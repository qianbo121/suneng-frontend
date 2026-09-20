import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import middleware, { config } from '../middleware';

// Exercise matcher -> middleware -> news guard, stubbing only the transport.
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const run = (path: string) => middleware(new NextRequest(`https://www.jssngyl.cn${path}`));

describe('dotted news request chain', () => {
  it.each([
    '/zh/news/missing.html',
    '/zh/news/abc.def',
    '/en/news/whatever.html',
    '/en/news/missing.php',
    '/en/news/missing.aspx',
  ])('checks existence and rejects %s before page rendering', async (path) => {
    vi.stubEnv('API_BASE_URL_INTERNAL', 'http://backend.test/api');
    const upstream = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 404 }));
    vi.stubGlobal('fetch', upstream);
    expect(unstable_doesMiddlewareMatch({ config, url: `https://www.jssngyl.cn${path}` })).toBe(
      true,
    );
    const response = await run(path);
    expect(upstream).toHaveBeenCalledWith(
      `http://backend.test/api/v1/news/${path.split('/').at(-1)}`,
      expect.objectContaining({ cache: 'no-store' }),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(await response.text()).toContain('noindex');
  });
  it('preserves a real English article with a dotted slug', async () => {
    vi.stubEnv('API_BASE_URL_INTERNAL', 'http://backend.test/api');
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          data: {
            status: 'published',
            isPublished: true,
            titleEn: 'A valid article',
            contentEn: '<p>Actual article text.</p>',
          },
        }),
      ),
    );
    expect((await run('/en/news/valid.article')).status).not.toBe(404);
  });
  it('does not turn a backend outage into a false article-not-found response', async () => {
    vi.stubEnv('API_BASE_URL_INTERNAL', 'http://backend.test/api');
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 503 })),
    );
    expect((await run('/zh/news/valid.article')).status).not.toBe(404);
  });
});
