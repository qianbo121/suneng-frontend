import { LocalizedText } from '@/types/site';

export type NewsCategoryApiItem = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  slug: string;
  sortOrder?: number;
  status?: 'draft' | 'published' | 'offline';
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
  contentUpdatedAt?: string | null;
  englishContentUpdatedAt?: string | null;
  englishSourceDate?: { label: 'Source reviewed' | 'Source updated'; date: string };
  englishCoverImage?: string;
  viewCount?: number;
  slug: string;
  isPublished?: boolean;
  sortOrder?: number;
  status?: 'draft' | 'published' | 'offline';
  baiduSubmittedAt?: string | null;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
  ogImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  viewCount?: number;
  listTopic?: import('@/lib/news-decision-center').NewsDecisionTopicId;
  listFurnaces?: import('@/lib/news-decision-center').NewsFurnaceFilterId[];
  listEquipmentLabel?: string;
  id: number;
  slug: string;
  image: string;
  title: LocalizedText;
  summary: LocalizedText;
  date: string;
  updatedAt?: string | null;
  category: LocalizedText;
  searchText?: string;
  source?: NewsApiItem;
};
