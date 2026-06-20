import { isZhOnlyPath } from '@/lib/i18n/zh-only';
import { Locale, NavigationItem } from '@/types/site';

export const navigationItems: NavigationItem[] = [
  {
    key: 'home',
    href: '/',
    label: { zh: '首页', en: 'Home' },
  },
  {
    key: 'products',
    href: '/products',
    label: { zh: '产品中心', en: 'Products' },
  },
  {
    key: 'service',
    href: '/service',
    label: { zh: '服务支持', en: 'Service' },
  },
  {
    key: 'resources',
    href: '/news',
    label: { zh: '资料中心', en: 'Resources' },
  },
  {
    key: 'about',
    href: '/about',
    label: { zh: '关于苏能', en: 'About' },
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
      key: 'about-honors',
      href: '/strength/honors',
      label: { zh: '荣誉资质', en: 'Honors' },
    },
    {
      key: 'about-certificates',
      href: '/strength/certificates',
      label: { zh: '体系认证', en: 'Certifications' },
    },
    {
      key: 'about-partner',
      href: '/partner',
      label: { zh: '合作伙伴', en: 'Partners' },
    },
    {
      key: 'about-case-tsingshan-1250-renovation',
      href: '/case/anonymous-tsingshan-1250-renovation',
      label: { zh: '项目案例', en: 'Project Case' },
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
    {
      key: 'service-industrial-furnace-quote-params',
      href: '/articles/gongye-lu-baojia-canshu',
      label: { zh: '工业炉报价需要哪些参数', en: 'Industrial Furnace Quote Parameters' },
    },
    {
      key: 'service-repair-or-replace',
      href: '/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
      label: { zh: '老旧工业炉该修还是换', en: 'Repair or Replace Old Furnace' },
    },
  ],
};

export function getLocalizedText(locale: Locale, text: { zh: string; en: string }) {
  return text[locale];
}

function getNavigationChildren(locale: Locale, item: NavigationItem) {
  if (locale !== 'zh') {
    // Drop base children whose target only exists in Chinese — linking to them
    // on /en produces a hard 404 (e.g. solutions/continuous-heat-treatment-line).
    return item.children?.filter((child) => !isZhOnlyPath(child.href));
  }

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
