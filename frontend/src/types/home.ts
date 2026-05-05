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

export type ProductShowcaseItem = {
  id: number;
  key: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  href: string;
};

export type CompanyStatItem = {
  id: number;
  value: number;
  suffix: string;
  label: LocalizedText;
  valueText?: LocalizedText;
};

export type CompanyIntroContent = {
  eyebrow: string;
  title: LocalizedText;
  description: LocalizedText;
  buttonLabel: LocalizedText;
  buttonHref: string;
  stats: CompanyStatItem[];
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

export type ContactBarContent = {
  hotlineLabel: LocalizedText;
  hotline: string;
  addressLabel: LocalizedText;
  address: LocalizedText;
  buttonLabel: LocalizedText;
  buttonHref: string;
};
