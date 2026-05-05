import { Dayjs } from 'dayjs';

import { PublishStatus } from '@/types/product';

export type NewsCategoryEntity = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  slug: string;
  sortOrder: number;
  status?: PublishStatus;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
  ogImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NewsEntity = {
  id: number;
  categoryId: number;
  titleZh: string;
  titleEn?: string | null;
  summaryZh?: string | null;
  summaryEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  coverImage?: string | null;
  publishDate?: string | null;
  viewCount?: number;
  slug: string;
  isPublished?: boolean;
  status: PublishStatus;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
  ogImage?: string | null;
  sortOrder: number;
  category?: NewsCategoryEntity | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NewsCategoryFormValues = {
  nameZh: string;
  nameEn: string;
  slug: string;
  sortOrder: number;
};

export type NewsListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  status?: PublishStatus;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type NewsCategoryListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: PublishStatus;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type NewsFormValues = {
  titleZh: string;
  titleEn: string;
  slug: string;
  categoryId: number | null;
  coverImage: string;
  summaryZh: string;
  summaryEn: string;
  contentZh: string;
  contentEn: string;
  publishDate: Dayjs | null;
  seoTitleZh: string;
  seoTitleEn: string;
  seoDescriptionZh: string;
  seoDescriptionEn: string;
  seoKeywordsZh: string;
  seoKeywordsEn: string;
  ogImage: string;
  sortOrder: number;
  status: PublishStatus;
};
