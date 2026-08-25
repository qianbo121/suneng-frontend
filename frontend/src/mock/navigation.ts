import { isZhOnlyPath } from '@/lib/i18n/zh-only';
import { Locale, NavigationItem } from '@/types/site';

const chineseNavigationItems: NavigationItem[] = [
  {
    key: 'products',
    href: '/products',
    label: { zh: '产品中心', en: 'Products' },
  },
  {
    key: 'selection',
    href: '/#product-types',
    label: { zh: '选型与解决方案', en: 'Selection & Solutions' },
  },
  {
    key: 'engineering',
    href: '/service',
    label: { zh: '改造与工程服务', en: 'Engineering Services' },
    children: [
      {
        key: 'engineering-overview',
        href: '/service',
        label: { zh: '安装、调试与售后服务', en: 'Installation & Service' },
      },
      {
        key: 'engineering-renovation',
        href: '/service/furnace-renovation-overhaul',
        label: { zh: '工业炉改造与大修', en: 'Renovation & Overhaul' },
      },
      {
        key: 'engineering-repair-or-replace',
        href: '/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
        label: { zh: '改造还是换新判断', en: 'Repair or Replace' },
      },
      {
        key: 'engineering-temperature',
        href: '/solutions/rechuli-lu-wendu-bujun-zhenggai',
        label: { zh: '温度不均问题判断', en: 'Temperature Uniformity' },
      },
    ],
  },
  {
    key: 'cases',
    href: '/#case-evidence',
    label: { zh: '案例与证据', en: 'Cases & Evidence' },
    children: [
      {
        key: 'case-renovation',
        href: '/case/anonymous-tsingshan-1250-renovation',
        label: { zh: '连续退洗线改造项目', en: 'Renovation Project' },
      },
      {
        key: 'case-support-roller',
        href: '/case/jining-support-roller-heat-treatment-line',
        label: { zh: '支重轮热处理生产线', en: 'Support Roller Line' },
      },
      {
        key: 'case-annealing',
        href: '/case/henan-annealing-solution-line',
        label: { zh: '连续退火固溶生产线', en: 'Annealing Solution Line' },
      },
    ],
  },
  {
    key: 'resources',
    href: '/news',
    label: { zh: '技术资料', en: 'Resources' },
  },
  {
    key: 'about',
    href: '/about',
    label: { zh: '关于苏能', en: 'About' },
    children: [
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
        key: 'about-partner',
        href: '/partner',
        label: { zh: '合作关系', en: 'Partners' },
      },
      {
        key: 'about-contact',
        href: '/contact',
        label: { zh: '联系方式', en: 'Contact' },
      },
    ],
  },
  {
    key: 'contact',
    href: '/#homepage-lead-form',
    label: { zh: '提交工况', en: 'Submit Requirements' },
  },
];

const englishNavigationItems: NavigationItem[] = [
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

function getLocalizedText(locale: Locale, text: { zh: string; en: string }) {
  return text[locale];
}

function getNavigationChildren(locale: Locale, item: NavigationItem) {
  if (locale === 'zh') return item.children;
  return item.children?.filter((child) => !isZhOnlyPath(child.href));
}

export function getLocalizedNavigation(locale: Locale) {
  const items = locale === 'zh' ? chineseNavigationItems : englishNavigationItems;
  return items.map((item) => ({
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
      if (!map.has(child.href)) map.set(child.href, child.labelText);
    });
  });

  map.set('/products/detail', locale === 'en' ? 'Product Detail' : '产品详情');
  return map;
}
