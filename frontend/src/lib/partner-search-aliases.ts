// Verified against /images/partners/homepage/11-liuhe-light-alloy.png.
// Search terms do not replace the displayed Chinese company identity.
const SEARCH_ALIASES: Readonly<Record<string, string>> = {
  '六和轻合金（苏州）有限公司': 'LIUHE',
};

export function partnerSearchAliases(fullName: string): string {
  return SEARCH_ALIASES[fullName] ?? '';
}
