import { http, unwrapResponse } from '@/services/http';
import {
  AboutSectionEntity,
  AdminListQuery,
  BannerEntity,
  BannerFormValues,
  CertificateEntity,
  CertificateFormValues,
  CertificateListQuery,
  ChairmanMessageEntity,
  CompanyInfoEntity,
  ContactMessageEntity,
  ContactMessageListQuery,
  CustomRequirementEntity,
  CustomRequirementListQuery,
  CultureValueEntity,
  DeliveryEntity,
  DeliveryFormValues,
  PartnerEntity,
  PartnerFormValues,
  SalesOutletEntity,
  SalesOutletFormValues,
  SeoMetaEntity,
  SeoMetaFormValues,
  ServiceSectionEntity,
  ServiceSectionFormValues,
  StrengthCategoryEntity,
  StrengthCategoryFormValues,
  StrengthItemEntity,
  StrengthItemFormValues,
  StrengthItemListQuery,
  TimelineEventEntity,
} from '@/types/content';
import { ApiPaginationResult, ApiResponse } from '@/types/http';
import { PublishStatus } from '@/types/product';

type LoosePayload<T> = {
  [K in keyof T]: T[K] extends string ? string | undefined : T[K];
};

function buildAdminParams(query: AdminListQuery = {}) {
  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 10,
    keyword: query.keyword || undefined,
    status: query.status || undefined,
    sortBy: query.sortBy || undefined,
    sortDirection: query.sortDirection || undefined,
  };
}

export async function getBannerList(query: AdminListQuery & { sectionKey?: string } = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<BannerEntity>>>(
    '/admin/banners',
    {
      params: {
        ...buildAdminParams(query),
        sectionKey: query.sectionKey || undefined,
      },
    },
  );
  return unwrapResponse(response);
}

export async function createBanner(payload: LoosePayload<Omit<BannerFormValues, 'status'>>) {
  const response = await http.post<ApiResponse<BannerEntity>>('/admin/banners', payload);
  return unwrapResponse(response);
}

export async function updateBanner(
  id: number,
  payload: LoosePayload<Omit<BannerFormValues, 'status'>>,
) {
  const response = await http.patch<ApiResponse<BannerEntity>>(`/admin/banners/${id}`, payload);
  return unwrapResponse(response);
}

export async function updateBannerStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<BannerEntity>>(`/admin/banners/${id}/status`, {
    status,
  });
  return unwrapResponse(response);
}

export async function deleteBanner(id: number) {
  const response = await http.delete<ApiResponse<BannerEntity>>(`/admin/banners/${id}`);
  return unwrapResponse(response);
}

export async function getStrengthCategoryList(query: AdminListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<StrengthCategoryEntity>>>(
    '/admin/strength-categories',
    {
      params: buildAdminParams(query),
    },
  );
  return unwrapResponse(response);
}

export async function getAllStrengthCategories() {
  const data = await getStrengthCategoryList({
    page: 1,
    pageSize: 100,
    sortBy: 'sortOrder',
    sortDirection: 'asc',
  });
  return data.items;
}

export async function createStrengthCategory(
  payload: LoosePayload<Omit<StrengthCategoryFormValues, 'status'>>,
) {
  const response = await http.post<ApiResponse<StrengthCategoryEntity>>(
    '/admin/strength-categories',
    payload,
  );
  return unwrapResponse(response);
}

