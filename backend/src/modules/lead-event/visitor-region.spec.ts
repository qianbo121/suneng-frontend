import { probeAddress, resolveVisitorRegion } from '@/modules/lead-event/visitor-region';

describe('visitor region', () => {
  it('turns a masked ip into a probe address using only the stored two octets', () => {
    // 后两段本来就没存过，这里不存在"还原真实 IP"
    expect(probeAddress('114.252.xxx.xxx')).toBe('114.252.0.1');
    expect(probeAddress('60.163.xxx.xxx')).toBe('60.163.0.1');
  });

  it('refuses anything that is not a usable masked ipv4', () => {
    for (const bad of [null, undefined, '', 'xxx.xxx.xxx.xxx', '999.1.xxx.xxx', 'abc']) {
      expect(probeAddress(bad)).toBeNull();
    }
  });

  it('resolves real prefixes seen in production to a province', () => {
    // 这几个网段 2026-08-19 都真实出现在生产库里
    expect(resolveVisitorRegion('114.252.xxx.xxx').province).toContain('北京');
    expect(resolveVisitorRegion('182.132.xxx.xxx').province).toContain('四川');
    expect(resolveVisitorRegion('60.163.xxx.xxx').province).toContain('浙江');
    expect(resolveVisitorRegion('183.159.xxx.xxx').city).toContain('杭州');
  });

  it('returns empty instead of throwing when the ip is unusable', () => {
    expect(resolveVisitorRegion(null)).toEqual({ province: null, city: null });
    expect(resolveVisitorRegion('not-an-ip')).toEqual({ province: null, city: null });
  });

  it('never reports the library placeholders as a real place', () => {
    // 内网/未分配网段会返回 "0" 或 "内网IP" 之类，写进库会变成假地区
    const region = resolveVisitorRegion('10.0.xxx.xxx');
    for (const value of [region.province, region.city]) {
      expect(value === null || !['0', '内网IP', '未分配或者内网IP', '-'].includes(value)).toBe(
        true,
      );
    }
  });
});
