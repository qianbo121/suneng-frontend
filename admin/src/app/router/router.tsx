import { ReactNode, Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import { GuestOnlyRoute } from '@/components/GuestOnlyRoute';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RouteLoading } from '@/components/RouteLoading';
import { AdminLayout } from '@/app/layouts/AdminLayout';

const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const NewsListPage = lazy(() =>
  import('@/pages/news/NewsListPage').then((module) => ({ default: module.NewsListPage })),
);
const CustomRequirementPage = lazy(() =>
  import('@/pages/content/CustomRequirementPage').then((module) => ({
    default: module.CustomRequirementPage,
  })),
);
const ChangePasswordPage = lazy(() =>
  import('@/pages/system/ChangePasswordPage').then((module) => ({
    default: module.ChangePasswordPage,
  })),
);

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

export const router = createBrowserRouter(
  [
    {
      element: <GuestOnlyRoute />,
      children: [
        {
          path: '/login',
          element: withSuspense(<LoginPage />),
        },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: '/',
          element: <AdminLayout />,
          children: [
            {
              index: true,
              element: <Navigate to="/news" replace />,
            },
            {
              path: 'news',
              element: withSuspense(<NewsListPage />),
            },
            {
              path: 'news/new',
              element: <Navigate to="/news" replace />,
            },
            {
              path: 'news/:id/edit',
              element: <Navigate to="/news" replace />,
            },
            {
              path: 'custom-requirements',
              element: withSuspense(<CustomRequirementPage />),
            },
            {
              path: 'profile/password',
              element: withSuspense(<ChangePasswordPage />),
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/news" replace />,
    },
  ],
  {
    basename:
      import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/'
        ? import.meta.env.BASE_URL.replace(/\/$/, '')
        : undefined,
  },
);
