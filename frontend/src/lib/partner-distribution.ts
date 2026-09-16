import { PARTNERS, type PartnerEntry } from './partner-directory';
import { PENDING_PROVINCE, type ProvinceGroup } from './partner-distribution-shared';
export { matchesPartner, PENDING_PROVINCE } from './partner-distribution-shared';
export type { DistributionPartner, ProvinceGroup } from './partner-distribution-shared';

export function groupPartnersByProvince(
  provinces: { code: string; name: string }[],
  partners: PartnerEntry[] = PARTNERS,
): ProvinceGroup[] {
  const groups: ProvinceGroup[] = provinces.map(({ code, name }) => ({ code, name, items: [] }));
  groups.push({ code: PENDING_PROVINCE, name: '所在地待补充', items: [] });
  const byCode = new Map(groups.map((group) => [group.code, group]));
  const seen = new Set<string>();
  for (const partner of partners) {
    if (partner.name === '江苏苏能工业炉有限公司' || seen.has(partner.id)) continue;
    seen.add(partner.id);
    const code =
      partner.provinceVerified && partner.provinceSource && byCode.has(partner.provinceCode || '')
        ? partner.provinceCode!
        : PENDING_PROVINCE;
    byCode.get(code)!.items.push({
      id: partner.id,
      name: partner.name,
      shortName: partner.shortName,
      industry: partner.industry,
    });
  }
  return groups;
}
