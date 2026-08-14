export const LEGACY_PRODUCT_CATEGORY_SLUGS = [
  'charging-truck-series',
  'scaling-vehicle-series',
  'crusher-series',
  'mobile-crane',
  '4t-chassis-series',
  '8t-chassis-series',
  'integrated-chassis-series',
  'concrete-mixer-transport-series',
  'underground-shotcrete-series',
  'underground-masonry-multi-function-series',
] as const;

export const LEGACY_PRODUCT_SLUGS = LEGACY_PRODUCT_CATEGORY_SLUGS.map(
  (slug, index) => `${slug}-sample-${index + 1}`,
);

export const LEGACY_NEWS_SLUGS = ['industry-mining-equipment-update'] as const;

export const LEGACY_BANNER_TITLES_ZH = [
  '专注地下工程装备制造与解决方案',
  '制造业质感的矿山机械设备品牌官网',
  '技术驱动交付，服务覆盖全国',
] as const;

export const LEGACY_BANNER_TITLES_EN = [
  'Focused on Underground Equipment and Turnkey Solutions',
  'A Manufacturing-grade Website for Mining Machinery Brands',
  'Technology-driven Delivery with Nationwide Service',
] as const;

export const LEGACY_ABOUT_MARKERS = [
  '腾腾装备',
  'Tianteng Equipment',
  '地下工程装备',
  'underground engineering equipment',
  '矿山施工装备',
  '专用底盘',
  'special chassis',
] as const;

export function containsLegacyAboutContent(values: Array<string | null | undefined>) {
  const text = values
    .filter((value): value is string => Boolean(value))
    .join('\n')
    .toLowerCase();

  return LEGACY_ABOUT_MARKERS.some((marker) => text.includes(marker.toLowerCase()));
}

export function isPlaceholderPartner(name: string, website?: string | null) {
  const normalizedWebsite = website?.replace(/\/+$/, '') ?? '';
  const nameMatch = /^合作伙伴\s+[1-8]$/.test(name.trim());
  const websiteMatch = /^https:\/\/example-[1-8]\.com$/i.test(normalizedWebsite);

  return nameMatch && websiteMatch;
}

type GovernedSeedSteps = {
  seedCurrentContent: () => Promise<void>;
  disableLegacyContent: () => Promise<void>;
  assertNoLegacyPublicContent: () => Promise<void>;
};

export async function runGovernedContentSeed(steps: GovernedSeedSteps) {
  let seedFailure: unknown;

  try {
    await steps.seedCurrentContent();
  } catch (error) {
    seedFailure = error;
  }

  // 清理必须最后执行；即使前面的初始化失败，也不能遗留已公开的旧站内容。
  await steps.disableLegacyContent();
  await steps.assertNoLegacyPublicContent();

  if (seedFailure) throw seedFailure;
}
