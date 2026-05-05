import { http, unwrapResponse } from '@/services/http';
import {
  ProductCategoryEntity,
  ProductCategoryFormValues,
  ProductCategoryListQuery,
  PublishStatus,
} from '@/types/product';
import { ApiPaginationResult, ApiResponse } from '@/types/http';

function buildParams(query: ProductCategoryListQuery = {}) {
  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 10,
    keyword: query.keyword || undefined,
    status: query.status || undefined,
    sortBy: query.sortBy || undefined,
    sortDirection: query.sortDirection || undefined,
  };
}

export async function getProductCategoryList(query: ProductCategoryListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<ProductCategoryEntity>>>(
    '/admin/product-categories',
    {
      params: buildParams(query),
    },
  );

  return unwrapResponse(response);
}

export async function getProductCategoryDetail(id: number) {
  const response = await http.get<ApiResponse<ProductCategoryEntity>>(
    `/admin/product-categories/${id}`,
  );
  return unwrapResponse(response);
}

export async function createProductCategory(payload: ProductCategoryFormValues) {
  const response = await http.post<ApiResponse<ProductCategoryEntity>>(
    '/admin/product-categories',
    payload,
  );
  return unwrapResponse(response);
}

export async function updateProductCategory(id: number, payload: ProductCategoryFormValues) {
  const response = await http.patch<ApiResponse<ProductCategoryEntity>>(
    `/admin/product-categories/${id}`,
    payload,
  );
  return unwrapResponse(response);
}

export async function updateProductCategoryStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<ProductCategoryEntity>>(
    `/admin/product-categories/${id}/status`,
    {
      status,
    },
  );
  return unwrapResponse(response);
}

export async function deleteProductCategory(id: number) {
  const response = await http.delete<ApiResponse<ProductCategoryEntity>>(
    `/admin/product-categories/${id}`,
  );
  return unwrapResponse(response);
}
