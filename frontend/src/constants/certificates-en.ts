import type { CertificateItem } from './certificates';

const titles: Record<string, string> = {
  '营业执照副本': 'Business License',
  '国家高新技术企业证书': 'National High-Tech Enterprise Certificate',
  'ISO 9001 质量管理体系认证': 'ISO 9001 Quality Management System Certificate',
  '一种高精度温控电阻炉': 'Resistance Furnace with High-Precision Temperature Control',
  '一种高精度温控燃气热处理炉': 'Gas Heat-Treatment Furnace with High-Precision Temperature Control',
  '一种新型气电两用型网带式淬火炉': 'Gas/Electric Mesh-Belt Quenching Furnace',
  '一种箱式电阻炉': 'Box-Type Resistance Furnace',
  '一种不锈钢带连续固溶热处理生产线': 'Continuous Solution Heat-Treatment Line for Stainless Steel Strip',
  '一种燃气加热快速固溶铲齿炉': 'Gas-Heated Rapid Solution-Treatment Furnace',
  '一种箱式燃气气瓶固化炉': 'Gas-Fired Box-Type Curing Furnace for Gas Cylinders',
  '一种链板式铝棒电加热炉': 'Chain-Plate Electric Heating Furnace for Aluminum Rods',
  '一种高效熔化炉': 'High-Efficiency Melting Furnace',
  '退火炉置用炉辊面刮刀清理装置': 'Roller-Surface Scraper Cleaning Device for an Annealing Furnace',
  '一种锻造炉': 'Forging Furnace',
  '一种快速冷却的电阻炉': 'Rapid-Cooling Resistance Furnace',
  '一种保温效果好的电阻炉': 'Resistance Furnace with Improved Thermal Insulation',
  '一种高精度电热热风烘箱': 'High-Precision Electric Hot-Air Oven',
};

export function localizeCertificate(item: CertificateItem, locale: 'zh' | 'en'): CertificateItem {
  if (locale === 'zh') return item;
  const title = titles[item.title] || item.title;
  const details: Record<string, string> = {
    '注册资本 5,080 万元': 'Registered capital: CNY 50.8 million',
    '适用于工业电阻炉、燃气炉的设计、制造': 'Design and manufacture of industrial resistance and gas furnaces',
    '2024 年 12 月 16 日': '16 December 2024',
    '2027 年 1 月 11 日': '11 January 2027',
    '三年': '3 years',
  };

  return {
    ...item,
    title,
    authorizedDate: item.authorizedDate ? details[item.authorizedDate] || item.authorizedDate : undefined,
    validUntil: item.validUntil ? details[item.validUntil] || item.validUntil : undefined,
    alt: `Jiangsu Suneng Industrial Furnace: ${title}`,
    subtitle: item.category === 'patent'
      ? item.subtitle === '发明专利证书' ? 'Invention Patent Certificate' : 'Utility Model Patent Certificate'
      : item.id === 'qualification-high-tech-enterprise' ? 'Recognized in 2024' : item.subtitle ? details[item.subtitle] || item.subtitle : undefined,
  };
}
