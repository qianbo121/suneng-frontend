export type CertificateItem = {
  id: string;
  category: 'qualification' | 'iso' | 'patent';
  title: string;
  subtitle?: string;
  certificateNo?: string;
  patentNo?: string;
  announcementNo?: string;
  authorizedDate?: string;
  validUntil?: string;
  image: string;
  alt: string;
  relatedProduct?: string;
  sortOrder: number;
};

export const SUNENG_QUALIFICATION_CERTIFICATES: CertificateItem[] = [
  {
    id: 'qualification-business-license',
    category: 'qualification',
    title: '营业执照副本',
    subtitle: '注册资本 5,080 万元',
    certificateNo: '91321204796529654Q',
    image: '/images/certificates/qualifications/qualification-business-license.jpg',
    alt: '江苏苏能工业炉有限公司营业执照副本，注册资本 5,080 万元',
    sortOrder: 1,
  },
  {
    id: 'qualification-high-tech-enterprise',
    category: 'qualification',
    title: '国家高新技术企业证书',
    subtitle: '2024 年认定',
    certificateNo: 'GR202432008987',
    authorizedDate: '2024 年 12 月 16 日',
    validUntil: '三年',
    image: '/images/certificates/qualifications/qualification-high-tech-enterprise.jpg',
    alt: '江苏苏能工业炉有限公司国家高新技术企业证书，证书编号 GR202432008987',
    sortOrder: 2,
  },
];

export const SUNENG_ISO_CERTIFICATES: CertificateItem[] = [
  {
    id: 'iso-9001',
    category: 'iso',
    title: 'ISO 9001 质量管理体系认证',
    subtitle: '适用于工业电阻炉、燃气炉的设计、制造',
    certificateNo: '03824Q60289R3S',
    validUntil: '2027 年 1 月 11 日',
    image: '/images/certificates/iso/iso-9001-quality-management.jpg',
    alt: '江苏苏能工业炉有限公司 ISO 9001 质量管理体系认证证书',
    sortOrder: 1,
  },
];

export const SUNENG_PATENT_CERTIFICATES: CertificateItem[] = [
  {
    id: 'patent-01-high-precision-temperature-control-resistance-furnace',
    category: 'patent',
    title: '一种高精度温控电阻炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-01-high-precision-temperature-control-resistance-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种高精度温控电阻炉',
    relatedProduct: '电阻炉',
    sortOrder: 1,
  },
  {
    id: 'patent-02-high-precision-temperature-control-gas-heat-treatment-furnace',
    category: 'patent',
    title: '一种高精度温控燃气热处理炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-02-high-precision-temperature-control-gas-heat-treatment-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种高精度温控燃气热处理炉',
    relatedProduct: '燃气热处理炉',
    sortOrder: 2,
  },
  {
    id: 'patent-03-gas-electric-mesh-belt-quenching-furnace',
    category: 'patent',
    title: '一种新型气电两用型网带式淬火炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-03-gas-electric-mesh-belt-quenching-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种新型气电两用型网带式淬火炉',
    relatedProduct: '网带式淬火炉',
    sortOrder: 3,
  },
  {
    id: 'patent-04-box-type-resistance-furnace',
    category: 'patent',
    title: '一种箱式电阻炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-04-box-type-resistance-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种箱式电阻炉',
    relatedProduct: '箱式电阻炉',
    sortOrder: 4,
  },
  {
    id: 'patent-05-stainless-steel-strip-continuous-solution-heat-treatment-line',
    category: 'patent',
    title: '一种不锈钢带连续固溶热处理生产线',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-05-stainless-steel-strip-continuous-solution-heat-treatment-line.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种不锈钢带连续固溶热处理生产线',
    relatedProduct: '连续固溶热处理生产线',
    sortOrder: 5,
  },
  {
    id: 'patent-06-gas-heated-rapid-solution-aluminum-tooth-furnace',
    category: 'patent',
    title: '一种燃气加热快速固溶铝齿炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-06-gas-heated-rapid-solution-aluminum-tooth-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种燃气加热快速固溶铝齿炉',
    relatedProduct: '燃气固溶炉',
    sortOrder: 6,
  },
  {
    id: 'patent-07-box-type-gas-cylinder-curing-furnace',
    category: 'patent',
    title: '一种箱式燃气气瓶固化炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-07-box-type-gas-cylinder-curing-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种箱式燃气气瓶固化炉',
    relatedProduct: '固化炉',
    sortOrder: 7,
  },
  {
    id: 'patent-08-chain-plate-aluminum-rod-electric-heating-furnace',
    category: 'patent',
    title: '一种链板式铝棒电加热炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-08-chain-plate-aluminum-rod-electric-heating-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种链板式铝棒电加热炉',
    relatedProduct: '电加热炉',
    sortOrder: 8,
  },
  {
    id: 'patent-09-high-efficiency-melting-furnace',
    category: 'patent',
    title: '一种高效熔化炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-09-high-efficiency-melting-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种高效熔化炉',
    relatedProduct: '熔化炉',
    sortOrder: 9,
  },
  {
    id: 'patent-10-annealing-furnace-roller-scraper-cleaning-device',
    category: 'patent',
    title: '退火炉置用炉辊面刮刀清理装置',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-10-annealing-furnace-roller-scraper-cleaning-device.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：退火炉置用炉辊面刮刀清理装置',
    relatedProduct: '退火炉',
    sortOrder: 10,
  },
  {
    id: 'patent-11-forging-furnace',
    category: 'patent',
    title: '一种锻造炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-11-forging-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种锻造炉',
    relatedProduct: '锻造炉',
    sortOrder: 11,
  },
  {
    id: 'patent-12-fast-cooling-resistance-furnace',
    category: 'patent',
    title: '一种快速冷却的电阻炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-12-fast-cooling-resistance-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种快速冷却的电阻炉',
    relatedProduct: '电阻炉',
    sortOrder: 12,
  },
  {
    id: 'patent-13-thermal-insulation-resistance-furnace',
    category: 'patent',
    title: '一种保温效果好的电阻炉',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-13-thermal-insulation-resistance-furnace.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种保温效果好的电阻炉',
    relatedProduct: '电阻炉',
    sortOrder: 13,
  },
  {
    id: 'patent-14-high-precision-electric-hot-air-oven',
    category: 'patent',
    title: '一种高精度电热热风烘箱',
    subtitle: '实用新型专利证书',
    image: '/images/certificates/patents/patent-14-high-precision-electric-hot-air-oven.jpg',
    alt: '江苏苏能工业炉有限公司实用新型专利证书：一种高精度电热热风烘箱',
    relatedProduct: '热风烘箱',
    sortOrder: 14,
  },
];
