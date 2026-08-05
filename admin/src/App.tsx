import { AppProvider } from '@/app/providers/AppProvider';
import { AdminRouter, AdminRoutes } from '@/app/router/router';

export function App() {
  return (
    <AppProvider>
      <AdminRouter>
        <AdminRoutes />
      </AdminRouter>
    </AppProvider>
  );
}
