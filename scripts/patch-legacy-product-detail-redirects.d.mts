export interface LegacyProductDetailRoute {
  id: string;
  target: string;
}

export interface LegacyProductDetailManifest {
  routes: readonly LegacyProductDetailRoute[];
}

export function patchDetailRedirects(
  source: string,
  manifest: LegacyProductDetailManifest,
): string;
