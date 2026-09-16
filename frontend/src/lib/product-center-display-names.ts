const productCenterDisplayNameBySlug: Partial<Record<string, string>> = {
  'roller-mesh-belt-line': '网带式连续热处理生产线',
};

export function getChineseProductCenterDisplayName(slug: string, fallbackName: string) {
  return productCenterDisplayNameBySlug[slug] ?? fallbackName;
}
