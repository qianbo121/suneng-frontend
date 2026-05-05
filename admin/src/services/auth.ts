import { http, unwrapResponse } from '@/services/http';
import { ChangePasswordPayload, LoginPayload, LoginResponse, AdminUser } from '@/types/auth';
import { ApiResponse } from '@/types/http';

export async function loginWithPassword(payload: LoginPayload) {
  const response = await http.post<ApiResponse<LoginResponse>>('/admin/auth/login', payload, {
    meta: {
      skipAuth: true,
      silentError: true,
    },
  });

  return unwrapResponse(response);
}

export async function fetchAdminProfile() {
  const response = await http.get<ApiResponse<AdminUser>>('/admin/auth/profile', {
    meta: {
      silentError: true,
    },
  });

  return unwrapResponse(response);
}

export async function changeOwnPassword(payload: ChangePasswordPayload) {
  const response = await http.patch<ApiResponse<{ success: boolean }>>(
    '/admin/auth/password',
    payload,
  );
  return unwrapResponse(response);
}
