import type { LegacyProductCategoryManifest } from './patch-legacy-product-category-redirects.mjs';
import type { LegacyProductDetailManifest } from './patch-legacy-product-detail-redirects.mjs';

export interface LegacyProductRepairReceipt {
  sourceSha256: string;
  candidateSha256: string;
  originalProductMappingsPreserved: number;
  addedDetailIds: string[];
  reviewedCategories: string[];
  allUnrelatedBytesPreserved: true;
  idempotent: true;
  environmentSubstitutionRequired: boolean;
  runtimeValidated: false;
  appliedToServer: false;
}

export interface PreparedLegacyProductRepair {
  candidate: string;
  receipt: LegacyProductRepairReceipt;
}

export function prepareLegacyProductRepair(
  source: string,
  categories: LegacyProductCategoryManifest,
  details: LegacyProductDetailManifest,
): PreparedLegacyProductRepair;
