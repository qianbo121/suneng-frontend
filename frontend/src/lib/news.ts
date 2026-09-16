import { cache } from 'react';
import type { Metadata } from 'next';

import { NEWS_FALLBACK_IMAGE, NEWS_LABEL } from '@/constants/news';
import { getNewsDetail, getNewsList } from '@/lib/api/news';
import { toAssetUrl } from '@/lib/api/client';
import { compactText } from '@/lib/seo';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { filterCanonicalNewsItems, hasPublishableEnglishNews } from '@/lib/news-routing';
import { prepareNewsArticleHtml, richTextToPlainText } from '@/lib/sanitize';
import { getNewsSummary } from '@/lib/news-summary';
import { localizeText } from '@/lib/utils';
import { NewsApiItem, NewsListCardItem } from '@/types/news';
import { Locale } from '@/types/site';

export function formatNewsDisplayDate(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function isPlaceholderImage(src: string) {
  return src.includes('placehold.co');
}

function normalizeNewsImageSource(src?: string | null) {
  const image = src?.trim() || '';

  if (image.startsWith('/uploads/') || image.startsWith('/images/')) {
    return image;
  }

  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/uploads\//i.test(image)) {
    return new URL(image).pathname;
  }

  return toAssetUrl(image);
}

export function resolveNewsImage(
  item?: Pick<NewsApiItem, 'coverImage' | 'ogImage' | 'englishCoverImage'> | null,
  options?: { preferFallback?: boolean; locale?: Locale },
) {
  const image = normalizeNewsImageSource(
    (options?.locale === 'en' && item?.englishCoverImage) || item?.coverImage || item?.ogImage,
  );

  if (options?.preferFallback || !image || isPlaceholderImage(image)) {
    return NEWS_FALLBACK_IMAGE;
  }

  return image;
}

export function mapNewsCard(locale: Locale, item: NewsApiItem): NewsListCardItem {
  const searchText = [
    item.titleZh,
    item.titleEn,
    item.summaryZh,
    item.summaryEn,
    item.contentZh,
    item.contentEn,
    item.seoTitleZh,
    item.seoTitleEn,
    item.seoDescriptionZh,
    item.seoDescriptionEn,
    item.seoKeywordsZh,
    item.seoKeywordsEn,
    item.category?.nameZh,
    item.category?.nameEn,
    item.category?.slug,
    item.slug,
  ]
    .map((value) => richTextToPlainText(value))
    .filter(Boolean)
    .join(' ');

  return {
    id: item.id,
    slug: item.slug,
    image: resolveNewsImage(item, { locale }),
    title: {
      zh: item.titleZh,
      en: item.titleEn || item.titleZh,
    },
    summary: {
      zh: getNewsSummary('zh', item),
      en: getNewsSummary('en', item),
    },
    date: item.publishDate,
    updatedAt: item.contentUpdatedAt || item.publishDate,
    viewCount: item.viewCount ?? 0,
    category: {
      zh: item.category?.nameZh || NEWS_LABEL.zh,
      en: item.category?.nameEn || NEWS_LABEL.en,
    },
    searchText,
    source: item,
  };
}

export function normalizeNewsHtml(
  locale: Locale,
  item: NewsApiItem,
  options?: { coverImage?: string | null },
) {
  const content = localizeText(locale, item.contentZh, item.contentEn);
  return prepareNewsArticleHtml(content, {
    coverImage: options?.coverImage,
    stackSimpleTables: locale === 'en',
  });
}

export async function createNewsListMetadata(locale: Locale): Promise<Metadata> {
  const title = NEWS_LABEL[locale];
  const description =
    locale === 'en'
      ? 'Latest company and industry updates.'
      : '聚焦公司动态与行业资讯，展示企业新闻内容。';

  const metadata = buildMetadata({
    title,
    description,
    path: `/${locale}/news`,
    pageKey: 'news',
    keywords: '',
    locale,
    image: NEWS_FALLBACK_IMAGE,
    alternateLocales: {
      'zh-CN': '/zh/news',
      'en-US': '/en/news',
      'x-default': '/zh/news',
    },
  });

  return metadata;
}

export async function createNewsDetailMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const { article: item } = await getNewsDetailPageData(slug);
  const title = item
    ? localizeText(
        locale,
        item.seoTitleZh,
        item.seoTitleEn,
        localizeText(locale, item.titleZh, item.titleEn),
      )
    : locale === 'en'
      ? 'News Detail'
      : '新闻详情';
  const description = item
    ? localizeText(
        locale,
        item.seoDescriptionZh,
        item.seoDescriptionEn,
        localizeText(
          locale,
          item.summaryZh,
          item.summaryEn,
          localizeText(locale, item.contentZh, item.contentEn),
        ),
      )
    : '';
  const image = item ? resolveNewsImage(item, { locale }) : NEWS_FALLBACK_IMAGE;

  return buildMetadata({
    title,
    description: compactText(description || title).slice(0, 160),
    path: `/${locale}/news/${slug}`,
    pageKey: `news-detail-${slug}`,
    keywords: item ? localizeText(locale, item.seoKeywordsZh, item.seoKeywordsEn) : '',
    locale,
    image,
    type: 'article',
    alternateLocales: {
      'zh-CN': `/zh/news/${slug}`,
      'en-US': `/en/news/${slug}`,
      'x-default': `/zh/news/${slug}`,
    },
  });
}

export async function getNewsListPageData(
  locale: Locale,
  options?: { page?: number; pageSize?: number },
) {
  const listResult = await getNewsList({
    page: 1,
    pageSize: 100,
  });
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? 10);
  const canonicalItems = filterCanonicalNewsItems(listResult.data?.items ?? []);
  const localizedItems =
    locale === 'en' ? canonicalItems.filter(hasPublishableEnglishNews) : canonicalItems;
  const start = (page - 1) * pageSize;
  const paginatedList = listResult.data
    ? {
        items: localizedItems.slice(start, start + pageSize),
        total: localizedItems.length,
        page,
        pageSize,
      }
    : null;
  const bannerImage = resolveNewsImage(localizedItems[0], { locale });

  return {
    categories: [],
    currentCategory: null,
    list: paginatedList,
    bannerImage,
    error: listResult.error,
    title: NEWS_LABEL[locale],
  };
}

export const getNewsDetailPageData = cache(async (slug: string) => {
  const detailResult = await getNewsDetail(slug);
  const item = detailResult.data;
  return {
    article: item,
    error: detailResult.error,
  };
});

export function getNewsCanonicalUrl(locale: Locale, slug: string) {
  return absoluteUrl(`/${locale}/news/${slug}`);
}
