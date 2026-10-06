import { readFileSync } from 'node:fs';

import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({ default: () => () => new Response(null, { status: 200 }) }));
vi.mock('@/lib/news-route-guard', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/news-route-guard')>();
  return { ...original, getNewsRouteResolution: vi.fn().mockResolvedValue({ availability: 'missing' }) };
});

import middleware from '../middleware';
import { getNewsRouteResolution } from '@/lib/news-route-guard';

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

describe('unprefixed public route governance', () => {
  it('permanently sends public non-localized routes to Chinese equivalents', async () => {
    const response = await middleware(new NextRequest('https://www.jssngyl.cn/products', {
      headers: { 'Accept-Language': 'en-US' },
    }));
    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe('https://www.jssngyl.cn/zh/products');
  });

  it.each([
    '/news?page=2',
    '/news?page=2&topic=heat-treatment&sort=latest',
    '/products?utm_source=baidu&utm_medium=organic&utm_campaign=procurement',
    '/contact?from=search&q=mesh%20belt',
  ])('retains pagination, filters and acquisition parameters in %s', async (path) => {
    const response = await middleware(new NextRequest(`https://www.jssngyl.cn${path}`));
    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe(`https://www.jssngyl.cn/zh${path}`);
  });

  it('preserves unrelated fixed permanent redirects', () => {
    expect(middlewareSource).not.toContain("pathname === '/en/news'");
    expect(middlewareSource).not.toContain("pathname === '/en/partner'");
    expect(middlewareSource).toContain('getFixedPublicRouteStatus(pathname');
  });

  afterEach(() => vi.mocked(getNewsRouteResolution).mockResolvedValue({ availability: 'missing' }));

  it.each(['zh', 'en'])('lets the withdrawn %s source return its own 404', async (locale) => {
    const path = `/${locale}/news/jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1`;
    const response = await middleware(new NextRequest(`https://www.jssngyl.cn${path}?private_note=fixture-only`));
    expect(response.status).toBe(404);
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.text()).not.toContain('fixture-only');
  });

  it('does not turn an available news page into a withdrawn page', async () => {
    vi.mocked(getNewsRouteResolution).mockResolvedValue({ availability: 'available' });
    const response = await middleware(new NextRequest('https://www.jssngyl.cn/zh/news/live-article'));
    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
  });

  it('preserves the query-free target of the existing certificates alias', async () => {
    const response = await middleware(new NextRequest('https://www.jssngyl.cn/zh/strength/certificates?private_note=fixture-only'));
    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe('https://www.jssngyl.cn/zh/strength/honors#management-systems');
  });
});
