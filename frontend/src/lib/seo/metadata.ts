import type { Metadata } from 'next';

import {
  BING_SITE_VERIFICATION,
  BAIDU_SITE_VERIFICATION,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_360_VERIFICATION,
  SITE_NAME,
  SITE_URL,
  SOGOU_SITE_VERIFICATION,
} from '@/lib/seo/config';
import { buildKeywords } from '@/lib/seo/keywords';

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const OPEN_GRAPH_LOCALE_MAP: Record<string, string> = {
  zh: 'zh_CN',
  en: 'en_US',
  'zh-CN': 'zh_CN',
  'en-US': 'en_US',
  zh_CN: 'zh_CN',
  en_US: 'en_US',
};

export function absoluteUrl(path = '/') {
  const input = path.trim() || '/';

  if (ABSOLUTE_URL_PATTERN.test(input)) {
    const parsed = new URL(input);
    const normalizedPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    if (/localhost|127\.0\.0\.1/i.test(parsed.hostname)) {
      return absoluteUrl(normalizedPath);
    }

    parsed.pathname = parsed.pathname.replace(/\/{2,}/g, '/');
    if (parsed.pathname !== '/') {
      parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    }
    return parsed.toString();
  }

  const normalizedPath = input.startsWith('/') ? input : `/${input}`;
  const [pathnameWithMaybeQuery, hash = ''] = normalizedPath.split('#');
  const [pathname, query = ''] = pathnameWithMaybeQuery.split('?');
  const cleanPath = pathname.replace(/\/{2,}/g, '/');

  if (cleanPath === '/') {
    return `${SITE_URL}/${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
  }

  return `${SITE_URL}${cleanPath.replace(/\/+$/, '')}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}

function resolveMetadataLocale(locale: string | undefined, path: string): 'zh' | 'en' {
  const normalizedLocale = locale?.trim();
  const pathLocale = path.trim().match(/^\/?(zh|en)(?:\/|$)/)?.[1];

  return normalizedLocale?.toLowerCase().startsWith('en') || pathLocale === 'en' ? 'en' : 'zh';
}

export function buildPageTitle(title?: string, locale: 'zh' | 'en' = 'zh') {
  const cleaned = title?.trim();

  if (!cleaned || cleaned === DEFAULT_TITLE) {
    return DEFAULT_TITLE;
  }

  if (locale === 'en') {
    return /suneng/i.test(cleaned) ? cleaned : `${cleaned} | Suneng Industrial Furnace`;
  }

  return `${cleaned}｜苏能工业炉`;
}

export function buildDescription(description?: string) {
  return description?.trim() || DEFAULT_DESCRIPTION;
}

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string | string[];
  pageKey?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  alternateLocales?: Record<string, string>;
  other?: Record<string, string>;
};

function buildImageMetadata(image?: string) {
  const imagePath = image || DEFAULT_OG_IMAGE;
  if (!imagePath) return undefined;

  return absoluteUrl(imagePath);
}

function hasEntries(value?: Record<string, string>) {
  return value && Object.keys(value).length > 0;
}

function resolveOpenGraphLocale(locale: string | undefined, path: string) {
  const normalizedLocale = locale?.trim();

  if (normalizedLocale && OPEN_GRAPH_LOCALE_MAP[normalizedLocale]) {
    return OPEN_GRAPH_LOCALE_MAP[normalizedLocale];
  }

  const pathLocale = path.trim().match(/^\/?(zh|en)(?:\/|$)/)?.[1];
  return pathLocale === 'en' ? 'en_US' : 'zh_CN';
}

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const metadataLocale = resolveMetadataLocale(options.locale, options.path);
  const title = buildPageTitle(options.title, metadataLocale);
  const description = buildDescription(options.description);
  const canonical = absoluteUrl(options.path);
  const image = buildImageMetadata(options.image);
  const type = options.type || 'website';
  const openGraph: Record<string, unknown> = {
    title,
    description,
    url: canonical,
    siteName: SITE_NAME,
    locale: resolveOpenGraphLocale(options.locale, options.path),
    type,
  };

  if (image) {
    openGraph.images = [{ url: image }];
  }

  if (type === 'article' && options.publishedTime) {
    openGraph.publishedTime = options.publishedTime;
  }

  if (type === 'article' && options.modifiedTime) {
    openGraph.modifiedTime = options.modifiedTime;
  }

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: buildKeywords(options.pageKey, options.keywords, metadataLocale),
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      ...(hasEntries(options.alternateLocales)
        ? {
            languages: Object.fromEntries(
              Object.entries(options.alternateLocales || {}).map(([locale, url]) => [locale, absoluteUrl(url)]),
            ),
          }
        : {}),
    },
    openGraph: openGraph as Metadata['openGraph'],
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
    ...(hasEntries(options.other) ? { other: options.other } : {}),
  };
}

export function getVerificationMetadata(): Pick<Metadata, 'other'> {
  const other: Record<string, string> = {};

  if (BAIDU_SITE_VERIFICATION) {
    other['baidu-site-verification'] = BAIDU_SITE_VERIFICATION;
  }

  if (BING_SITE_VERIFICATION) {
    other['msvalidate.01'] = BING_SITE_VERIFICATION;
  }

  if (SITE_360_VERIFICATION) {
    other['360-site-verification'] = SITE_360_VERIFICATION;
  }

  if (SOGOU_SITE_VERIFICATION) {
    other.sogou_site_verification = SOGOU_SITE_VERIFICATION;
  }

  return hasEntries(other) ? { other } : {};
}
