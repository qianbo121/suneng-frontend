import { cache } from 'react';

import { homeNews as newsFallback } from '@/mock/news';
import { partnerLogos as partnerFallback } from '@/mock/partners';
import {
  hotProducts as hotProductsFallback,
  productCategories as categoryFallback,
} from '@/mock/products';
import { homeBanners as bannerFallback } from '@/mock/banners';
import { getLatestNews } from '@/lib/api/news';
import { toAssetUrl } from '@/lib/api/client';
import {
  HeroBannerItem,
  HotProductItem,
  NewsItem,
  PartnerLogoItem,
  ProductCategoryItem,
} from '@/types/home';
import { LocalizedText } from '@/types/site';

const NEWS_FALLBACK_IMAGE = '/images/news/news-delivery.png';

export type HomePageData = {
  heroBanners: HeroBannerItem[];
  productCategories: ProductCategoryItem[];
  hotProducts: HotProductItem[];
  partners: PartnerLogoItem[];
  news: NewsItem[];
  fallbackSections: string[];
};

function localized(zh?: string | null, en?: string | null, fallback?: LocalizedText): LocalizedText {
  return {
    zh: zh || fallback?.zh || '',
    en: en || fallback?.en || zh || fallback?.zh || '',
  };
}

function mapNews(items: Array<{ id: number; titleZh: string; titleEn?: string | null; summaryZh?: string | null; summaryEn?: string | null; coverImage?: string | null; publishDate: string; slug: string }> | null) {
  if (items === null) return newsFallback;
  if (!items.length) return [];

  return items.map((item, index) => ({
    id: item.id,
    title: localized(item.titleZh, item.titleEn, newsFallback[index]?.title),
    summary: localized(item.summaryZh, item.summaryEn, newsFallback[index]?.summary),
    coverImage: toAssetUrl(item.coverImage) || newsFallback[index]?.coverImage || NEWS_FALLBACK_IMAGE,
    publishDate: item.publishDate,
    href: `/news/${item.slug}`,
  }));
}

export const getHomePageData = cache(async (): Promise<HomePageData> => {
  const newsResult = await getLatestNews();

  const fallbackSections: string[] = [];

  if (newsResult.error) fallbackSections.push('news');

  return {
    heroBanners: bannerFallback,
    productCategories: categoryFallback,
    hotProducts: hotProductsFallback,
    partners: partnerFallback,
    news: mapNews(newsResult.data?.items ?? null),
    fallbackSections,
  };
});
