import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';
import { Locale, NavigationItem } from '@/types/site';

export const productCenterNavigationItems: NonNullable<NavigationItem['children']> = PRODUCT_CENTER_CATEGORIES.map((item) => ({
  key: item.key,
  href: `/products/detail/${item.slug}`,
  label: item.name,
}));

export const navigationItems: NavigationItem[] = [
  {
    key: 'home',
    href: '/',
    label: { zh: '官网首页', en: 'Home' },
  },
  {
    key: 'about',
    href: '/about',
    label: { zh: '关于苏能', en: 'About' },
  },
  {
    key: 'products',
    href: '/products',
    label: { zh: '产品中心', en: 'Products' },
    children: productCenterNavigationItems,
  },
  {
    key: 'service',
    href: '/service',
    label: { zh: '服务支持', en: 'Service' },
  },
  {
    key: 'partner',
    href: '/partner',
    label: { zh: '合作伙伴', en: 'Partners' },
  },
  {
    key: 'news',
    href: '/news',
    label: { zh: '新闻中心', en: 'News' },
  },
  {
    key: 'contact',
    href: '/contact',
    label: { zh: '联系我们', en: 'Contact' },
  },
];

const zhOnlyNavigationChildren: Partial<Record<string, NonNullable<NavigationItem['children']>>> = {
  about: [
    {
      key: 'about-company',
      href: '/about',
      label: { zh: '公司简介', en: 'Company Profile' },
    },
    {
      key: 'about-suneng-profile',
      href: '/about/suneng-profile',
      label: { zh: '苏能实力', en: 'Suneng Profile' },
    },
    {
      key: 'about-honors',
      href: '/strength/honors',
      label: { zh: '荣誉资质', en: 'Honors' },
    },
  ],
  service: [
    {
      key: 'service-after-sales',
      href: '/service',
      label: { zh: '售后服务', en: 'After-sales Service' },
    },
    {
      key: 'service-furnace-renovation-overhaul',
      href: '/service/furnace-renovation-overhaul',
      label: { zh: '工业炉节能改造与大修服务', en: 'Furnace Renovation and Overhaul' },
    },
  ],
};

export function getLocalizedText(locale: Locale, text: { zh: string; en: string }) {
  return text[locale];
}

function getNavigationChildren(locale: Locale, item: NavigationItem) {
  if (locale !== 'zh') return item.children;

  const zhChildren = zhOnlyNavigationChildren[item.key] ?? [];
  if (!zhChildren.length) return item.children;

  return [...(item.children ?? []), ...zhChildren];
}

export function getLocalizedNavigation(locale: Locale) {
  return navigationItems.map((item) => ({
    ...item,
    labelText: getLocalizedText(locale, item.label),
    children: getNavigationChildren(locale, item)?.map((child) => ({
      ...child,
      labelText: getLocalizedText(locale, child.label),
    })),
  }));
}

export function getRouteLabelMap(locale: Locale) {
  const map = new Map<string, string>();

  getLocalizedNavigation(locale).forEach((item) => {
    map.set(item.href, item.labelText);
    item.children?.forEach((child) => {
      if (!map.has(child.href)) {
        map.set(child.href, child.labelText);
      }
    });
  });

  map.set('/products/detail', locale === 'en' ? 'Product Detail' : '产品详情');

  return map;
}
