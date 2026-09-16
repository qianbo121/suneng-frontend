import { describe, expect, it } from 'vitest';
import { getPartnerMapData } from './partner-map-data';
import { PARTNERS } from './partner-directory';
import kit from '@/components/partner/map-kit/partners.json';
import additions from '@/constants/partner-ledger-additions.json';

describe('partner map kit data integration', () => {
  const result = getPartnerMapData();
  it('retains every current and supplied company once by its full identity', () => {
    expect(result).toHaveLength(93);
    for (const name of [...PARTNERS.map((p) => p.name), ...kit.map((p) => p.fullName)]) {
      expect(result.filter((p) => p.fullName === name)).toHaveLength(1);
    }
  });
  it('uses verified current addresses and preserves the unresolved companies', () => {
    expect(result.filter((p) => p.provinceCode === '320000')).toHaveLength(35);
    expect(result.filter((p) => !p.provinceCode)).toHaveLength(11);
    expect(result.find((p) => p.fullName === '冀阳五二五泵业有限公司')?.provinceCode).toBeNull();
    for (const p of PARTNERS.filter((p) => p.provinceVerified)) {
      expect(result.find((r) => r.id === p.id)?.provinceCode).toBe(p.provinceCode);
    }
  });
  it('adds verified buyers once and excludes suppliers and unresolved aliases', () => {
    expect(additions).toHaveLength(57);
    expect(new Set(result.map((p) => p.fullName)).size).toBe(result.length);
    expect(result.find((p) => p.fullName === '宝鸡法士特齿轮有限责任公司')?.provinceCode).toBe(
      '610000',
    );
    expect(result.find((p) => p.fullName === '固力发电气有限公司')?.provinceCode).toBe('340000');
    for (const id of ['ledger-010', 'ledger-105']) {
      const source = additions.find((p) => p.id === id)!;
      expect(source.provinceVerified).toBe(true);
      expect(source.provinceSource).toMatch(/^https:\/\//);
      expect(source.verifiedAddress).toBeTruthy();
      expect(result.find((p) => p.id === id)?.provinceCode).toBe('320000');
    }
    for (const name of [
      '泰州市创森金属热处理有限公司',
      '江苏山达智能科技有限公司',
      '安徽弘雷金属复合材料科技有限公司',
    ]) {
      expect(result.some((p) => p.fullName === name)).toBe(false);
    }
  });
  it('rejects demo records, unverified inference and unsourced industries', () => {
    const base = kit[0];
    expect(getPartnerMapData([], [{ ...base, isDemo: true }])).toEqual([]);
    const [record] = getPartnerMapData(
      [],
      [{ ...base, locationStatus: 'name-inferred', industrySource: null }],
    );
    expect(record.provinceCode).toBeNull();
    expect(record.industry).toBeNull();
  });
  it('keeps private contract and review fields on the server', () => {
    for (const p of result)
      expect(Object.keys(p).sort()).toEqual([
        'fullName',
        'id',
        'industry',
        'provinceCode',
        'shortName',
      ]);
    expect(JSON.stringify(result)).not.toContain('/Users/');
  });
  it('retains companies but keeps name-based industry guesses out of the public payload', () => {
    expect(result.filter((partner) => partner.industry === null)).toHaveLength(17);
    expect(result.find((partner) => partner.id === 'ledger-116')?.industry).toBe('冶金');
    expect(JSON.stringify(result)).not.toMatch(/推定|待确认|按公司名称/);
    expect(
      result.find((partner) => partner.fullName === '广西百矿新材料技术有限公司')?.industry,
    ).toBe('汽车零部件（铝合金轮毂）');
    expect(
      result.find((partner) => partner.fullName === '无锡市宏翔特种钢管有限公司')?.industry,
    ).toBeNull();
    const base = kit[0];
    expect(
      getPartnerMapData([], [{ ...base, industry: '钢管', industrySource: '按公司名称推断' }])[0]
        .industry,
    ).toBeNull();
  });
});
