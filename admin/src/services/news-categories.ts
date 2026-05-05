import { http, unwrapResponse } from '@/services/http';
import { NewsCategoryEntity, NewsCategoryFormValues, NewsCategoryListQuery } from '@/types/news';
import { PublishStatus } from '@/types/product';
import { ApiPaginationResult, ApiResponse } from '@/types/http';

function buildParams(query: NewsCategoryListQuery = {}) {
  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 10,
    keyword: query.keyword || undefined,
    status: query.status || undefined,
    sortBy: query.sortBy || undefined,
    sortDirection: query.sortDirection || undefined,
  };
}

export async function getNewsCategoryList(query: NewsCategoryListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<NewsCategoryEntity>>>(
    '/admin/news-categories',
    {
      params: buildParams(query),
    },
  );

  return unwrapResponse(response);
}

export async function getAllNewsCategories() {
  const response = await http.get<ApiResponse<ApiPaginationResult<NewsCategoryEntity>>>(
    '/admin/news-categories',
    {
      params: {
        page: 1,
        pageSize: 200,
        sortBy: 'sortOrder',
        sortDirection: 'asc',
      },
    },
  );

  return unwrapResponse(response).items;
}

export async function createNewsCategory(payload: NewsCategoryFormValues) {
  const response = await http.post<ApiResponse<NewsCategoryEntity>>(
    '/admin/news-categories',
    payload,
  );
  return unwrapResponse(response);
}

export async function updateNewsCategory(id: number, payload: NewsCategoryFormValues) {
  const response = await http.patch<ApiResponse<NewsCategoryEntity>>(
    `/admin/news-categories/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateNewsCategoryStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<NewsCategoryEntity>>(
    `/admin/news-categories/${id}/status`,
    {
      status,
    },
  );
  return unwrapResponse(response);
}

export async function deleteNewsCategory(id: number) {
  const response = await http.delete<ApiResponse<NewsCategoryEntity>>(
    `/admin/news-categories/${id}`,
  );
  return unwrapResponse(response);
}
