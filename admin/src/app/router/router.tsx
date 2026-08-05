import { ReactNode, Suspense, lazy, useEffect } from 'react';

import { AdminLayout } from '@/app/layouts/AdminLayout';
import { AdminRouter, useAdminLocation, useAdminNavigate } from '@/app/router/navigation';
import { resolveAdminRoute } from '@/app/router/route-resolution';
import { RouteLoading } from '@/components/RouteLoading';
import { useAuth } from '@/hooks/use-auth';

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

export { AdminRouter };

function Redirect({ to, state }: { to: string; state?: unknown }) {
  const navigate = useAdminNavigate();
  useEffect(() => navigate(to, { replace: true, state }), [navigate, state, to]);
  return <RouteLoading />;
}

function suspended(element: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

export function AdminRoutes() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useAdminLocation();
  const decision = resolveAdminRoute({
    pathname: location.pathname,
    search: location.search,
    isAuthenticated,
    isInitializing,
  });

  if (decision.kind === 'loading') {
    return <RouteLoading />;
  }

  if (decision.kind === 'redirect') {
    return <Redirect to={decision.to} state={decision.state} />;
  }

  let page: ReactNode;
  if (decision.page === 'login') {
    return suspended(<LoginPage />);
  }
  if (decision.page === 'news') {
    page = <NewsListPage />;
  } else if (decision.page === 'custom-requirements') {
    page = <CustomRequirementPage />;
  } else {
    page = <ChangePasswordPage />;
  }

  return <AdminLayout>{suspended(page)}</AdminLayout>;
}
