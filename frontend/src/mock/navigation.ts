import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';
import { Locale, NavigationItem } from '@/types/site';

const productNavigationOrder = [
  'trolley-furnace',
  'box-furnace',
  'pit-furnace',
  'bell-furnace',
  'mesh-belt-furnace',
  'roller-hearth-furnace',
  'pusher-furnace',
  'rotary-hearth-furnace',
  'roller-mesh-belt-line',
  'copper-wire-annealing-line',
  'annealing-solution-line',
];

export const productCenterNavigationItems: NonNullable<NavigationItem['children']> = [
  ...productNavigationOrder
    .map((slug) => PRODUCT_CENTER_CATEGORIES.find((item) => item.slug === slug))
    .filter((item): item is (typeof PRODUCT_CENTER_CATEGORIES)[number] => Boolean(item))
    .map((item) => ({
      key: item.key,
      href: `/products/detail/${item.slug}`,
      label: item.name,
    })),
  {
    key: 'products-continuous-heat-treatment-line',
    href: '/solutions/continuous-heat-treatment-line',
    label: { zh: '连续热处理生产线方案', en: 'Continuous Heat Treatment Line' },
  },
];

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
    children: productCenterNavigationItems,
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
      key: 'about-suneng-profile',
      href: '/about/suneng-profile',
      label: { zh: '苏能实力', en: 'Suneng Profile' },
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
      key: 'about-equipment',
      href: '/strength/equipment',
      label: { zh: '生产设备', en: 'Production Equipment' },
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
    {
      key: 'service-contact',
      href: '/contact',
      label: { zh: '联系我们', en: 'Contact Us' },
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
