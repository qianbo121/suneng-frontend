import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

afterEach(() => vi.unstubAllEnvs());
describe('IndexNow ownership proof', () => {
  it('returns a non-indexable 404 when no usable key is configured', () => {
    vi.stubEnv('INDEXNOW_KEY', '');
    expect(GET().status).toBe(404);
    vi.stubEnv('INDEXNOW_KEY', 'invalid/key');
    expect(GET().status).toBe(404);
  });
  it('serves only the configured proof as plain text with no caching', async () => {
    vi.stubEnv('INDEXNOW_KEY', 'test-key-123456');
    const response = GET();
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('test-key-123456');
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});
