'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { LoadingFeedback } from '@/components/common/LoadingFeedback';
import type { Locale } from '@/types/site';

export function PageLoadingBoundary({ children, locale }: { children: ReactNode; locale: Locale }) {
  const pathname = usePathname();
  // Article bodies keep their direct rendering; other routes retain the shared
  // boundary that protects hydration while their page data is still arriving.
  if (pathname && /^\/(?:zh|en)\/news\/[^/]+\/?$/.test(pathname)) return children;

  return <Suspense fallback={<LoadingFeedback locale={locale} />}>{children}</Suspense>;
}
