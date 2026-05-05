import { http, unwrapResponse } from '@/services/http';
import { ApiResponse } from '@/types/http';

export type DashboardStats = {
  productCount: number;
  newsCount: number;
  unreadContactCount: number;
  todayVisitCount: number;
};

export async function getDashboardStats() {
  const response = await http.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
  return unwrapResponse(response);
}
