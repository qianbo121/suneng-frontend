export type PublishStatus = 'draft' | 'published' | 'offline';

export type ProductCategoryEntity = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  coverImage?: string | null;
  iconImage?: string | null;
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

export type ProductEntity = {
  id: number;
  categoryId: number;
  nameZh: string;
  nameEn?: string | null;
  model?: string | null;
  summaryZh?: string | null;
  summaryEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  specsJson?: Record<string, unknown> | null;
  featuresJson?: string[] | Record<string, unknown>[] | Record<string, unknown> | null;
  imagesJson?: string[] | null;
  isHot?: boolean;
  slug: string;
  sortOrder: number;
  status: PublishStatus;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
  ogImage?: string | null;
  category?: ProductCategoryEntity | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductCategoryFormValues = {
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  coverImage: string;
  iconImage: string;
  slug: string;
  sortOrder: number;
};

export type ProductListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  status?: PublishStatus;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type ProductCategoryListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: PublishStatus;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type KeyValueRow = {
  key: string;
  value: string;
};

export type ProductFormValues = {
  nameZh: string;
  nameEn: string;
  model: string;
  categoryId: number | null;
  slug: string;
  sortOrder: number;
  isHot: boolean;
  summaryZh: string;
  summaryEn: string;
  descriptionZh: string;
  descriptionEn: string;
  imagesJson: string[];
  specsRows: KeyValueRow[];
  features: string[];
  seoTitleZh: string;
  seoTitleEn: string;
  seoDescriptionZh: string;
  seoDescriptionEn: string;
  seoKeywordsZh: string;
  seoKeywordsEn: string;
  ogImage: string;
  status: PublishStatus;
};

export type UploadResponse = {
  urls: string[];
};
