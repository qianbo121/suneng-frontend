import { LocalizedText } from '@/types/site';

export type ProductCategoryApiItem = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  coverImage?: string | null;
  iconImage?: string | null;
  slug: string;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
  ogImage?: string | null;
};

export type ProductApiItem = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  model?: string | null;
  summaryZh?: string | null;
  summaryEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  specsJson?: unknown;
  featuresJson?: unknown;
  imagesJson?: unknown;
  ogImage?: string | null;
  slug: string;
  categoryId: number;
  category?: ProductCategoryApiItem | null;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
};

export type ProductListApiData = {
  items: ProductApiItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductListCardItem = {
  id: number;
  slug: string;
  model: string;
  name: LocalizedText;
  summary: LocalizedText;
  image: string;
};

export type ProductSpecRow = {
  key: string;
  value: string;
};

export type ProductFeatureItem = {
  title?: string;
  content: string;
};
