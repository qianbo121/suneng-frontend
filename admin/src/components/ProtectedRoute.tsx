import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { RouteLoading } from '@/components/RouteLoading';
import { useAuth } from '@/hooks/use-auth';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <RouteLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
