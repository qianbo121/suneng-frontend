import type { Metadata } from 'next';

import { siteSettings } from '@/mock/siteSettings';
import { Locale } from '@/types/site';

type BuildSeoMetadataOptions = {
  locale: Locale;
  path: string;
  pageKey?: string;
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
};

const LOCALE_OG_MAP: Record<Locale, string> = {
  zh: 'zh_CN',
  en: 'en_US',
};

const SITE_LOGO_PATH = '/images/brand/sn-logo-header.png';
const FALLBACK_SITE_URL = 'https://www.sunengfurnace.com';

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

function normalizeKeywords(value?: string | null) {
  const raw = compactText(value);
  if (!raw) return undefined;

  return raw
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function buildSeoMetadata(options: BuildSeoMetadataOptions): Promise<Metadata> {
  const title = options.title;
  const description = compactText(options.description || options.title).slice(0, 160);
  const keywords = normalizeKeywords(options.keywords || '');
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

export function buildOrganizationJsonLd(
  locale: Locale,
  options?: { phone?: string; email?: string; address?: string; logo?: string },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteSettings.companyName[locale],
    alternateName: getSiteName(locale),
    url: buildLocalizedUrl(locale, '/'),
    logo: options?.logo || `${getSiteUrl()}${SITE_LOGO_PATH}`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: options?.phone || siteSettings.topPhone,
        contactType: 'sales',
        email: options?.email || siteSettings.email,
        areaServed: 'CN',
        availableLanguage: ['zh-CN', 'en-US'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: options?.address || siteSettings.address[locale],
      addressCountry: 'CN',
    },
  };
}

export function buildProductJsonLd(
  locale: Locale,
  options: { name: string; description: string; image: string[]; sku?: string; category?: string },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: options.name,
    description: compactText(options.description),
    image: options.image,
    sku: options.sku,
    category: options.category,
    brand: {
      '@type': 'Brand',
      name: getSiteName(locale),
    },
  };
}

export function buildArticleJsonLd(
  locale: Locale,
  options: { headline: string; description: string; image?: string; datePublished?: string; authorName?: string; url: string },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.headline,
    description: compactText(options.description),
    image: options.image ? [options.image] : undefined,
    datePublished: options.datePublished,
    dateModified: options.datePublished,
    author: {
      '@type': 'Organization',
      name: options.authorName || getSiteName(locale),
    },
    publisher: {
      '@type': 'Organization',
      name: getSiteName(locale),
      logo: {
        '@type': 'ImageObject',
        url: `${getSiteUrl()}${SITE_LOGO_PATH}`,
      },
    },
    mainEntityOfPage: options.url,
  };
}
