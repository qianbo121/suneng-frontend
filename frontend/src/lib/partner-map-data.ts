import partners from '@/constants/partner-public-directory.json';
import type { Partner } from '@/components/partner/map-kit/PartnerMap';

/** Public-only release snapshot: private evidence and name-based guesses stay outside this bundle. */
export function getPartnerMapData(): Partner[] {
  return partners;
}
