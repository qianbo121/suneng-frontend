import { describe, expect, it } from 'vitest';
import { getContactFactoryMap, parseBaiduFactoryPoint } from './contact-map';

describe('contact map language routing', () => {
  it('uses Baidu search when the Chinese factory point is not verified', () => {
    const map = getContactFactoryMap('zh');
    expect(map.provider).toBe('baidu');
    expect(new URL(map.href).hostname).toBe('api.map.baidu.com');
    expect(new URL(map.href).pathname).toBe('/place/search');
    expect(map.preview).toBeUndefined();
    expect(JSON.stringify(map)).not.toMatch(/google|amap/);
  });

  it('keeps the English map on Google even when Baidu is configured', () => {
    const map = getContactFactoryMap('en', { browserKey: 'test-only', point: '120.04,32.44' });
    expect(map.provider).toBe('google');
    expect(new URL(map.href).hostname).toBe('www.google.com');
    expect(map.preview?.kind).toBe('iframe');
    expect(new URL(map.preview!.src).hostname).toBe('www.google.com');
    expect(JSON.stringify(map)).not.toContain('baidu');
  });

  it('opens the automatic map frame and uses latitude first for Baidu navigation', () => {
    // Test fixture only; this is not a factory coordinate.
    const map = getContactFactoryMap('zh', { browserKey: 'test-only', point: '120.04,32.44' });
    const marker = new URL(map.href);
    expect(marker.searchParams.get('location')).toBe('32.44,120.04');
    expect(marker.searchParams.get('coord_type')).toBe('bd09ll');
    expect(map.preview?.kind).toBe('iframe');
    expect(map.preview?.src).toBe('/baidu-factory-map.html');
    expect(map.preview?.src).not.toContain('test-only');
  });

  it('does not render an unconfigured or invalid Baidu preview', () => {
    for (const point of [undefined, '', 'NaN,NaN', '181,91', ',', '32.44,120.04', '116.4,39.9']) {
      expect(getContactFactoryMap('zh', { browserKey: 'test-only', point }).preview).toBeUndefined();
    }
    expect(getContactFactoryMap('zh', { point: '120.04,32.44' }).preview).toBeUndefined();
    expect(getContactFactoryMap('zh', { browserKey: ' ', point: '120.04,32.44' }).preview).toBeUndefined();
    expect(parseBaiduFactoryPoint(' 120.04,32.44 ')).toEqual({ lng: 120.04, lat: 32.44 });
  });
});
