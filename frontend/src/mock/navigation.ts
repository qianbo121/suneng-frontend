import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { isZhOnlyPath } from '@/lib/i18n/zh-only';
import { Locale, NavigationItem } from '@/types/site';

const chineseNavigationItems: NavigationItem[] = [
  {
    key: 'home',
    href: '/',
    label: { zh: '网站首页', en: 'Home' },
  },
  {
    key: 'products',
    href: '/products',
    label: { zh: '设备与生产线', en: 'Products' },
  },
  {
    key: 'engineering',
    href: '/service',
    label: { zh: '改造与服务', en: 'Engineering Services' },
    children: [
      {
        key: 'engineering-renovation',
        href: '/service/furnace-renovation-overhaul',
        label: { zh: '维修与改造', en: 'Repair & Renovation' },
      },
      {
        key: 'engineering-relocation',
        href: '/service/furnace-relocation-restart',
        label: { zh: '搬迁与复产', en: 'Relocation & Restart' },
      },
      {
        key: 'engineering-after-sales',
        href: '/service/installation-after-sales',
        label: { zh: '安装与售后', en: 'Installation & After-sales' },
      },
      {
        key: 'engineering-guides',
        href: '/solutions',
        label: { zh: '选型与改造指南', en: 'Selection & Retrofit Guides' },
      },
    ],
  },
  {
    key: 'cases',
    href: '/case',
    label: { zh: '项目案例', en: 'Project Cases' },
    // One approved case cannot carry a top-level menu: a visitor who opens
    // "Project Cases" and finds a single entry reads it as a single project.
    // The page, its sitemap entry and the evidence links from product pages
    // stay. Put it back once six to eight delivered, owner-approved cases are
    // published (see REVIEWED_PUBLIC_CASES).
    hiddenFromMenu: true,
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
        label: { zh: '公司介绍', en: 'Company Profile' },
      },
      {
        key: 'about-honors',
        href: '/strength/honors',
        label: { zh: '荣誉资质', en: 'Honors' },
      },
      {
        key: 'about-partner',
        href: '/partner',
        label: { zh: '合作单位', en: 'Partners' },
      },
      {
        key: 'about-contact',
        href: '/contact',
        label: { zh: '联系我们', en: 'Contact' },
      },
    ],
  },
];

const englishNavigationItems: NavigationItem[] = chineseNavigationItems.map((item) => ({
  ...item,
  label: item.key === 'engineering' ? { ...item.label, en: 'Service & Retrofit' } : item.label,
}));

function getLocalizedText(locale: Locale, text: { zh: string; en: string }) {
  return text[locale];
}

// Publication is decided per locale, so check the prefixed destination.
function localizedHref(locale: Locale, href: string) {
  return href === '/' ? `/${locale}` : `/${locale}${href}`;
}

function getNavigationChildren(locale: Locale, item: NavigationItem) {
  return item.children?.filter((child) => !isWithdrawnTechnicalPath(localizedHref(locale, child.href)) && (locale === 'zh' || !isZhOnlyPath(child.href)));
}

// Every published destination with its localized names, menu or not: the
// breadcrumb needs a name for a page the menus leave out.
function getLocalizedDestinations(locale: Locale) {
  const items = locale === 'zh' ? chineseNavigationItems : englishNavigationItems;
  return items.filter((item) => !isWithdrawnTechnicalPath(localizedHref(locale, item.href))).map((item) => ({
    ...item,
    labelText: getLocalizedText(locale, item.label),
    children: getNavigationChildren(locale, item)?.map((child) => ({
      ...child,
      labelText: getLocalizedText(locale, child.label),
    })),
  }));
}

/** The header and drawer menus. */
export function getLocalizedNavigation(locale: Locale) {
  return getLocalizedDestinations(locale).filter((item) => !item.hiddenFromMenu);
}

export function getRouteLabelMap(locale: Locale) {
  const map = new Map<string, string>();

  getLocalizedDestinations(locale).forEach((item) => {
    map.set(item.href, item.labelText);
    item.children?.forEach((child) => {
      if (!map.has(child.href)) map.set(child.href, child.labelText);
    });
  });

  // Page breadcrumbs keep their existing names when navigation copy or grouping changes.
  if (locale === 'zh') {
    const pageLabels: Record<string, string> = {
      '/products': '产品中心',
      '/solutions': '解决方案',
      '/solutions/continuous-heat-treatment-line': '连续热处理生产线',
      '/solutions/rechuli-lu-wendu-bujun-zhenggai': '温度不均整改',
      '/solutions/rechuli-lu-luchen-fanxin': '炉衬翻新',
      '/solutions/rechuli-lu-kongzhi-xitong-shengji': '控制系统升级',
      '/service': '改造与工程服务',
      '/service/furnace-renovation-overhaul': '工业炉改造与大修',
      '/articles/laojiu-rechuli-lu-daxiu-haishi-maixin': '改造还是换新判断',
      '/articles/gongye-lu-baojia-canshu': '工业炉报价参数清单',
      // Only approved case pages belong here: this table ships to every visitor.
      '/case/henan-annealing-solution-line': '连续退火固溶生产线',
      '/partner': '合作关系',
      '/contact': '联系方式',
    };
    Object.entries(pageLabels).forEach(([href, label]) => map.set(href, label));
  }

  map.set('/products/detail', locale === 'en' ? 'Product Detail' : '产品详情');
  return map;
}
