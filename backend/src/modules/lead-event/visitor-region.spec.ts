import {
  exactIpv4,
  resolveStableMaskedRegion,
  resolveVisitorRegion,
} from '@/modules/lead-event/visitor-region';

describe('visitor region', () => {
  it('accepts an exact ipv4, including the ipv4-mapped form used by Node', () => {
    expect(exactIpv4('114.252.10.20')).toBe('114.252.10.20');
    expect(exactIpv4('::ffff:114.252.10.20')).toBe('114.252.10.20');
  });

  it('refuses masked, malformed and out-of-range addresses as exact input', () => {
    for (const bad of [null, undefined, '', '114.252.xxx.xxx', '999.1.1.1', 'abc']) {
      expect(exactIpv4(bad)).toBeNull();
    }
  });

  it('resolves the exact address used for the current request', () => {
    expect(resolveVisitorRegion('114.252.10.20').province).toContain('北京');
    expect(resolveVisitorRegion('183.159.10.20').city).toContain('杭州');
  });

  it('keeps cross-province mobile prefixes unknown instead of probing .0.1', () => {
    expect(resolveStableMaskedRegion('223.104.xxx.xxx')).toEqual({ province: null, city: null });
    expect(resolveStableMaskedRegion('117.136.xxx.xxx')).toEqual({ province: null, city: null });
  });

  it('allows a masked historical prefix only when the sampled /16 is province-stable', () => {
    expect(resolveStableMaskedRegion('114.252.xxx.xxx').province).toContain('北京');
  });

  it('returns empty instead of throwing when the ip is unusable', () => {
    expect(resolveVisitorRegion(null)).toEqual({ province: null, city: null });
    expect(resolveVisitorRegion('not-an-ip')).toEqual({ province: null, city: null });
  });

  it('never reports the library placeholders as a real place', () => {
    // 内网/未分配网段会返回 "0" 或 "内网IP" 之类，写进库会变成假地区
    const region = resolveVisitorRegion('10.0.0.5');
    for (const value of [region.province, region.city]) {
      expect(value === null || !['0', '内网IP', '未分配或者内网IP', '-'].includes(value)).toBe(
        true,
      );
    }
  });
});
