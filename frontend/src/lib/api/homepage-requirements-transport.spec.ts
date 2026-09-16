import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  submitHomepageRequirement,
  type HomepageRequirementPayload,
} from './homepage-requirements';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('homepage and production-line inquiry transport', () => {
  it.each(['development', 'production'])(
    'uses the intended endpoint in %s',
    async (environment) => {
      vi.stubEnv('NODE_ENV', environment);
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://backend.test/api');
      vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } });
      const fetcher = vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ code: 0, data: { submissionId: 42 }, message: 'ok' }), {
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      vi.stubGlobal('fetch', fetcher);
      const payload = { idempotencyKey: 'unchanged-key' } as HomepageRequirementPayload;
      expect(await submitHomepageRequirement(payload)).toEqual({ submissionId: 42 });
      expect(fetcher.mock.calls[0][0]).toBe(
        `${environment === 'development' ? 'http://localhost:3000' : 'https://backend.test'}/api/v2/custom-requirements`,
      );
      expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(payload);
    },
  );
});
