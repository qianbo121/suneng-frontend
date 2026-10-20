import { describe, expect, it } from 'vitest';
import { getContactFactoryMap } from './contact-map';

describe('contact map language routing', () => {
  it('shows a local static Chinese image without a map key', () => {
    const map = getContactFactoryMap('zh');
    expect(map.provider).toBe('baidu');
    expect(map.preview?.kind).toBe('image');
    expect(map.preview?.src).toBe('/images/contact/factory-location.svg?v=4');
    expect(JSON.stringify(map)).not.toMatch(/google|amap|openstreetmap|baidu-factory-map|ak=/);
  });

  it('opens the verified Baidu point with latitude first', () => {
    const marker = new URL(getContactFactoryMap('zh').href);
    expect(marker.hostname).toBe('api.map.baidu.com');
    expect(marker.pathname).toBe('/marker');
    expect(marker.searchParams.get('location')).toBe('32.448097,120.038631');
    expect(marker.searchParams.get('coord_type')).toBe('bd09ll');
    expect(marker.searchParams.get('title')).toBe('江苏苏能工业炉有限公司');
  });

  it('keeps the English map and navigation on Google', () => {
    const map = getContactFactoryMap('en');
    expect(map.provider).toBe('google');
    expect(new URL(map.href).hostname).toBe('www.google.com');
    expect(map.preview?.kind).toBe('iframe');
    expect(new URL(map.preview!.src).hostname).toBe('www.google.com');
    expect(JSON.stringify(map)).not.toContain('baidu');
  });
});
