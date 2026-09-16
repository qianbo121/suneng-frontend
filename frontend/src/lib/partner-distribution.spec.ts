import { describe, expect, it } from 'vitest';
import { PARTNERS } from './partner-directory';
import { groupPartnersByProvince, matchesPartner, PENDING_PROVINCE } from './partner-distribution';
import map from '@/components/partner/distribution/china-map-paths.json';

describe('partner province evidence and identity', () => {
  const groups = groupPartnersByProvince(map.regions);
  it('groups every retained public entity once', () => {
    expect(
      groups
        .flatMap((group) => group.items)
        .map((item) => item.id)
        .sort(),
    ).toEqual(PARTNERS.map((item) => item.id).sort());
    expect(new Set(PARTNERS.map((item) => item.name)).size).toBe(32);
    expect(map.regions).toHaveLength(34);
    expect(map.southPath.length).toBeGreaterThan(1000);
  });
  it('only counts province assignments backed by an address and source', () => {
    for (const item of PARTNERS.filter((item) => item.provinceVerified)) {
      expect(item.provinceSource).toMatch(/^(https:\/\/|GEO-20260907-E\d{3}-P\d+)/);
      expect(item.verifiedAddress).toBeTruthy();
      expect(map.regions.find((region) => region.code === item.provinceCode)?.name).toBe(
        item.provinceName,
      );
    }
    const pending = groups.find((group) => group.code === PENDING_PROVINCE)!;
    expect(pending.items.some((item) => item.id === 'partner-27')).toBe(false);
    expect(
      groups
        .find((group) => group.code === '340000')
        ?.items.some((item) => item.id === 'partner-27'),
    ).toBe(true);
    expect(groups.find((group) => group.code === '320000')?.items).toHaveLength(17);
    expect(
      groups.filter((group) => group.code !== PENDING_PROVINCE).flatMap((group) => group.items),
    ).toHaveLength(32);
    expect(pending.items).toHaveLength(0);
  });
  it('searches names and industries without mutating province totals', () => {
    const js = groups.find((group) => group.code === '320000')!;
    expect(js.items.filter((item) => matchesPartner(item, '能源装备'))).toHaveLength(2);
    expect(js.items).toHaveLength(17);
    expect(PARTNERS.filter((item) => matchesPartner(item, '  enfi '))[0].id).toBe('partner-01');
    expect(PARTNERS.filter((item) => matchesPartner(item, '冀阳五二五'))).toHaveLength(0);
    expect(js.items.filter((item) => matchesPartner(item, '仪昌'))[0].id).toBe('partner-34');
    for (const item of PARTNERS.filter((item) => item.industry))
      expect(item.industrySource).toBeTruthy();
  });
  it('uses the same legal entity address and keeps private asset evidence out of page props', () => {
    const robot = PARTNERS.find((item) => item.id === 'partner-17')!;
    expect(robot.name).toBe('德世博尔（江苏）机器人技术有限公司');
    expect(robot.verifiedAddress).toBe('江苏省常州市武进区');
    expect(robot.provinceSource).toContain('E161-P2');
    const t = PARTNERS.find((item) => item.id === 'partner-27')!;
    expect(t.verifiedAddress).toContain('安徽省铜陵市');
    const pagePayload = JSON.stringify(groups);
    for (const field of [
      'provinceSource',
      'assetRecordIds',
      'verifiedAddress',
      '/Users/',
      'GEO-20260907',
    ])
      expect(pagePayload).not.toContain(field);
    for (const id of ['partner-16', 'partner-21', 'partner-22', 'partner-31', 'partner-35'])
      expect(groups.flatMap((group) => group.items).some((item) => item.id === id)).toBe(false);
  });
  it('does not infer provinces from company names or merge separate companies', () => {
    const fixtures = [
      PARTNERS[0],
      PARTNERS[0],
      { ...PARTNERS[0], id: 'another-entity', name: '另一独立法人' },
      {
        id: 'self',
        name: '江苏苏能工业炉有限公司',
        shortName: '苏能',
        source: '',
        sourceRecordIds: [],
      },
      {
        id: 'unconfirmed',
        name: '江苏名称不能作为地址',
        shortName: '未确认',
        source: '',
        sourceRecordIds: [],
        provinceCode: '320000',
        provinceVerified: false,
      },
    ];
    const result = groupPartnersByProvince(map.regions, fixtures);
    expect(result.flatMap((group) => group.items)).toHaveLength(3);
    expect(result.find((group) => group.code === PENDING_PROVINCE)?.items[0].id).toBe(
      'unconfirmed',
    );
  });
});
