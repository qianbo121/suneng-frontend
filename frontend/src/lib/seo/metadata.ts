import type { Metadata } from 'next';

import {
  BING_SITE_VERIFICATION,
  BAIDU_SITE_VERIFICATION,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_360_VERIFICATION,
  SITE_NAME,
  SITE_URL,
  SOGOU_SITE_VERIFICATION,
} from '@/lib/seo/config';

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

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

export function buildPageTitle(title?: string) {
  const cleaned = title?.trim();

  if (!cleaned || cleaned === DEFAULT_TITLE) {
    return DEFAULT_TITLE;
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
  keywords?: string[];
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

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const title = buildPageTitle(options.title);
  const description = buildDescription(options.description);
  const canonical = absoluteUrl(options.path);
  const image = buildImageMetadata(options.image);
  const type = options.type || 'website';
  const openGraph: Record<string, unknown> = {
    title,
    description,
    url: canonical,
    siteName: SITE_NAME,
    locale: options.locale || 'zh_CN',
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
    keywords: options.keywords?.length ? options.keywords : DEFAULT_KEYWORDS,
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
