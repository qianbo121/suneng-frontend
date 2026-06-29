import { cache } from 'react';

import { homeNews as newsFallback } from '@/mock/news';
import { partnerLogos as partnerFallback } from '@/mock/partners';
import {
  hotProducts as hotProductsFallback,
  productCategories as categoryFallback,
} from '@/mock/products';
import { homeBanners as bannerFallback } from '@/mock/banners';
import {
  BannerApiItem,
  PartnerApiItem,
  ProductApiItem,
  ProductCategoryApiItem,
  getHomeBanners,
  getHomeHotProducts,
  getHomePartners,
  getHomeProductCategories,
} from '@/lib/api/home-content';
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
const PRODUCT_FALLBACK_IMAGE = '/images/products/product-list-hero.png';

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

function chooseList<TApi, TItem>(
  items: TApi[] | null | undefined,
  fallback: TItem[],
  mapper: (items: TApi[]) => TItem[],
) {
  if (!items?.length) return fallback;
  return mapper(items);
}

function firstImageFromJson(value: unknown): string {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const image = firstImageFromJson(item);
      if (image) return image;
    }
    return '';
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['url', 'imageUrl', 'src', 'image', 'cover']) {
      if (typeof record[key] === 'string') return record[key] as string;
    }
  }

  return '';
}

export function mapBannerItems(items: BannerApiItem[]): HeroBannerItem[] {
  return items.map((item, index) => {
    const fallback = bannerFallback[index];

    return {
      id: item.id,
      eyebrow: item.sectionKey || fallback?.eyebrow || 'SUNENG',
      title: localized(item.titleZh, item.titleEn, fallback?.title),
      subtitle: localized(item.subtitleZh, item.subtitleEn, fallback?.subtitle),
      ctaLabel: fallback?.ctaLabel || { zh: '查看产品中心', en: 'View Products' },
      ctaHref: item.linkUrl || fallback?.ctaHref || '/products',
      image: toAssetUrl(item.imageUrl) || fallback?.image || '',
    };
  });
}

export function mapPartnerItems(items: PartnerApiItem[]): PartnerLogoItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    logo: toAssetUrl(item.logoUrl),
    shortName: item.name,
  }));
}

export function mapProductCategoryItems(items: ProductCategoryApiItem[]): ProductCategoryItem[] {
  return items.map((item, index) => ({
    id: item.id,
    slug: item.slug,
    name: localized(item.nameZh, item.nameEn, categoryFallback[index]?.name),
    image:
      toAssetUrl(item.coverImage) ||
      toAssetUrl(item.iconImage) ||
      categoryFallback[index]?.image ||
      PRODUCT_FALLBACK_IMAGE,
  }));
}

export function mapHotProductItems(items: ProductApiItem[]): HotProductItem[] {
  return items.map((item, index) => {
    const fallback =
      hotProductsFallback.find((product) => product.slug === item.slug) || hotProductsFallback[index];
    const image =
      firstImageFromJson(item.imagesJson) ||
      item.ogImage ||
      item.category?.coverImage ||
      item.category?.iconImage;

    return {
      id: item.id,
      slug: item.slug,
      name: localized(item.nameZh, item.nameEn, fallback?.name),
      model: item.model || fallback?.model || item.slug.replace(/-/g, ' ').toUpperCase(),
      image: toAssetUrl(image) || fallback?.image || PRODUCT_FALLBACK_IMAGE,
    };
  });
}

export function mapNews(items: Array<{ id: number; titleZh: string; titleEn?: string | null; summaryZh?: string | null; summaryEn?: string | null; coverImage?: string | null; publishDate: string; slug: string }> | null) {
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
  const [newsResult, bannerResult, categoryResult, hotProductResult, partnerResult] =
    await Promise.all([
      getLatestNews(),
      getHomeBanners(),
      getHomeProductCategories(),
      getHomeHotProducts(),
      getHomePartners(),
    ]);

  const fallbackSections: string[] = [];

  if (newsResult.error) fallbackSections.push('news');
  if (bannerResult.error || !bannerResult.data?.length) fallbackSections.push('heroBanners');
  if (categoryResult.error || !categoryResult.data?.length) fallbackSections.push('productCategories');
  if (hotProductResult.error || !hotProductResult.data?.length) fallbackSections.push('hotProducts');
  if (partnerResult.error || !partnerResult.data?.length) fallbackSections.push('partners');

  return {
    heroBanners: chooseList(bannerResult.data, bannerFallback, mapBannerItems),
    productCategories: chooseList(categoryResult.data, categoryFallback, mapProductCategoryItems),
    hotProducts: chooseList(hotProductResult.data, hotProductsFallback, mapHotProductItems),
    partners: chooseList(partnerResult.data, partnerFallback, mapPartnerItems),
    news: mapNews(newsResult.data?.items ?? null),
    fallbackSections,
  };
});
