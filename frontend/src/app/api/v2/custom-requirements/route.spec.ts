import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function request(origin = 'http://localhost:3000') {
  return new NextRequest('http://localhost:3000/api/v2/custom-requirements', {
    method: 'POST',
    headers: {
      origin,
      cookie: 'admin_session=do-not-forward',
      authorization: 'Bearer do-not-forward',
    },
    body: JSON.stringify({ idempotencyKey: 'stable-test-key', contact: '!!!' }),
  });
}

describe('local inquiry bridge', () => {
  it('is unavailable outside development', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    expect((await POST(request())).status).toBe(404);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(['https://unrelated.test', ''])(
    'rejects an untrusted or absent origin: %s',
    async (origin) => {
      vi.stubEnv('NODE_ENV', 'development');
      const fetcher = vi.fn();
      vi.stubGlobal('fetch', fetcher);
      expect((await POST(request(origin))).status).toBe(403);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it.each([201, 400, 409, 429])(
    'preserves backend response %s and the retry key without forwarding credentials',
    async (status) => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('API_BASE_URL_INTERNAL', 'https://backend.test/api');
      const body = JSON.stringify({
        code: status === 201 ? 0 : status,
        data: { submissionId: 17 },
        message: 'result',
      });
      const fetcher = vi
        .fn()
        .mockResolvedValue(
          new Response(body, { status, headers: { 'Content-Type': 'application/json' } }),
        );
      vi.stubGlobal('fetch', fetcher);
      const response = await POST(request());
      expect(response.status).toBe(status);
      expect(await response.text()).toBe(body);
      expect(String(fetcher.mock.calls[0][0])).toBe(
        'https://backend.test/api/v2/custom-requirements',
      );
      expect(fetcher.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(fetcher.mock.calls[0][1].body).idempotencyKey).toBe('stable-test-key');
    },
  );

  it('returns an error when the backend is unreachable', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('API_BASE_URL_INTERNAL', 'https://backend.test/api');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect((await POST(request())).status).toBe(503);
  });

  it('refuses a configuration that would forward to itself', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('API_BASE_URL_INTERNAL', 'http://localhost:3000/api');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    expect((await POST(request())).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
