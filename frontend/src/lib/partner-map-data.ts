import kitPartners from '@/components/partner/map-kit/partners.json';
import ledgerPartners from '@/constants/partner-ledger-additions.json';
import type { Partner } from '@/components/partner/map-kit/PartnerMap';
import { PARTNERS, type PartnerEntry } from './partner-directory';

const identity = (name: string) => name.normalize('NFKC').replace(/\s+/g, '');

/** Name-based guesses remain in the internal records, not in public industry claims. */
function publicIndustry(industry?: string | null, source?: string | null): string | null {
  if (!industry || /推定|待确认|待核实|推断|推测|name.infer/i.test(`${industry} ${source ?? ''}`)) {
    return null;
  }
  return industry;
}

/** Prefer current verified records; retain unmatched kit companies without inferring location. */
export function getPartnerMapData(
  current: PartnerEntry[] = [...PARTNERS, ...ledgerPartners],
  supplied: readonly Partner[] = kitPartners,
): Partner[] {
  const merged = new Map<string, Partner>();
  for (const item of supplied) {
    if (item.isDemo || identity(item.fullName) === identity('江苏苏能工业炉有限公司')) continue;
    merged.set(identity(item.fullName), {
      id: `kit-${item.id}`,
      fullName: item.fullName,
      shortName: item.shortName,
      industry: item.industrySource ? publicIndustry(item.industry, item.industrySource) : null,
      provinceCode:
        item.locationStatus === 'verified' && item.provinceSource ? item.provinceCode : null,
    });
  }
  const result = new Map<string, Partner>();
  for (const item of current) {
    const key = identity(item.name);
    if (key === identity('江苏苏能工业炉有限公司') || result.has(key)) continue;
    const suppliedItem = merged.get(key);
    result.set(key, {
      id: item.id,
      fullName: item.name,
      shortName: item.shortName,
      industry:
        publicIndustry(item.industry, item.industrySource) || suppliedItem?.industry || null,
      provinceCode:
        item.provinceVerified && item.provinceSource
          ? item.provinceCode || null
          : suppliedItem?.provinceCode || null,
    });
    merged.delete(key);
  }
  for (const [key, item] of merged) result.set(key, item);
  // Only public display fields cross the server/client boundary, never source contract paths.
  return [...result.values()];
}
