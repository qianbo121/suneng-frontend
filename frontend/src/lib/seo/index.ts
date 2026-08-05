import { siteSettings } from '@/mock/siteSettings';
import { Locale } from '@/types/site';

const ALT_SEPARATOR: Record<Locale, string> = {
  zh: '｜',
  en: ' | ',
};

const BRAND_ALT = {
  full: {
    zh: '江苏苏能工业炉有限公司',
    en: 'Jiangsu Suneng Industrial Furnace Co., Ltd.',
  },
  short: {
    zh: '苏能工业炉',
    en: 'Suneng Industrial Furnace',
  },
} as const;

export function compactText(value?: string | null) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

export function getSiteName(locale: Locale) {
  return siteSettings.siteName[locale];
}

export function buildImageAlt(locale: Locale, primary?: string | null, fallback?: string) {
  const cleanedPrimary = compactText(primary);
  if (cleanedPrimary) return cleanedPrimary;

  return fallback || getSiteName(locale);
}

export function buildBrandImageAlt(locale: Locale, variant: 'full' | 'short' = 'full') {
  return BRAND_ALT[variant][locale];
}

export function joinImageAlt(locale: Locale, parts: Array<string | null | undefined>) {
  const cleanedParts = parts
    .map((part) => compactText(part))
    .filter(Boolean);

  return cleanedParts.join(ALT_SEPARATOR[locale]);
}

export function buildProductImageAlt(
  locale: Locale,
  productName?: string | null,
  descriptor?: string | null,
) {
  const fallbackProductName = locale === 'en' ? 'Industrial furnace equipment' : '工业炉设备';

  return joinImageAlt(locale, [
    productName || fallbackProductName,
    descriptor,
    buildBrandImageAlt(locale, 'short'),
  ]);
}

export function buildIndexedImageAlt(
  locale: Locale,
  baseAlt: string,
  index: number,
  label?: string,
) {
  const defaultLabel = locale === 'en' ? `image ${index + 1}` : `图 ${index + 1}`;

  return joinImageAlt(locale, [baseAlt, label || defaultLabel]);
}
