import { http, unwrapResponse } from '@/services/http';
import { AdminUser, AdminUserFormValues, AdminUserListQuery } from '@/types/auth';
import { ApiPaginationResult, ApiResponse } from '@/types/http';

function buildParams(query: AdminUserListQuery = {}) {
  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 10,
    keyword: query.keyword || undefined,
    role: query.role || undefined,
  };
}

export async function getAdminUserList(query: AdminUserListQuery = {}) {
  const response = await http.get<ApiResponse<ApiPaginationResult<AdminUser>>>('/admin/users', {
    params: buildParams(query),
  });
  return unwrapResponse(response);
}

export async function createAdminUser(
  payload: Required<Pick<AdminUserFormValues, 'username' | 'role' | 'isActive'>> & {
    password: string;
  },
) {
  const response = await http.post<ApiResponse<AdminUser>>('/admin/users', payload);
  return unwrapResponse(response);
}

export async function updateAdminUser(id: number, payload: Omit<AdminUserFormValues, 'password'>) {
  const response = await http.patch<ApiResponse<AdminUser>>(`/admin/users/${id}`, payload);
  return unwrapResponse(response);
}

export async function updateAdminUserPassword(id: number, password: string) {
  const response = await http.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/password`, {
    password,
  });
  return unwrapResponse(response);
}

export async function toggleAdminUser(id: number) {
  const response = await http.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/toggle`);
  return unwrapResponse(response);
}
