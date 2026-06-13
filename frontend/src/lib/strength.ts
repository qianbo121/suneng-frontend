import type { Metadata } from 'next';

import { buildSeoMetadata } from '@/lib/seo';
import { StrengthCategoryApiItem, StrengthDisplayCard, StrengthDisplayMode } from '@/types/strength';
import { Locale, SidebarItem } from '@/types/site';

const STRENGTH_BANNER_IMAGE = '/images/about/about_img_hero_factory_01.png';

const fallbackCategories: StrengthCategoryApiItem[] = [
  { id: 1, nameZh: '技术团队', nameEn: 'Technical Team', slug: 'technical-team' },
  { id: 2, nameZh: '荣誉资质', nameEn: 'Honors', slug: 'honors' },
  { id: 3, nameZh: '资质证书', nameEn: 'Certificates', slug: 'certificates' },
];

function localize(locale: Locale, zh?: string | null, en?: string | null, fallback = '') {
  return locale === 'en' ? en || zh || fallback : zh || en || fallback;
}

function normalizedSlug(slug?: string | null) {
  return (slug || '').toLowerCase();
}

function isHonorCategory(category: StrengthCategoryApiItem) {
  const slug = normalizedSlug(category.slug);
  const zh = category.nameZh;
  return slug.includes('honor') || slug.includes('award') || zh.includes('荣誉');
}

function isCertificateCategory(category: StrengthCategoryApiItem) {
  const slug = normalizedSlug(category.slug);
  const zh = category.nameZh;
  return slug.includes('certificate') || slug.includes('qualification') || zh.includes('资质') || zh.includes('证书');
}

function getDisplayMode(category: StrengthCategoryApiItem): StrengthDisplayMode {
  if (isHonorCategory(category)) return 'certificate-honor';
  if (isCertificateCategory(category)) return 'certificate-qualification';
  return 'strength-item';
}

export function getStrengthSidebarItems(locale: Locale, categories: StrengthCategoryApiItem[]): SidebarItem[] {
  return categories.map((item, index) => ({
    label: localize(locale, item.nameZh, item.nameEn, fallbackCategories[index]?.nameZh || ''),
    href: index === 0 ? `/${locale}/strength` : `/${locale}/strength/${item.slug}`,
    matchHrefs: index === 0 ? [`/${locale}/strength/${item.slug}`] : undefined,
  }));
}

export function getStrengthCategoryBySlug(categories: StrengthCategoryApiItem[], slug?: string) {
  if (!slug) return categories[0] || null;
  return categories.find((item) => item.slug === slug) || null;
}

export async function createStrengthMetadata(locale: Locale, categorySlug?: string): Promise<Metadata> {
  const currentCategory = getStrengthCategoryBySlug(fallbackCategories, categorySlug);
  const title = currentCategory
    ? localize(locale, currentCategory.nameZh, currentCategory.nameEn)
    : locale === 'en'
      ? 'Strength'
      : '实力展示';
  const description =
    locale === 'en'
      ? 'Explore the company strength, honors and equipment capability.'
      : '展示企业实力、荣誉资质与生产设备能力。';

  return buildSeoMetadata({
    locale,
    path: currentCategory && categorySlug ? `/strength/${currentCategory.slug}` : '/strength',
    pageKey: currentCategory && categorySlug ? `strength-category-${currentCategory.slug}` : 'strength',
    title,
    description,
    keywords:
      locale === 'en'
        ? ['company strength', 'industrial furnace equipment', 'certificates', 'production capability']
        : ['企业实力', '工业炉生产设备', '热处理设备资质', '工业炉荣誉证书', title],
    image: STRENGTH_BANNER_IMAGE,
  });
}

export async function getStrengthPageData(locale: Locale, options?: { categorySlug?: string; page?: number; pageSize?: number }) {
  const currentCategory = getStrengthCategoryBySlug(fallbackCategories, options?.categorySlug);
  const currentPage = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 12;
  const displayMode = currentCategory ? getDisplayMode(currentCategory) : ('strength-item' as StrengthDisplayMode);

  return {
    categories: fallbackCategories,
    currentCategory,
    cards: [] as StrengthDisplayCard[],
    page: currentPage,
    pageSize,
    total: 0,
    error: null,
    sidebarItems: getStrengthSidebarItems(locale, fallbackCategories),
    displayMode,
  };
}
