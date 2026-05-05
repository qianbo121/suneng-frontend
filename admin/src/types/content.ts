import { Dayjs } from 'dayjs';

import { PublishStatus } from '@/types/product';

export type BannerEntity = {
  id: number;
  sectionKey?: string | null;
  titleZh: string;
  titleEn?: string | null;
  subtitleZh?: string | null;
  subtitleEn?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  status: PublishStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerFormValues = {
  sectionKey: string;
  titleZh: string;
  titleEn: string;
  subtitleZh: string;
  subtitleEn: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
  status: PublishStatus;
};

export type StrengthCategoryEntity = {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  slug: string;
  sortOrder: number;
  status: PublishStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type StrengthCategoryFormValues = {
  nameZh: string;
  nameEn: string;
  slug: string;
  sortOrder: number;
  status: PublishStatus;
};

export type StrengthItemEntity = {
  id: number;
  categoryId: number;
  titleZh: string;
  titleEn?: string | null;
  summaryZh?: string | null;
  summaryEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  imageUrl?: string | null;
  imagesJson?: string[] | null;
  sortOrder: number;
  status: PublishStatus;
  category?: StrengthCategoryEntity | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StrengthItemFormValues = {
  categoryId: number | null;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  contentZh: string;
  contentEn: string;
  imageUrl: string;
  imagesJson: string[];
  sortOrder: number;
  status: PublishStatus;
};

export type CertificateCategory = 'honor' | 'qualification' | 'patent';

export type CertificateEntity = {
  id: number;
  strengthCategoryId?: number | null;
  nameZh: string;
  nameEn?: string | null;
  imageUrl: string;
  category: CertificateCategory;
  sortOrder: number;
  status: PublishStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CertificateFormValues = {
  strengthCategoryId?: number | null;
  nameZh: string;
  nameEn: string;
  imageUrl: string;
  category: CertificateCategory;
  sortOrder: number;
  status: PublishStatus;
};

export type PartnerEntity = {
  id: number;
  name: string;
  logoUrl: string;
  website?: string | null;
  sortOrder: number;
  status: PublishStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type PartnerFormValues = {
  name: string;
  logoUrl: string;
  website: string;
  sortOrder: number;
  status: PublishStatus;
};

export type DeliveryEntity = {
  id: number;
  productId?: number | null;
  titleZh: string;
  titleEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  imagesJson?: string[] | null;
  slug: string;
  deliveryDate?: string | null;
  sortOrder: number;
  status: PublishStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type DeliveryFormValues = {
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  imagesJson: string[];
  slug: string;
  deliveryDate: Dayjs | null;
  sortOrder: number;
  status: PublishStatus;
};

export type CompanyInfoEntity = {
  id: number;
  key: string;
  valueZh?: string | null;
  valueEn?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CompanyInfoRow = {
  id?: number;
  key: string;
  valueZh: string;
  valueEn: string;
};

export type AboutSectionEntity = {
  id: number;
  sectionKey: string;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  status: PublishStatus;
};

export type AboutSectionFormValues = {
  sectionKey: string;
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  imageUrl: string;
  sortOrder: number;
  status: PublishStatus;
};

export type ChairmanMessageEntity = {
  id: number;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  imageUrl?: string | null;
  status: PublishStatus;
};

export type ChairmanMessageFormValues = {
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  imageUrl: string;
  status: PublishStatus;
};

export type CultureValueType = 'mission' | 'vision' | 'value';

export type CultureValueEntity = {
  id: number;
  type: CultureValueType;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  icon?: string | null;
  sortOrder: number;
  status: PublishStatus;
};

export type CultureValueFormValues = {
  type: CultureValueType;
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  icon: string;
  sortOrder: number;
  status: PublishStatus;
};

export type TimelineEventEntity = {
  id: number;
  year: number;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  sortOrder: number;
  status: PublishStatus;
};

export type TimelineEventFormValues = {
  year: number;
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  sortOrder: number;
  status: PublishStatus;
};

export type ServiceSectionEntity = {
  id: number;
  sectionKey: string;
  titleZh: string;
  titleEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  status: PublishStatus;
};

export type ServiceSectionFormValues = {
  sectionKey: string;
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  imageUrl: string;
  sortOrder: number;
  status: PublishStatus;
};

export type SalesOutletEntity = {
  id: number;
  regionZh: string;
  regionEn?: string | null;
  cityZh: string;
  cityEn?: string | null;
  addressZh: string;
  addressEn?: string | null;
  phone?: string | null;
  lat?: number | null;
  lng?: number | null;
  sortOrder: number;
  status: PublishStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type SalesOutletFormValues = {
  regionZh: string;
  regionEn: string;
  cityZh: string;
  cityEn: string;
  addressZh: string;
  addressEn: string;
  phone: string;
  lat?: number | null;
  lng?: number | null;
  sortOrder: number;
  status: PublishStatus;
};

export type SeoMetaEntity = {
  id: number;
  pageKey: string;
  titleZh?: string | null;
  titleEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  keywordsZh?: string | null;
  keywordsEn?: string | null;
  ogImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SeoMetaFormValues = {
  pageKey: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  keywordsZh: string;
  keywordsEn: string;
  ogImage: string;
};

export type ContactMessageStatus = 'new' | 'processing' | 'resolved' | 'spam';

export type ContactMessageEntity = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  message: string;
  isRead: boolean;
  status: ContactMessageStatus;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: PublishStatus;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type StrengthItemListQuery = AdminListQuery & {
  categoryId?: number;
};

export type CertificateListQuery = AdminListQuery & {
  category?: CertificateCategory;
};

export type ContactMessageListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: ContactMessageStatus;
  isRead?: boolean;
};

export type CustomRequirementStatus = 'pending' | 'followed';

export type CustomRequirementEntity = {
  id: number;
  name?: string | null;
  phone: string;
  company?: string | null;
  industry?: string | null;
  process?: string | null;
  temperature?: string | null;
  requirement?: string | null;
  status: CustomRequirementStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomRequirementListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: CustomRequirementStatus;
};
