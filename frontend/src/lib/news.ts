import { cache } from 'react';
import type { Metadata } from 'next';

import { NEWS_FALLBACK_IMAGE, NEWS_LABEL } from '@/constants/news';
import { getNewsDetail, getNewsList, getNewsPrevNext } from '@/lib/api/news';
import { toAssetUrl } from '@/lib/api/client';
import { compactText } from '@/lib/seo';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { filterCanonicalNewsItems, hasPublishableEnglishNews } from '@/lib/news-routing';
import { richTextToPlainText, sanitizeRichTextHtml } from '@/lib/sanitize';
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

export function resolveNewsImage(
  item?: Pick<NewsApiItem, 'coverImage' | 'ogImage'> | null,
  options?: { preferFallback?: boolean },
) {
  const image = toAssetUrl(item?.coverImage || item?.ogImage);

  if (options?.preferFallback || !image || isPlaceholderImage(image)) {
    return NEWS_FALLBACK_IMAGE;
  }

  return image;
}

function getNewsCoverImage(item?: Pick<NewsApiItem, 'coverImage' | 'ogImage'> | null) {
  return resolveNewsImage(item);
}

export function mapNewsCard(locale: Locale, item: NewsApiItem): NewsListCardItem {
  return {
    id: item.id,
    slug: item.slug,
    image: getNewsCoverImage(item),
    title: {
      zh: item.titleZh,
      en: item.titleEn || item.titleZh,
    },
    summary: {
      zh: richTextToPlainText(item.summaryZh || item.contentZh),
      en: richTextToPlainText(item.summaryEn || item.contentEn || item.summaryZh || item.contentZh),
    },
    date: item.publishDate,
    category: {
      zh: item.category?.nameZh || NEWS_LABEL.zh,
      en: item.category?.nameEn || item.category?.nameZh || NEWS_LABEL.en,
    },
  };
}

export function normalizeNewsHtml(locale: Locale, item: NewsApiItem) {
  const content = localizeText(locale, item.contentZh, item.contentEn);
  return sanitizeRichTextHtml(content);
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
      'x-default': '/zh/news',
    },
  });

  return locale === 'en'
    ? { ...metadata, robots: { index: false, follow: false } }
    : metadata;
}

export async function createNewsDetailMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const { article: item } = await getNewsDetailPageData(slug);
  const title = item
    ? localizeText(locale, item.seoTitleZh, item.seoTitleEn, localizeText(locale, item.titleZh, item.titleEn))
    : locale === 'en'
      ? 'News Detail'
      : '新闻详情';
  const description = item
    ? localizeText(
        locale,
        item.seoDescriptionZh,
        item.seoDescriptionEn,
        localizeText(locale, item.summaryZh, item.summaryEn, localizeText(locale, item.contentZh, item.contentEn)),
      )
    : '';
  const image = item ? getNewsCoverImage(item) : NEWS_FALLBACK_IMAGE;

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
  const localizedItems = locale === 'en'
    ? canonicalItems.filter(hasPublishableEnglishNews)
    : canonicalItems;
  const start = (page - 1) * pageSize;
  const paginatedList = listResult.data
    ? {
        items: localizedItems.slice(start, start + pageSize),
        total: localizedItems.length,
        page,
        pageSize,
      }
    : null;
  const bannerImage =
    toAssetUrl(localizedItems[0]?.coverImage || localizedItems[0]?.ogImage) ||
    NEWS_FALLBACK_IMAGE;

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
  const prevNextResult = item ? await getNewsPrevNext(item.id) : { data: null, error: detailResult.error };

  return {
    article: item,
    prevNext: prevNextResult.data,
    error: detailResult.error || prevNextResult.error,
  };
});

export function getNewsCanonicalUrl(locale: Locale, slug: string) {
  return absoluteUrl(`/${locale}/news/${slug}`);
}
