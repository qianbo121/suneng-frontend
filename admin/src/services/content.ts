import { http, unwrapResponse } from '@/services/http';
import { CustomRequirementEntity, CustomRequirementListQuery } from '@/types/content';
import { ApiPaginationResult, ApiResponse } from '@/types/http';

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
