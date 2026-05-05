export type StrengthCategoryApiItem = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  slug: string;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  ogImage?: string | null;
};

export type StrengthItemApiItem = {
  id: number;
  categoryId: number;
  titleZh: string;
  titleEn?: string | null;
  summaryZh?: string | null;
  summaryEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  imageUrl?: string | null;
  imagesJson?: unknown;
  ogImage?: string | null;
};

export type StrengthItemsListApiData = {
  items: StrengthItemApiItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type CertificateApiItem = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  imageUrl: string;
  category: 'honor' | 'qualification' | 'patent';
  ogImage?: string | null;
};

export type CertificatesListApiData = {
  items: CertificateApiItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type StrengthDisplayMode = 'strength-item' | 'certificate-honor' | 'certificate-qualification';

export type StrengthDisplayCard = {
  id: number;
  title: string;
  summary: string;
  image: string;
  gallery: string[];
  sourceType: StrengthDisplayMode;
};
