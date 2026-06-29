import { safeApiGet } from '@/lib/api/client';

export type BannerApiItem = {
  id: number;
  sectionKey?: string | null;
  titleZh: string;
  titleEn?: string | null;
  subtitleZh?: string | null;
  subtitleEn?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
};

export type PartnerApiItem = {
  id: number;
  name: string;
  logoUrl?: string | null;
  website?: string | null;
};

export type ProductCategoryApiItem = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  coverImage?: string | null;
  iconImage?: string | null;
  slug: string;
};

export type ProductApiItem = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  model?: string | null;
  summaryZh?: string | null;
  summaryEn?: string | null;
  imagesJson?: unknown;
  ogImage?: string | null;
  slug: string;
  category?: ProductCategoryApiItem | null;
};

export function getHomeBanners() {
  return safeApiGet<BannerApiItem[]>('/v1/banners', { revalidate: 600 });
}

export function getHomePartners() {
  return safeApiGet<PartnerApiItem[]>('/v1/partners', { revalidate: 3600 });
}

export function getHomeProductCategories() {
  return safeApiGet<ProductCategoryApiItem[]>('/v1/product-categories', { revalidate: 3600 });
}

export function getHomeHotProducts() {
  return safeApiGet<ProductApiItem[]>('/v1/products/hot', { revalidate: 3600 });
}
