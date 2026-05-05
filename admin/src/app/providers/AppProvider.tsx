import { ConfigProvider, App as AntApp } from 'antd';
import { PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';

import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { GlobalLoading } from '@/components/GlobalLoading';
import { AuthProvider } from '@/app/providers/AuthProvider';

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#004B97',
          colorError: '#E60012',
          borderRadius: 10,
        },
      }}
    >
      <AntApp>
        <SWRConfig
          value={{
            revalidateOnFocus: false,
            shouldRetryOnError: false,
          }}
        >
          <AppErrorBoundary>
            <AuthProvider>
              {children}
              <GlobalLoading />
            </AuthProvider>
          </AppErrorBoundary>
        </SWRConfig>
      </AntApp>
    </ConfigProvider>
  );
}
