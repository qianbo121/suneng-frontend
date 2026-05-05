import { cache } from 'react';
import type { Metadata } from 'next';

import { NEWS_FALLBACK_IMAGE, NEWS_LABEL } from '@/constants/news';
import { getNewsDetail, getNewsList, getNewsPrevNext } from '@/lib/api/news';
import { toAssetUrl } from '@/lib/api/client';
import { buildSeoMetadata, buildLocalizedUrl } from '@/lib/seo';
import { sanitizeRichTextHtml } from '@/lib/sanitize';
import { NewsApiItem, NewsListCardItem } from '@/types/news';
import { Locale } from '@/types/site';

function localize(locale: Locale, zh?: string | null, en?: string | null, fallback = '') {
  return locale === 'en' ? en || zh || fallback : zh || en || fallback;
}

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
      zh: item.summaryZh || item.contentZh || '',
      en: item.summaryEn || item.contentEn || item.summaryZh || item.contentZh || '',
    },
    date: item.publishDate,
    category: {
      zh: item.category?.nameZh || NEWS_LABEL.zh,
      en: item.category?.nameEn || item.category?.nameZh || NEWS_LABEL.en,
    },
  };
}

export function normalizeNewsHtml(locale: Locale, item: NewsApiItem) {
  const content = localize(locale, item.contentZh, item.contentEn);
  return sanitizeRichTextHtml(content);
}

export async function createNewsListMetadata(locale: Locale): Promise<Metadata> {
  const title = NEWS_LABEL[locale];
  const description =
    locale === 'en'
      ? 'Latest company and industry updates.'
      : '聚焦公司动态与行业资讯，展示企业新闻内容。';

  return buildSeoMetadata({
    locale,
    path: '/news',
    pageKey: 'news',
    title,
    description,
    keywords: '',
    image: NEWS_FALLBACK_IMAGE,
  });
}

export async function createNewsDetailMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const { article: item } = await getNewsDetailPageData(slug);
  const title = item
    ? localize(locale, item.seoTitleZh, item.seoTitleEn, localize(locale, item.titleZh, item.titleEn))
    : locale === 'en'
      ? 'News Detail'
      : '新闻详情';
  const description = item
    ? localize(
        locale,
        item.seoDescriptionZh,
        item.seoDescriptionEn,
        localize(locale, item.summaryZh, item.summaryEn, localize(locale, item.contentZh, item.contentEn)),
      )
    : '';
  const image = item ? getNewsCoverImage(item) : NEWS_FALLBACK_IMAGE;

  return buildSeoMetadata({
    locale,
    path: `/news/${slug}`,
    pageKey: `news-detail-${slug}`,
    title,
    description,
    keywords: item ? localize(locale, item.seoKeywordsZh, item.seoKeywordsEn) : '',
    image,
    type: 'article',
  });
}

export async function getNewsListPageData(
  locale: Locale,
  options?: { page?: number; pageSize?: number },
) {
  const listResult = await getNewsList({
    page: options?.page ?? 1,
    pageSize: options?.pageSize ?? 10,
  });
  const bannerImage =
    toAssetUrl(listResult.data?.items?.[0]?.coverImage || listResult.data?.items?.[0]?.ogImage) ||
    NEWS_FALLBACK_IMAGE;

  return {
    categories: [],
    currentCategory: null,
    list: listResult.data,
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
  return buildLocalizedUrl(locale, `/news/${slug}`);
}
