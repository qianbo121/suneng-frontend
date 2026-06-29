export const DEFAULT_KEYWORDS = [
  '工业炉',
  '热处理炉',
  '热处理设备',
  '工业炉厂家',
  '非标工业炉',
];

const EN_DEFAULT_KEYWORDS = [
  'industrial furnace',
  'heat treatment furnace',
  'heat-treatment equipment',
  'custom industrial furnace',
  'industrial furnace manufacturer',
];

const PAGE_KEYWORDS: Record<string, string[]> = {
  home: ['江苏苏能工业炉', '工业炉制造商', '工业热处理设备'],
  products: ['工业炉产品', '热处理生产线', '非标热处理炉'],
  'product-detail': ['工业炉定制', '热处理设备定制', '非标工业炉方案'],
  news: ['工业炉新闻', '热处理行业资讯', '工业炉技术文章'],
  'news-detail': ['工业炉技术', '热处理工艺', '热处理设备案例'],
  about: ['江苏苏能工业炉有限公司', '苏能资质', '苏能案例'],
  'about-profile': ['公司简介', '江苏工业炉厂家', '工业炉研发制造'],
  'about-chairman': ['董事长致辞', '苏能工业炉企业理念'],
  'about-culture': ['企业文化', '质量管理', '客户服务'],
  'about-timeline': ['发展历程', '苏能工业炉历程'],
  contact: ['苏能工业炉联系方式', '苏能工业炉地址', '工业炉厂家电话'],
  service: ['工业炉售后服务', '热处理炉售后', '工业炉维修维护'],
  partner: ['工业炉合作伙伴', '热处理设备客户', '工业炉应用行业'],
  strength: ['工业炉企业实力', '热处理炉生产设备', '工业炉荣誉资质'],
};

const EN_PAGE_KEYWORDS: Record<string, string[]> = {
  home: ['Suneng Industrial Furnace', 'heat-treatment furnace manufacturer', 'industrial heat-treatment equipment'],
  products: ['heat-treatment furnace products', 'continuous heat-treatment line', 'custom heat-treatment furnace'],
  'product-detail': ['custom heat-treatment furnace', 'custom industrial furnace', 'heat-treatment equipment solution'],
  news: ['industrial furnace resources', 'heat-treatment industry notes', 'industrial furnace technical articles'],
  'news-detail': ['industrial furnace technology', 'heat-treatment process', 'heat-treatment equipment case'],
  about: ['Jiangsu Suneng Industrial Furnace Co Ltd', 'Suneng certifications', 'industrial furnace manufacturer'],
  'about-profile': ['company profile', 'Jiangsu furnace manufacturer', 'industrial furnace design and manufacturing'],
  'about-chairman': ['chairman message', 'Suneng Industrial Furnace values'],
  'about-culture': ['corporate culture', 'quality management', 'customer service'],
  'about-timeline': ['company history', 'Suneng Industrial Furnace development'],
  contact: ['Suneng Industrial Furnace contact', 'Jiangsu furnace manufacturer contact', 'industrial furnace supplier phone'],
  service: ['industrial furnace after-sales service', 'heat treatment furnace service', 'industrial furnace maintenance'],
  partner: ['industrial furnace partners', 'heat-treatment equipment customers', 'industrial furnace application industries'],
  strength: ['industrial furnace manufacturing capability', 'heat-treatment furnace production equipment', 'industrial furnace certifications'],
};

const KEYWORD_SPLIT_PATTERN = /[，,、;；\n\r]+/;

export function normalizeKeywords(value?: string | string[] | null) {
  const rawItems = Array.isArray(value) ? value : value ? value.split(KEYWORD_SPLIT_PATTERN) : [];

  return rawItems
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mergeKeywords(...groups: Array<string[] | undefined>) {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const group of groups) {
    for (const keyword of group || []) {
      const normalized = keyword.trim();
      const key = normalized.toLowerCase();

      if (!normalized || seen.has(key)) continue;

      seen.add(key);
      merged.push(normalized);
    }
  }

  return merged;
}

type KeywordLocale = 'zh' | 'en';

export function buildKeywords(pageKey?: string, keywords?: string | string[] | null, locale: KeywordLocale = 'zh') {
  const pageKeywords = pageKey ? (locale === 'en' ? EN_PAGE_KEYWORDS[pageKey] : PAGE_KEYWORDS[pageKey]) : undefined;
  const defaultKeywords = locale === 'en' ? EN_DEFAULT_KEYWORDS : DEFAULT_KEYWORDS;

  return mergeKeywords(normalizeKeywords(keywords), pageKeywords, defaultKeywords).slice(0, 8);
}
