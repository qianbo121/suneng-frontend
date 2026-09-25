import { readFileSync } from 'node:fs';

import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({ default: () => () => new Response(null, { status: 200 }) }));
vi.mock('@/lib/news-route-guard', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/news-route-guard')>();
  return { ...original, getNewsRouteAvailability: vi.fn().mockResolvedValue('missing') };
});

import middleware from '../middleware';
import { getNewsRouteAvailability } from '@/lib/news-route-guard';

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

describe('unprefixed public route governance', () => {
  it('permanently sends public non-localized routes to Chinese equivalents', () => {
    expect(middlewareSource).toContain('NextResponse.redirect(target, 308)');
    expect(middlewareSource).toContain('permanentRedirect(request, `/zh${pathname}`)');
  });

  it('preserves unrelated fixed permanent redirects', () => {
    expect(middlewareSource).not.toContain("pathname === '/en/news'");
    expect(middlewareSource).not.toContain("pathname === '/en/partner'");
    expect(middlewareSource).toContain("pathname === '/zh/strength'");
    expect(middlewareSource).toContain("pathname === '/zh/strength/certificates'");
  });

  afterEach(() => vi.mocked(getNewsRouteAvailability).mockResolvedValue('missing'));

  it.each(['zh', 'en'])('lets the withdrawn %s source return its own 404', async (locale) => {
    const path = `/${locale}/news/jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1`;
    const response = await middleware(new NextRequest(`https://www.jssngyl.cn${path}`));
    expect(response.status).toBe(404);
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
  });

  it('does not turn an available news page into a withdrawn page', async () => {
    vi.mocked(getNewsRouteAvailability).mockResolvedValue('available');
    const response = await middleware(new NextRequest('https://www.jssngyl.cn/zh/news/live-article'));
    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
  });

  it('preserves the existing certificates redirect', async () => {
    const response = await middleware(new NextRequest('https://www.jssngyl.cn/zh/strength/certificates'));
    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe('https://www.jssngyl.cn/zh/strength/honors#management-systems');
  });
});
