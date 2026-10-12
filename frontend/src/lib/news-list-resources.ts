import type { NewsListCardItem } from '@/types/news';
import type { Locale } from '@/types/site';

export const PROCUREMENT_RESOURCE_SLUG = 'special-industrial-furnace-procurement-assessment';
export const PROCUREMENT_RESOURCE_HREF = `/zh/articles/${PROCUREMENT_RESOURCE_SLUG}`;

const procurementResource: NewsListCardItem = {
  id: -1,
  slug: PROCUREMENT_RESOURCE_SLUG,
  href: PROCUREMENT_RESOURCE_HREF,
  image: '/images/home/suneng-factory-hero-1600.webp',
  title: {
    zh: '专项工业炉采购评估：室式退火、燃气、气氛、球化与烘箱',
    en: '',
  },
  summary: {
    zh: '室式退火、燃气热处理、可控气氛、球化退火和工业烘箱等设备，先核对工件、工艺、装载及现场条件，再确定设备结构、配置和报价范围。',
    en: '',
  },
  category: { zh: '报价采购', en: '' },
  // The standalone page has no public publication date or readership count.
  date: '',
  listTopic: 'procurement',
  listFurnaces: [],
  listEquipmentLabel: '工业炉',
  // Matches the approved ordinary-card placement after the featured article.
  // This is editorial ordering, independent of publication dates and views.
  listRecommendedPosition: 1,
};

export function includeStandaloneNewsResources(
  items: NewsListCardItem[],
  locale: Locale,
): NewsListCardItem[] {
  if (locale !== 'zh' || items.some((item) => item.slug === PROCUREMENT_RESOURCE_SLUG)) {
    return items;
  }
  return [...items, procurementResource];
}

export function getNewsListCardHref(item: NewsListCardItem, locale: Locale) {
  return item.href || `/${locale}/news/${item.slug}`;
}
