import type { Metadata } from 'next';
import { getReviewedPageCopy } from './reviewed-page-copy';
import { getSiteName } from '@/lib/seo';
import type { Locale } from '@/types/site';

import {
  BING_SITE_VERIFICATION,
  BAIDU_SITE_VERIFICATION,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  FACTORY_EXTERIOR_IMAGE,
  SITE_360_VERIFICATION,
  SITE_NAME,
  SITE_URL,
  SOGOU_SITE_VERIFICATION,
} from '@/lib/seo/config';

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

export function getSharingDefaults(locale: Locale, image?: string) {
  const imagePath = image || DEFAULT_OG_IMAGE;
  const url = imagePath ? absoluteUrl(imagePath) : undefined;
  const isFactoryExterior = url === absoluteUrl(FACTORY_EXTERIOR_IMAGE);
  const factoryAlt = locale === 'en' ? 'Exterior view of the Suneng Industrial Furnace factory' : '苏能工业炉厂区外景';
  const images = url ? [{ url, ...(isFactoryExterior ? { alt: factoryAlt } : {}) }] : undefined;
  return {
    openGraph: { type: 'website' as const, siteName: locale === 'en' ? getSiteName(locale) : SITE_NAME, images },
    twitter: { card: 'summary_large_image' as const, images: url && !isFactoryExterior ? [url] : images },
  };
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

export function getIndexingRobots() {
  const enabled = process.env.SITE_NOINDEX !== 'true';
  return { index: enabled, follow: enabled };
}

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const metadataLocale = resolveMetadataLocale(options.locale, options.path);
  const { title, description } = getReviewedPageCopy(
    options.path,
    buildPageTitle(options.title, metadataLocale),
    buildDescription(options.description),
  );
  const canonical = absoluteUrl(options.path);
  const sharing = getSharingDefaults(metadataLocale, options.image);
  const type = options.type || 'website';
  const openGraph: Record<string, unknown> = {
    ...sharing.openGraph,
    title,
    description,
    url: canonical,
    locale: resolveOpenGraphLocale(options.locale, options.path),
    type,
    ...(options.alternateLocales ? { alternateLocale: [...new Set(Object.keys(options.alternateLocales).filter((key) => key !== 'x-default').map((key) => OPEN_GRAPH_LOCALE_MAP[key]).filter((value) => value && value !== resolveOpenGraphLocale(options.locale, options.path)))] } : {}),
  };

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
      ...sharing.twitter,
      title,
      description,
    },
    robots: getIndexingRobots(),
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
