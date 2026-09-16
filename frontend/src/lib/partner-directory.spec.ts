import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { getPartnerPage, PARTNERS, partnerPageHref } from './partner-directory';

describe('partner directory', () => {
  it('keeps verified entries and archives the five user-authorized removals', () => {
    const removed = JSON.parse(
      readFileSync(
        new URL(
          '../../../docs/partner-distribution-20260907/所在地未核实移除记录.json',
          import.meta.url,
        ),
        'utf8',
      ),
    ) as { previousRecord: { id: string; sourceRecordIds: number[] } }[];
    expect(PARTNERS).toHaveLength(32);
    expect(removed).toHaveLength(5);
    expect(
      [
        ...PARTNERS.flatMap((item) => item.sourceRecordIds),
        ...removed.flatMap((item) => item.previousRecord.sourceRecordIds),
      ].sort((a, b) => a - b),
    ).toEqual(Array.from({ length: 41 }, (_, i) => i + 1));
    expect(
      removed.some((item) => PARTNERS.some((partner) => partner.id === item.previousRecord.id)),
    ).toBe(false);
    expect(
      PARTNERS.filter((item) => item.name.startsWith('桂林万川')).map((item) => item.name),
    ).toEqual(['桂林万川电炉输送设备有限公司']);
  });
  it('searches the complete directory, normalizes whitespace and case, and resets pagination', () => {
    expect(getPartnerPage('  enfi  ').items[0].name).toBe('中国恩菲工程技术有限公司');
    expect(getPartnerPage('核燃料').items[0].name).toBe('南通中集能源装备有限公司');
    expect(getPartnerPage('扬州').items[0].name).toBe('扬州华宇管件有限公司');
    expect(getPartnerPage('核燃料', '99').page).toBe(1);
  });
  it('computes all pages from data, handles boundaries, and gives real links', () => {
    const rows = Array.from(
      { length: getPartnerPage().totalPages },
      (_, i) => getPartnerPage('', String(i + 1)).items,
    ).flat();
    expect(rows.map((row) => row.id)).toEqual(PARTNERS.map((row) => row.id));
    expect(getPartnerPage('', '99').page).toBe(getPartnerPage().totalPages);
    expect(getPartnerPage('', '-1').page).toBe(1);
    expect(getPartnerPage('', '2.5').page).toBe(1);
    expect(getPartnerPage('不存在的单位').total).toBe(0);
    expect(partnerPageHref(2, '泵')).toBe('/zh/partner?q=%E6%B3%B5&page=2');
  });
});
