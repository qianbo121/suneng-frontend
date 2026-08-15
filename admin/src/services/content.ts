import { http, unwrapResponse } from '@/services/http';
import {
  CustomRequirementEntity,
  CustomRequirementListQuery,
  InquiryNotificationAudit,
  ManageInquiryNotificationPayload,
  ManageInquiryNotificationResult,
} from '@/types/content';
import { ApiPaginationResult, ApiResponse } from '@/types/http';

export async function getCustomRequirementList(query: CustomRequirementListQuery = {}) {
  const response = await http.post<ApiResponse<ApiPaginationResult<CustomRequirementEntity>>>(
    '/admin/custom-requirements/search',
    {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      keyword: query.keyword || undefined,
      status: query.status || undefined,
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

export async function manageCustomRequirementNotification(
  id: number,
  payload: ManageInquiryNotificationPayload,
) {
  const response = await http.patch<ApiResponse<ManageInquiryNotificationResult>>(
    `/admin/custom-requirements/${id}/notification`,
    payload,
    { meta: { silentError: true } },
  );
  return unwrapResponse(response);
}

export async function getCustomRequirementNotificationAudits(id: number) {
  const response = await http.get<ApiResponse<InquiryNotificationAudit[]>>(
    `/admin/custom-requirements/${id}/notification-audits`,
    { meta: { silentError: true } },
  );
  return unwrapResponse(response);
}
