'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { LoadingFeedback } from '@/components/common/LoadingFeedback';
import type { Locale } from '@/types/site';

export function PageLoadingBoundary({ children, locale }: { children: ReactNode; locale: Locale }) {
  const pathname = usePathname();
  // Keep the approved core pages and article bodies directly readable.
  // Other routes retain the shared boundary while their page data is arriving.
  if (pathname && (
    /^\/(?:zh|en)\/?$/.test(pathname)
    || /^\/(?:zh|en)\/products\/detail\/copper-wire-annealing-line\/?$/.test(pathname)
    || /^\/zh\/(?:products|products\/detail\/(?:mesh-belt-furnace|trolley-furnace)|service\/furnace-renovation-overhaul)\/?$/.test(pathname)
    || /^\/(?:zh|en)\/news\/[^/]+\/?$/.test(pathname)
  )) return children;

  return <Suspense fallback={<LoadingFeedback locale={locale} />}>{children}</Suspense>;
}
