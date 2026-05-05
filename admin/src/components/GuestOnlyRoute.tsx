import { Navigate, Outlet } from 'react-router-dom';

import { RouteLoading } from '@/components/RouteLoading';
import { useAuth } from '@/hooks/use-auth';

export function GuestOnlyRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <RouteLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
