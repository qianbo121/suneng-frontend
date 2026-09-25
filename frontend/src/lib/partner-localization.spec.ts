import { describe, expect, it } from 'vitest';
import { getPartnerMapData } from './partner-map-data';
import { partnerText } from './partner-copy';
import provinces from '@/components/partner/map-kit/provinces.json';
import { ENGLISH_PROVINCES } from './partner-provinces-en';
import { isZhOnlyPath, localizeOrHideHref } from './i18n/zh-only';
import { PARTNER_INDUSTRY_GROUPS } from './partner-industry-groups';

describe('public partner localization', () => {
  it('translates every published industry and filter without changing company identity', () => {
    const data = getPartnerMapData();
    for (const item of data) {
      if (item.industry) expect(partnerText(item.industry, 'en')).not.toMatch(/\p{Script=Han}/u);
      expect(partnerText(item.fullName, 'en')).toBe(item.fullName);
    }
    for (const group of PARTNER_INDUSTRY_GROUPS) {
      expect(partnerText(group, 'en')).not.toMatch(/\p{Script=Han}/u);
      expect(partnerText(group, 'zh')).toBe(group);
    }
  });
  it('has unique compact labels and full English names for every existing region', () => {
    expect(new Set(Object.values(ENGLISH_PROVINCES).map((item) => item.shortName)).size).toBe(provinces.length);
    for (const province of provinces) expect(ENGLISH_PROVINCES[province.code].name).toMatch(/^[A-Za-z ]+$/);
  });
  it('allows both partner routes and keeps Chinese-only inquiry behavior', () => {
    expect(isZhOnlyPath('/en/partner')).toBe(false);
    expect(localizeOrHideHref('/zh/partner', 'en')).toBe('/en/partner');
    expect(localizeOrHideHref('/inquiry', 'en')).toBeNull();
  });
});
