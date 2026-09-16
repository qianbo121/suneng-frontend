import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('persistent view service bridge', () => {
  it('forwards to the existing server counter and preserves its deduplication cookie', async () => {
    vi.stubEnv('API_BASE_URL_INTERNAL', 'http://backend.test/api');
    const fetcher = vi.fn<typeof fetch>(
      async () =>
        new Response('{"counted":true}', {
          headers: { 'set-cookie': 'nv=2026-09-08%7C77; HttpOnly; Path=/; SameSite=Lax' },
        }),
    );
    vi.stubGlobal('fetch', fetcher);
    const req = new NextRequest('http://local/api/news/77/view', {
      method: 'POST',
      headers: {
        origin: 'http://local',
        cookie: 'nv=2026-09-08%7C76; admin_secret=do-not-forward',
      },
    });
    const response = await POST(req, { params: Promise.resolve({ id: '77' }) });
    expect(String(fetcher.mock.calls[0][0])).toBe('http://backend.test/api/v1/news/77/view');
    expect(fetcher.mock.calls[0][1]?.headers).toEqual({ cookie: 'nv=2026-09-08%7C76' });
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
  });
  it('never forwards speculative requests or invalid origins', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const context = { params: Promise.resolve({ id: '77' }) };
    const speculative = await POST(
      new NextRequest('http://local/api/news/77/view', {
        method: 'POST',
        headers: { purpose: 'prefetch' },
      }),
      context,
    );
    expect(await speculative.json()).toEqual({ counted: false });
    expect(
      (
        await POST(
          new NextRequest('http://local/api/news/77/view', {
            method: 'POST',
            headers: { origin: 'http://untrusted' },
          }),
          context,
        )
      ).status,
    ).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
