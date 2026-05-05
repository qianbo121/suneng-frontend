import { RouterProvider } from 'react-router-dom';

import { AppProvider } from '@/app/providers/AppProvider';
import { router } from '@/app/router/router';

export function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
