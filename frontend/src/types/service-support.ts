export type ServiceSectionApiItem = {
  id: number;
  sectionKey: string;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  ogImage?: string | null;
};

export type SalesOutletApiItem = {
  id: number;
  regionZh?: string | null;
  regionEn?: string | null;
  cityZh?: string | null;
  cityEn?: string | null;
  addressZh?: string | null;
  addressEn?: string | null;
  phone?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type PartnerApiItem = {
  id: number;
  name: string;
  logoUrl: string;
  website?: string | null;
};

export type DeliveryApiItem = {
  id: number;
  titleZh: string;
  titleEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  imagesJson?: unknown;
  deliveryDate?: string | null;
  slug: string;
  ogImage?: string | null;
};

export type DeliveryListApiData = {
  items: DeliveryApiItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ServiceAdvantageCard = {
  id: number;
  title: string;
  content: string;
  image: string;
};

export type DeliveryGalleryCard = {
  id: number;
  title: string;
  description: string;
  image: string;
  images: string[];
  date?: string | null;
};
