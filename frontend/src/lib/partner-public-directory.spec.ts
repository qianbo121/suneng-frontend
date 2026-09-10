import { describe, expect, it } from 'vitest';
import { getPartnerMapData } from './partner-map-data';

describe('reviewed public partner directory', () => {
  const partners = getPartnerMapData();
  it('retains all 93 unique companies and verified province counts', () => {
    expect(partners).toHaveLength(93);
    expect(new Set(partners.map((partner) => partner.fullName)).size).toBe(93);
    expect(partners.filter((partner) => partner.provinceCode === '320000')).toHaveLength(27);
    expect(partners.filter((partner) => !partner.provinceCode)).toHaveLength(24);
  });
  it('publishes supported industries while retaining companies with undisclosed industries', () => {
    expect(partners.filter((partner) => partner.industry)).toHaveLength(75);
    expect(
      partners.find((partner) => partner.fullName === '广西百矿新材料技术有限公司')?.industry,
    ).toBe('汽车零部件（铝合金轮毂）');
    expect(
      partners.find((partner) => partner.fullName === '无锡市宏翔特种钢管有限公司')?.industry,
    ).toBeNull();
  });
  it('contains only public fields and no internal paths or inferred industry claims', () => {
    for (const partner of partners)
      expect(Object.keys(partner).sort()).toEqual([
        'fullName',
        'id',
        'industry',
        'provinceCode',
        'shortName',
      ]);
    expect(JSON.stringify(partners)).not.toMatch(
      /推定|待确认|industrySource|provinceSource|\/Users\//,
    );
  });
});
