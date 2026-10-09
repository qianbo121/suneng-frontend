export interface LegacyProductCategoryRoute {
  category: string;
  target: string;
}

export interface LegacyProductCategoryManifest {
  defaultTarget: string;
  routes: readonly LegacyProductCategoryRoute[];
}

export function renderCategoryMap(manifest: LegacyProductCategoryManifest): string;

export function patchCategoryRedirects(
  source: string,
  manifest: LegacyProductCategoryManifest,
): string;
