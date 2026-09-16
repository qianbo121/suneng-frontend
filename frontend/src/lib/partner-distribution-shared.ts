import type { PartnerEntry } from './partner-directory';

export type DistributionPartner = Pick<PartnerEntry, 'id' | 'name' | 'shortName' | 'industry'>;
export type ProvinceGroup = { code: string; name: string; items: DistributionPartner[] };
export const PENDING_PROVINCE = 'unverified';

export function matchesPartner(partner: DistributionPartner, rawQuery: string) {
  const normalize = (value: string) =>
    value.normalize('NFKC').toLocaleLowerCase('zh-CN').replace(/\s+/g, '');
  const query = normalize(rawQuery);
  return [partner.name, partner.shortName, partner.industry || ''].some((value) =>
    normalize(value).includes(query),
  );
}