export async function updateStrengthCategory(
  id: number,
  payload: LoosePayload<Omit<StrengthCategoryFormValues, 'status'>>,
) {
  const response = await http.patch<ApiResponse<StrengthCategoryEntity>>(
    `/admin/strength-categories/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateStrengthCategoryStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<StrengthCategoryEntity>>(
    `/admin/strength-categories/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteStrengthCategory(id: number) {
  const response = await http.delete<ApiResponse<StrengthCategoryEntity>>(
    `/admin/strength-categories/${id}`,
  );
  return unwrapResponse(response);
}

export async function getStrengthItemList(query: StrengthItemListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<StrengthItemEntity>>>(
    '/admin/strength-items',
    {
      params: {
        ...buildAdminParams(query),
        categoryId: query.categoryId || undefined,
      },
    },
  );
  return unwrapResponse(response);
}

export async function getStrengthItemDetail(id: number) {
  const response = await http.get<ApiResponse<StrengthItemEntity>>(`/admin/strength-items/${id}`);
  return unwrapResponse(response);
}

export async function createStrengthItem(
  payload: LoosePayload<Omit<StrengthItemFormValues, 'status'>>,
) {
  const response = await http.post<ApiResponse<StrengthItemEntity>>(
    '/admin/strength-items',
    payload,
  );
  return unwrapResponse(response);
}

export async function updateStrengthItem(
  id: number,
  payload: LoosePayload<Omit<StrengthItemFormValues, 'status'>>,
) {
  const response = await http.patch<ApiResponse<StrengthItemEntity>>(
    `/admin/strength-items/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateStrengthItemStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<StrengthItemEntity>>(
    `/admin/strength-items/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteStrengthItem(id: number) {
  const response = await http.delete<ApiResponse<StrengthItemEntity>>(
    `/admin/strength-items/${id}`,
  );
  return unwrapResponse(response);
}

export async function getCertificateList(query: CertificateListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<CertificateEntity>>>(
    '/admin/certificates',
    {
      params: {
        ...buildAdminParams(query),
        category: query.category || undefined,
      },
    },
  );
  return unwrapResponse(response);
}

export async function createCertificate(
  payload: LoosePayload<Omit<CertificateFormValues, 'status'>>,
) {
  const response = await http.post<ApiResponse<CertificateEntity>>('/admin/certificates', payload);
  return unwrapResponse(response);
}

export async function updateCertificate(
  id: number,
  payload: LoosePayload<Omit<CertificateFormValues, 'status'>>,
) {
  const response = await http.patch<ApiResponse<CertificateEntity>>(
    `/admin/certificates/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateCertificateStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<CertificateEntity>>(
    `/admin/certificates/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteCertificate(id: number) {
  const response = await http.delete<ApiResponse<CertificateEntity>>(`/admin/certificates/${id}`);
  return unwrapResponse(response);
}

export async function getPartnerList(query: AdminListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<PartnerEntity>>>(
    '/admin/partners',
    {
      params: buildAdminParams(query),
    },
  );
  return unwrapResponse(response);
}

export async function createPartner(payload: LoosePayload<Omit<PartnerFormValues, 'status'>>) {
  const response = await http.post<ApiResponse<PartnerEntity>>('/admin/partners', payload);
  return unwrapResponse(response);
}

export async function updatePartner(
  id: number,
  payload: LoosePayload<Omit<PartnerFormValues, 'status'>>,
) {
  const response = await http.patch<ApiResponse<PartnerEntity>>(`/admin/partners/${id}`, payload);
  return unwrapResponse(response);
}

export async function updatePartnerStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<PartnerEntity>>(`/admin/partners/${id}/status`, {
    status,
  });
  return unwrapResponse(response);
}

export async function deletePartner(id: number) {
  const response = await http.delete<ApiResponse<PartnerEntity>>(`/admin/partners/${id}`);
  return unwrapResponse(response);
}

export async function getDeliveryList(query: AdminListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<DeliveryEntity>>>(
    '/admin/deliveries',
    {
      params: buildAdminParams(query),
    },
  );
  return unwrapResponse(response);
}

export async function createDelivery(
  payload: LoosePayload<Omit<DeliveryFormValues, 'status' | 'deliveryDate'>> & {
    deliveryDate?: string;
  },
) {
  const response = await http.post<ApiResponse<DeliveryEntity>>('/admin/deliveries', payload);
  return unwrapResponse(response);
}

export async function updateDelivery(
  id: number,
  payload: LoosePayload<Omit<DeliveryFormValues, 'status' | 'deliveryDate'>> & {
    deliveryDate?: string;
  },
) {
  const response = await http.patch<ApiResponse<DeliveryEntity>>(
    `/admin/deliveries/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateDeliveryStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<DeliveryEntity>>(`/admin/deliveries/${id}/status`, {
    status,
  });
  return unwrapResponse(response);
}

export async function deleteDelivery(id: number) {
  const response = await http.delete<ApiResponse<DeliveryEntity>>(`/admin/deliveries/${id}`);
  return unwrapResponse(response);
}

export async function getCompanyInfoList(
  query: { page?: number; pageSize?: number; keyword?: string } = {},
) {
  const response = await http.get<ApiResponse<ApiPaginationResult<CompanyInfoEntity>>>(
    '/admin/company-info',
    {
      params: {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 100,
        keyword: query.keyword || undefined,
      },
    },
  );
  return unwrapResponse(response);
}

export async function createCompanyInfo(payload: Omit<CompanyInfoEntity, 'id'>) {
  const response = await http.post<ApiResponse<CompanyInfoEntity>>('/admin/company-info', payload);
  return unwrapResponse(response);
}

export async function updateCompanyInfo(id: number, payload: Omit<CompanyInfoEntity, 'id'>) {
  const response = await http.patch<ApiResponse<CompanyInfoEntity>>(
    `/admin/company-info/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function deleteCompanyInfo(id: number) {
  const response = await http.delete<ApiResponse<CompanyInfoEntity>>(`/admin/company-info/${id}`);
  return unwrapResponse(response);
}

export async function getAboutSectionList(query: AdminListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<AboutSectionEntity>>>(
    '/admin/about/sections',
    {
      params: buildAdminParams(query),
    },
  );
  return unwrapResponse(response);
}

export async function createAboutSection(payload: Omit<AboutSectionEntity, 'id' | 'status'>) {
  const response = await http.post<ApiResponse<AboutSectionEntity>>(
    '/admin/about/sections',
    payload,
  );
  return unwrapResponse(response);
}

export async function updateAboutSection(
  id: number,
  payload: Omit<AboutSectionEntity, 'id' | 'status'>,
) {
  const response = await http.patch<ApiResponse<AboutSectionEntity>>(
    `/admin/about/sections/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateAboutSectionStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<AboutSectionEntity>>(
    `/admin/about/sections/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteAboutSection(id: number) {
  const response = await http.delete<ApiResponse<AboutSectionEntity>>(
    `/admin/about/sections/${id}`,
  );
  return unwrapResponse(response);
}

export async function getChairmanList(query: AdminListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<ChairmanMessageEntity>>>(
    '/admin/about/chairman',
    {
      params: buildAdminParams(query),
    },
  );
  return unwrapResponse(response);
}

export async function createChairman(payload: Omit<ChairmanMessageEntity, 'id' | 'status'>) {
  const response = await http.post<ApiResponse<ChairmanMessageEntity>>(
    '/admin/about/chairman',
    payload,
  );
  return unwrapResponse(response);
}

export async function updateChairman(
  id: number,
  payload: Omit<ChairmanMessageEntity, 'id' | 'status'>,
) {
  const response = await http.patch<ApiResponse<ChairmanMessageEntity>>(
    `/admin/about/chairman/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateChairmanStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<ChairmanMessageEntity>>(
    `/admin/about/chairman/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteChairman(id: number) {
  const response = await http.delete<ApiResponse<ChairmanMessageEntity>>(
    `/admin/about/chairman/${id}`,
  );
  return unwrapResponse(response);
}

export async function getCultureList(query: AdminListQuery & { type?: string } = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<CultureValueEntity>>>(
    '/admin/about/culture',
    {
      params: {
        ...buildAdminParams(query),
        type: query.type || undefined,
      },
    },
  );
  return unwrapResponse(response);
}

export async function createCulture(payload: Omit<CultureValueEntity, 'id' | 'status'>) {
  const response = await http.post<ApiResponse<CultureValueEntity>>(
    '/admin/about/culture',
    payload,
  );
  return unwrapResponse(response);
}

export async function updateCulture(
  id: number,
  payload: Omit<CultureValueEntity, 'id' | 'status'>,
) {
  const response = await http.patch<ApiResponse<CultureValueEntity>>(
    `/admin/about/culture/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateCultureStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<CultureValueEntity>>(
    `/admin/about/culture/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteCulture(id: number) {
  const response = await http.delete<ApiResponse<CultureValueEntity>>(`/admin/about/culture/${id}`);
  return unwrapResponse(response);
}

export async function getTimelineList(query: AdminListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<TimelineEventEntity>>>(
    '/admin/about/timeline',
    {
      params: buildAdminParams(query),
    },
  );
  return unwrapResponse(response);
}

export async function createTimeline(payload: Omit<TimelineEventEntity, 'id' | 'status'>) {
  const response = await http.post<ApiResponse<TimelineEventEntity>>(
    '/admin/about/timeline',
    payload,
  );
  return unwrapResponse(response);
}

export async function updateTimeline(
  id: number,
  payload: Omit<TimelineEventEntity, 'id' | 'status'>,
) {
  const response = await http.patch<ApiResponse<TimelineEventEntity>>(
    `/admin/about/timeline/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateTimelineStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<TimelineEventEntity>>(
    `/admin/about/timeline/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteTimeline(id: number) {
  const response = await http.delete<ApiResponse<TimelineEventEntity>>(
    `/admin/about/timeline/${id}`,
  );
  return unwrapResponse(response);
}

export async function getServiceSectionList(query: AdminListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<ServiceSectionEntity>>>(
    '/admin/services',
    {
      params: buildAdminParams(query),
    },
  );
  return unwrapResponse(response);
}

export async function createServiceSection(
  payload: LoosePayload<Omit<ServiceSectionFormValues, 'status'>>,
) {
  const response = await http.post<ApiResponse<ServiceSectionEntity>>('/admin/services', payload);
  return unwrapResponse(response);
}

export async function updateServiceSection(
  id: number,
  payload: LoosePayload<Omit<ServiceSectionFormValues, 'status'>>,
) {
  const response = await http.patch<ApiResponse<ServiceSectionEntity>>(
    `/admin/services/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateServiceSectionStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<ServiceSectionEntity>>(
    `/admin/services/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteServiceSection(id: number) {
  const response = await http.delete<ApiResponse<ServiceSectionEntity>>(`/admin/services/${id}`);
  return unwrapResponse(response);
}

export async function getSalesOutletList(query: AdminListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<SalesOutletEntity>>>(
    '/admin/sales-outlets',
    {
      params: buildAdminParams(query),
    },
  );
  return unwrapResponse(response);
}

export async function createSalesOutlet(
  payload: LoosePayload<Omit<SalesOutletFormValues, 'status'>>,
) {
  const response = await http.post<ApiResponse<SalesOutletEntity>>('/admin/sales-outlets', payload);
  return unwrapResponse(response);
}

export async function updateSalesOutlet(
  id: number,
  payload: LoosePayload<Omit<SalesOutletFormValues, 'status'>>,
) {
  const response = await http.patch<ApiResponse<SalesOutletEntity>>(
    `/admin/sales-outlets/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateSalesOutletStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<SalesOutletEntity>>(
    `/admin/sales-outlets/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteSalesOutlet(id: number) {
  const response = await http.delete<ApiResponse<SalesOutletEntity>>(`/admin/sales-outlets/${id}`);
  return unwrapResponse(response);
}

export async function getSeoList(
  query: { page?: number; pageSize?: number; keyword?: string } = {},
) {
  const response = await http.get<ApiResponse<ApiPaginationResult<SeoMetaEntity>>>('/admin/seo', {
    params: {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      keyword: query.keyword || undefined,
    },
  });
  return unwrapResponse(response);
}

export async function createSeoMeta(payload: LoosePayload<SeoMetaFormValues>) {
  const response = await http.post<ApiResponse<SeoMetaEntity>>('/admin/seo', payload);
  return unwrapResponse(response);
}

export async function updateSeoMeta(id: number, payload: LoosePayload<SeoMetaFormValues>) {
  const response = await http.patch<ApiResponse<SeoMetaEntity>>(`/admin/seo/${id}`, payload);
  return unwrapResponse(response);
}

export async function deleteSeoMeta(id: number) {
  const response = await http.delete<ApiResponse<SeoMetaEntity>>(`/admin/seo/${id}`);
  return unwrapResponse(response);
}

export async function getContactMessageList(query: ContactMessageListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<ContactMessageEntity>>>(
    '/admin/contact-messages',
    {
      params: {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10,
        keyword: query.keyword || undefined,
        status: query.status || undefined,
        isRead: query.isRead === undefined ? undefined : String(query.isRead),
      },
    },
  );
  return unwrapResponse(response);
}

export async function getContactMessageDetail(id: number) {
  const response = await http.get<ApiResponse<ContactMessageEntity>>(
    `/admin/contact-messages/${id}`,
  );
  return unwrapResponse(response);
}

export async function markContactMessageRead(id: number) {
  const response = await http.patch<ApiResponse<ContactMessageEntity>>(
    `/admin/contact-messages/${id}/read`,
  );
  return unwrapResponse(response);
}

export async function updateContactMessageStatus(
  id: number,
  status: ContactMessageEntity['status'],
) {
  const response = await http.patch<ApiResponse<ContactMessageEntity>>(
    `/admin/contact-messages/${id}/status`,
    { status },
  );
  return unwrapResponse(response);
}

export async function deleteContactMessage(id: number) {
  const response = await http.delete<ApiResponse<ContactMessageEntity>>(
    `/admin/contact-messages/${id}`,
  );
  return unwrapResponse(response);
}

export async function getCustomRequirementList(query: CustomRequirementListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<CustomRequirementEntity>>>(
    '/admin/custom-requirements',
    {
      params: {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10,
        keyword: query.keyword || undefined,
        status: query.status || undefined,
      },
    },
  );
  return unwrapResponse(response);
}

export async function markCustomRequirementFollowed(id: number) {
  const response = await http.patch<ApiResponse<CustomRequirementEntity>>(
    `/admin/custom-requirements/${id}/follow`,
  );
  return unwrapResponse(response);
}
