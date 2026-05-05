import { LocalizedText } from '@/types/site';

export type NewsCategoryApiItem = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  slug: string;
  sortOrder?: number;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
  ogImage?: string | null;
};

export type NewsApiItem = {
  id: number;
  categoryId: number;
  titleZh: string;
  titleEn?: string | null;
  summaryZh?: string | null;
  summaryEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  coverImage?: string | null;
  publishDate: string;
  viewCount?: number;
  slug: string;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
  ogImage?: string | null;
  category?: NewsCategoryApiItem | null;
};

export type PaginatedNewsApiData = {
  items: NewsApiItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type NewsPrevNextItem = {
  id: number;
  titleZh: string;
  titleEn?: string | null;
  slug: string;
  publishDate: string;
};

export type NewsPrevNextApiData = {
  prev: NewsPrevNextItem | null;
  next: NewsPrevNextItem | null;
};

export type NewsListCardItem = {
  id: number;
  slug: string;
  image: string;
  title: LocalizedText;
  summary: LocalizedText;
  date: string;
  category: LocalizedText;
};

