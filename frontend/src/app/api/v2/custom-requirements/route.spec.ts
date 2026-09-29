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

function loopbackRequest(host: string, origin = `http://${host}`, extraHeaders = {}) {
  return new NextRequest(`http://${host}/api/v2/custom-requirements`, {
    method: 'POST',
    headers: { host, origin, ...extraHeaders },
    body: JSON.stringify({ idempotencyKey: 'stable-test-key', contact: '!!!' }),
  });
}

describe('local inquiry bridge', () => {
  it.each(['127.0.0.1:3017', '[::1]:3017', 'localhost:3017'])(
    'accepts the actual same-origin loopback host %s despite Next URL normalization',
    async (host) => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('API_BASE_URL_INTERNAL', 'https://backend.test/api');
      const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }));
      vi.stubGlobal('fetch', fetcher);
      const req = loopbackRequest(host);
      expect(req.nextUrl.origin).toBe('http://localhost:3017');
      expect((await POST(req)).status).toBe(201);
      expect(fetcher).toHaveBeenCalledOnce();
    },
  );

  it.each([
    'http://localhost:3017',
    'http://127.0.0.1:3018',
    'https://127.0.0.1:3017',
    'https://unrelated.test',
    'http://127.0.0.1:3017/path',
    'null',
    '',
  ])('rejects a mismatched or invalid origin on the IP preview: %s', async (origin) => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('API_BASE_URL_INTERNAL', 'https://backend.test/api');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    expect((await POST(loopbackRequest('127.0.0.1:3017', origin))).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('does not trust forwarded headers to authorize an external origin', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const response = await POST(loopbackRequest('127.0.0.1:3017', 'https://unrelated.test', {
      'x-forwarded-host': 'unrelated.test',
      'x-forwarded-proto': 'https',
    }));
    expect(response.status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(['unrelated.test:3017', '127.0.0.1:3018', '127.0.0.1:3017/extra'])(
    'rejects a host inconsistent with the local listener: %s',
    async (host) => {
      vi.stubEnv('NODE_ENV', 'development');
      const fetcher = vi.fn();
      vi.stubGlobal('fetch', fetcher);
      const req = new NextRequest('http://127.0.0.1:3017/api/v2/custom-requirements', {
        method: 'POST',
        headers: { host, origin: `http://${host}` },
      });
      expect((await POST(req)).status).toBe(403);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it.each(['localhost', '127.0.0.1', '[::1]'])(
    'rejects forwarding back to the same local listener via %s',
    async (backendHost) => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('API_BASE_URL_INTERNAL', `http://${backendHost}:3017/api`);
      const fetcher = vi.fn();
      vi.stubGlobal('fetch', fetcher);
      expect((await POST(loopbackRequest('127.0.0.1:3017'))).status).toBe(503);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it('is unavailable outside development', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    expect((await POST(request())).status).toBe(404);
    expect((await POST(loopbackRequest('127.0.0.1:3017'))).status).toBe(404);
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
