import type { Metadata } from 'next';

import { siteSettings } from '@/mock/siteSettings';
import { buildKeywords, normalizeKeywords } from '@/lib/seo/keywords';
import { Locale } from '@/types/site';

type BuildSeoMetadataOptions = {
  locale: Locale;
  path: string;
  pageKey?: string;
  title: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
};

const LOCALE_OG_MAP: Record<Locale, string> = {
  zh: 'zh_CN',
  en: 'en_US',
};

const FALLBACK_SITE_URL = 'https://www.jssngyl.cn';
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

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured.replace(/\/+$/, '');
  }

  return FALLBACK_SITE_URL;
}

export function getSiteName(locale: Locale) {
  return siteSettings.siteName[locale];
}

export function buildLocalizedPath(locale: Locale, path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath === '/') {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}

export function buildLocalizedUrl(locale: Locale, path = '') {
  return `${getSiteUrl()}${buildLocalizedPath(locale, path)}`;
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

export async function buildSeoMetadata(options: BuildSeoMetadataOptions): Promise<Metadata> {
  const title = options.title;
  const description = compactText(options.description || options.title).slice(0, 160);
  const pageKey = options.pageKey?.replace(/^strength-category-.+$/, 'strength');
  const keywords = buildKeywords(pageKey, normalizeKeywords(options.keywords));
  const image = options.image || undefined;
  const fullTitle = `${title} | ${getSiteName(options.locale)}`;
  const canonical = buildLocalizedUrl(options.locale, options.path);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        'zh-CN': buildLocalizedUrl('zh', options.path),
        'en-US': buildLocalizedUrl('en', options.path),
      },
    },
    openGraph: {
      type: options.type || 'website',
      locale: LOCALE_OG_MAP[options.locale],
      url: canonical,
      title: fullTitle,
      description,
      siteName: getSiteName(options.locale),
      images: image
        ? [
            {
              url: image,
              alt: buildImageAlt(options.locale, title, getSiteName(options.locale)),
            },
          ]
        : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      images: image ? [image] : [],
    },
    robots: options.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
