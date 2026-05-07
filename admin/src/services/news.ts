import { http, unwrapResponse } from '@/services/http';
import { NewsEntity, NewsFormValues, NewsListQuery } from '@/types/news';
import { PublishStatus } from '@/types/product';
import { ApiPaginationResult, ApiResponse } from '@/types/http';

type LoosePayload<T> = {
  [K in keyof T]: T[K] extends string ? string | undefined : T[K];
};

export type NewsPayload = Omit<
  LoosePayload<Omit<NewsFormValues, 'publishDate' | 'status'>>,
  'categoryId'
> & {
  categoryId?: number;
  publishDate?: string;
  isPublished: boolean;
};

function buildParams(query: NewsListQuery = {}) {
  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 10,
    keyword: query.keyword || undefined,
    categoryId: query.categoryId || undefined,
    status: query.status || undefined,
    sortBy: query.sortBy || undefined,
    sortDirection: query.sortDirection || undefined,
  };
}

export async function getNewsList(query: NewsListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<NewsEntity>>>('/admin/news', {
    params: buildParams(query),
  });

  return unwrapResponse(response);
}

export async function getNewsDetail(id: number) {
  const response = await http.get<ApiResponse<NewsEntity>>(`/admin/news/${id}`);
  return unwrapResponse(response);
}

export async function createNews(payload: NewsPayload) {
  const response = await http.post<ApiResponse<NewsEntity>>('/admin/news', payload);
  return unwrapResponse(response);
}

export async function updateNews(id: number, payload: NewsPayload) {
  const response = await http.patch<ApiResponse<NewsEntity>>(`/admin/news/${id}`, payload);
  return unwrapResponse(response);
}

export async function updateNewsStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<NewsEntity>>(`/admin/news/${id}/status`, {
    status,
  });
  return unwrapResponse(response);
}

export async function deleteNews(id: number) {
  const response = await http.delete<ApiResponse<NewsEntity>>(`/admin/news/${id}`);
  return unwrapResponse(response);
}
