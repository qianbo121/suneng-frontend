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
    label: { zh: '关于我们', en: 'About' },
    children: [
      { key: 'company', href: '/about', label: { zh: '公司简介', en: 'Company Profile' } },
      { key: 'organization', href: '/about/organization', label: { zh: '组织架构', en: 'Organization' } },
    ],
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

export function getLocalizedText(locale: Locale, text: { zh: string; en: string }) {
  return text[locale];
}

export function getLocalizedNavigation(locale: Locale) {
  return navigationItems.map((item) => ({
    ...item,
    labelText: getLocalizedText(locale, item.label),
    children: item.children?.map((child) => ({
      ...child,
      labelText: getLocalizedText(locale, child.label),
    })),
  }));
}

export function getRouteLabelMap(locale: Locale) {
  const map = new Map<string, string>();

  navigationItems.forEach((item) => {
    map.set(item.href, getLocalizedText(locale, item.label));
    item.children?.forEach((child) => {
      if (!map.has(child.href)) {
        map.set(child.href, getLocalizedText(locale, child.label));
      }
    });
  });

  map.set('/products/detail', locale === 'en' ? 'Product Detail' : '产品详情');

  return map;
}
