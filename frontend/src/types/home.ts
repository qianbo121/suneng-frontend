import { LocalizedText } from '@/types/site';

export type HeroBannerItem = {
  id: number;
  eyebrow: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  ctaLabel: LocalizedText;
  ctaHref: string;
  image: string;
};

export type ProductCategoryItem = {
  id: number;
  slug: string;
  name: LocalizedText;
  image: string;
};

export type HotProductItem = {
  id: number;
  slug: string;
  name: LocalizedText;
  model: string;
  image: string;
};

export type PartnerLogoItem = {
  id: number;
  name: string;
  logo?: string;
  shortName?: string;
  industry?: string;
  furnaceTypes?: string[];
};

export type NewsItem = {
  id: number;
  title: LocalizedText;
  summary: LocalizedText;
  coverImage: string;
  publishDate: string;
  href: string;
};
