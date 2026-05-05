export type AboutSectionApiItem = {
  id: number;
  sectionKey: string;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  status?: string;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
  ogImage?: string | null;
};

export type TimelineEventApiItem = {
  id: number;
  year: number;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  sortOrder?: number;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  ogImage?: string | null;
};

export type ChairmanMessageApiItem = {
  id: number;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  imageUrl?: string | null;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  ogImage?: string | null;
};

export type CultureValueType = 'mission' | 'vision' | 'value';

export type CultureValueApiItem = {
  id: number;
  type: CultureValueType;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  icon?: string | null;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  ogImage?: string | null;
};

export type AboutApiData = {
  sections: AboutSectionApiItem[];
  timeline: TimelineEventApiItem[];
  chairman: ChairmanMessageApiItem | null;
  culture: CultureValueApiItem[];
};

export type AboutPageKey = 'profile' | 'organization' | 'chairman' | 'culture' | 'timeline';
