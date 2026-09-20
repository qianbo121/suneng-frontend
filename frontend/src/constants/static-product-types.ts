import type { ProductSpecRow } from '@/types/product';

export type StaticProductFeature = {
  title: string;
  text: string;
};

export type StaticProductIndustry = {
  title: string;
  text: string;
};

export type StaticProductDetailReason = {
  title: string;
  text: string;
};

export type StaticProductConfiguration = {
  title: string;
  image: string;
  specs: string[];
};

export type StaticProductProcessStep = {
  title: string;
  text: string;
};

export type StaticProductGeoSection = {
  title: string;
  text?: string;
  items?: string[];
};

export type StaticProductInfoCard = {
  title: string;
  text: string;
};

export type StaticProductComparisonRow = {
  left?: string;
  middle?: string;
  right?: string;
  trolley?: string;
  box?: string;
};

export type StaticProductFaqItem = {
  question: string;
  answer: string;
};

export type StaticProductRelatedLink = {
  title: string;
  description: string;
  href: string;
};

export type StaticProductLeadForm = {
  title: string;
  description: string;
  submitLabel: string;
  contactHref: string;
  contactLabel: string;
  phone: string;
  email: string;
};

export type StaticProductDetail = {
  series: string;
  title: string;
  breadcrumbSeries: string;
  summary: string;
  sellingPoints: string[];
  quickTags: string[];
  ctaHighlights: string[];
  reasons: StaticProductDetailReason[];
  customSpecs: ProductSpecRow[];
  configurations: StaticProductConfiguration[];
  processSteps: StaticProductProcessStep[];
  processes: string[];
  industries: string[];
  leadBullets: string[];
  heroCtas?: StaticProductRelatedLink[];
  workpieceCards?: StaticProductInfoCard[];
  processCards?: StaticProductInfoCard[];
  structureComponents?: StaticProductInfoCard[];
  priceFactors?: string[];
  comparisonRows?: StaticProductComparisonRow[];
  industryCards?: StaticProductInfoCard[];
  scenarioCards?: StaticProductInfoCard[];
  workpieceTitle?: string;
  processCardsTitle?: string;
  scenarioIntro?: string;
  parameterTitle?: string;
  parameterLink?: StaticProductRelatedLink;
  structureTitle?: string;
  priceFactorsTitle?: string;
  priceFactorsIntro?: string;
  comparisonTitle?: string;
  comparisonHeaders?: string[];
  processStepsTitle?: string;
  leadForm?: StaticProductLeadForm;
  parameterNote?: string;
  geoSections?: StaticProductGeoSection[];
  faq?: StaticProductFaqItem[];
  relatedLinks?: StaticProductRelatedLink[];
};

export type StaticProduct = {
  id: number;
  slug: string;
  model: string;
  name: {
    zh: string;
    en: string;
  };
  category: {
    zh: string;
    en: string;
  };
  summary: {
    zh: string;
    en: string;
  };
  description: {
    zh: string[];
    en: string[];
  };
  image: string;
  gallery: string[];
  features: StaticProductFeature[];
  specs: ProductSpecRow[];
  structureImages: string[];
  industries: StaticProductIndustry[];
  detail?: StaticProductDetail;
};

export type ProductGeoEnhancement = Pick<StaticProductDetail, 'parameterNote' | 'geoSections' | 'faq' | 'relatedLinks'>;
