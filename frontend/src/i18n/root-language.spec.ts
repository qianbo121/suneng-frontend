import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import middleware from '../middleware';

function request(path: string, language?: string) {
  return new NextRequest(`https://www.jssngyl.cn${path}`, {
    headers: language === undefined ? {} : { 'Accept-Language': language },
  });
}

describe('browser-language entry', () => {
  it.each([
    ['en-US,en;q=0.9', 'en'],
    ['zh-CN,zh;q=0.9,en;q=0.8', 'zh'],
    ['zh-TW,zh;q=0.9', 'zh'],
    ['fr-FR,fr;q=0.9', 'en'],
    ['de-DE,de;q=0.9,en;q=0.8', 'en'],
    ['ja-JP', 'en'],
    ['zh;q=0.5,en;q=0.9', 'en'],
    ['en;q=0.5,zh;q=0.9', 'zh'],
    ['zh;q=0,en;q=1', 'en'],
    ['*', 'en'],
    ['', 'zh'],
    [undefined, 'zh'],
  ])('routes browser preference %s to %s without caching the decision', async (language, locale) => {
    const response = await middleware(request('/', language));

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe(`https://www.jssngyl.cn/${locale}`);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Vary')).toContain('Accept-Language');
    expect(response.headers.get('Set-Cookie')).toBeNull();
  });

  it('preserves campaign and inquiry tracking parameters on entry', async () => {
    const response = await middleware(request('/?utm_source=overseas&campaign=furnace', 'en-US'));
    expect(response.headers.get('Location')).toBe(
      'https://www.jssngyl.cn/en?utm_source=overseas&campaign=furnace',
    );
  });

  it.each([
    ['/zh', 'en-US'],
    ['/zh/products', 'en-US'],
    ['/en', 'zh-CN'],
    ['/en/products', 'zh-CN'],
  ])('respects an explicit language in %s even with browser preference %s', async (path, language) => {
    const response = await middleware(request(path, language));
    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
  });

  it('preserves the permanent target of old unprefixed content links', async () => {
    const response = await middleware(request('/products', 'en-US'));
    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe('https://www.jssngyl.cn/zh/products');
  });
});
