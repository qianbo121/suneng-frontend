export const PARTNER_INDUSTRY_GROUPS = [
  '金属材料',
  '机械与装备',
  '汽车零部件',
  '能源装备',
  '加工与热处理',
  '其他行业',
] as const;
export type PartnerIndustryGroup = (typeof PARTNER_INDUSTRY_GROUPS)[number];

/** Group only the public industry description; never infer from a company name. */
export function partnerIndustryGroup(industry: string | null): PartnerIndustryGroup | null {
  if (!industry) return null;
  if (/汽车/.test(industry)) return '汽车零部件';
  if (/能源|氢能|天然气|核电|石化|输配电/.test(industry)) return '能源装备';
  if (/热处理|铸造|铸钢|锻件|金属加工|成形制造/.test(industry)) return '加工与热处理';
  // Generic materials also include chemicals and research; retain the two reviewed metal labels.
  if (
    /金属材料|冶金|钢铁|不锈钢|钢管|管材|合金|工具钢/.test(industry) ||
    industry === '模具材料' ||
    industry === '矿用耐磨材料'
  )
    return '金属材料';
  if (/装备|设备|机械|机床|零部件|管件|管道|流体|阀门|传动|工具|紧固件|仪器|船舶/.test(industry))
    return '机械与装备';
  return '其他行业';
}
