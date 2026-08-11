import { describe, expect, it, vi } from 'vitest';

import {
  getNewsRouteAvailability,
  getZhNewsSlug,
  newsNotFoundHtml,
} from './news-route-guard';

describe('news route guard', () => {
  it('only recognizes localized Chinese news detail routes', () => {
    expect(getZhNewsSlug('/zh/news/example')).toBe('example');
    expect(getZhNewsSlug('/zh/news/example/extra')).toBeNull();
    expect(getZhNewsSlug('/en/news/example')).toBeNull();
    expect(getZhNewsSlug('/zh/news')).toBeNull();
    expect(getZhNewsSlug('/zh/news/%E0%A4%A')).toBeNull();
  });

  it('returns missing only for an authoritative backend 404', async () => {
    const missingFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 404 }));
    const errorFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 503 }));
    const availableFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));

    await expect(getNewsRouteAvailability('/zh/news/example', 'http://backend:3001/api', missingFetch)).resolves.toBe('missing');
    await expect(getNewsRouteAvailability('/zh/news/example', 'http://backend:3001/api', errorFetch)).resolves.toBe('unknown');
    await expect(getNewsRouteAvailability('/zh/news/example', 'http://backend:3001/api', availableFetch)).resolves.toBe('available');
    expect(missingFetch).toHaveBeenCalledWith(
      'http://backend:3001/api/v1/news/example',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('returns a noindex html response body for real 404 responses', () => {
    expect(newsNotFoundHtml()).toContain('资料不存在或已下线');
    expect(newsNotFoundHtml()).toContain('name="robots" content="noindex"');
  });
});
