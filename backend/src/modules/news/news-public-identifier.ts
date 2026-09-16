const PUBLIC_NEWS_ID_PATTERN = /^[1-9]\d*$/;

const LEGACY_NEWS_ROUTE_ALIASES: Record<string, string> = {
  'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1':
    'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong',
};

export const NONCANONICAL_NEWS_SLUGS = Object.keys(LEGACY_NEWS_ROUTE_ALIASES);

// The stored, already-public slug is the canonical address. Numeric IDs remain lookup aliases.
export function buildPublicNewsIdentifier(slug: string) {
  return getCanonicalLegacyNewsSlug(slug);
}

export function parsePublicNewsIdentifier(identifier: string) {
  if (!PUBLIC_NEWS_ID_PATTERN.test(identifier)) return null;

  const id = Number(identifier);
  return Number.isSafeInteger(id) ? id : null;
}

export function getCanonicalLegacyNewsSlug(slug: string) {
  return LEGACY_NEWS_ROUTE_ALIASES[slug] ?? slug;
}
