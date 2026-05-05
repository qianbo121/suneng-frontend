import { http, unwrapResponse } from '@/services/http';
import {
  ProductCategoryEntity,
  ProductEntity,
  ProductFormValues,
  ProductListQuery,
  PublishStatus,
} from '@/types/product';
import { ApiPaginationResult, ApiResponse } from '@/types/http';

type LoosePayload<T> = {
  [K in keyof T]: T[K] extends string ? string | undefined : T[K];
};

export type ProductPayload = LoosePayload<
  Omit<ProductFormValues, 'specsRows' | 'features' | 'status'>
> & {
  specsJson: Record<string, string>;
  featuresJson: string[];
};

function buildParams(query: ProductListQuery = {}) {
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

export async function getAllProductCategories() {
  const response = await http.get<ApiResponse<ApiPaginationResult<ProductCategoryEntity>>>(
    '/admin/product-categories',
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

export async function getProductList(query: ProductListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<ProductEntity>>>(
    '/admin/products',
    {
      params: buildParams(query),
    },
  );

  return unwrapResponse(response);
}

export async function getProductDetail(id: number) {
  const response = await http.get<ApiResponse<ProductEntity>>(`/admin/products/${id}`);
  return unwrapResponse(response);
}

export async function createProduct(payload: ProductPayload) {
  const response = await http.post<ApiResponse<ProductEntity>>('/admin/products', payload);
  return unwrapResponse(response);
}

export async function updateProduct(id: number, payload: ProductPayload) {
  const response = await http.patch<ApiResponse<ProductEntity>>(`/admin/products/${id}`, payload);
  return unwrapResponse(response);
}

export async function updateProductStatus(id: number, status: PublishStatus) {
  const response = await http.patch<ApiResponse<ProductEntity>>(`/admin/products/${id}/status`, {
    status,
  });
  return unwrapResponse(response);
}

export async function deleteProduct(id: number) {
  const response = await http.delete<ApiResponse<ProductEntity>>(`/admin/products/${id}`);
  return unwrapResponse(response);
}
