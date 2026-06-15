import { FileProtectOutlined, FileTextOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

import { AdminRole } from '@/types/auth';

export type AdminMenuRoute = {
  key: string;
  path: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  tags?: string[];
  roles?: AdminRole[];
  children?: AdminMenuRoute[];
};

export const adminMenuRoutes: AdminMenuRoute[] = [
  {
    key: 'news',
    path: '/news',
    label: '新闻管理',
    icon: <FileTextOutlined />,
    description: '管理新闻列表、封面图、正文内容和发布时间。',
    tags: ['新闻', '封面图', '正文'],
  },
  {
    key: 'custom-requirements',
    path: '/custom-requirements',
    label: '客户非标需求',
    icon: <FileProtectOutlined />,
    description: '查看产品详情页提交的非标需求，并跟进客户需求状态。',
    tags: ['非标需求', '客户', '跟进'],
  },
];

export const menuIconMap: Record<string, ReactNode> = {
  news: <FileTextOutlined />,
  'custom-requirements': <FileProtectOutlined />,
};

export function flattenAdminRoutes(routes: AdminMenuRoute[]): AdminMenuRoute[] {
  return routes.flatMap((route) =>
    route.children?.length ? flattenAdminRoutes(route.children) : [route],
  );
}

export const adminLeafRoutes = flattenAdminRoutes(adminMenuRoutes);

export function findAdminRoute(pathname: string): AdminMenuRoute | null {
  return (
    adminLeafRoutes.find((item) => pathname === item.path) ||
    adminLeafRoutes.find((item) => pathname.startsWith(`${item.path}/`)) ||
    null
  );
}

export function filterAdminMenuRoutesByRole(
  routes: AdminMenuRoute[],
  role?: AdminRole,
): AdminMenuRoute[] {
  return routes
    .filter((route) => !route.roles?.length || (role ? route.roles.includes(role) : false))
    .map((route) => ({
      ...route,
      children: route.children ? filterAdminMenuRoutesByRole(route.children, role) : undefined,
    }))
    .filter((route) => !route.children || route.children.length > 0);
}
