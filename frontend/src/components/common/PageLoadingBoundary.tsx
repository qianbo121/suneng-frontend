'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { LoadingFeedback } from '@/components/common/LoadingFeedback';
import { APPROVED_GUIDE_PATHS, APPROVED_PROCUREMENT_PATHS } from '@/lib/publication-scope';
import type { Locale } from '@/types/site';

export function PageLoadingBoundary({ children, locale }: { children: ReactNode; locale: Locale }) {
  const pathname = usePathname();
  const pagePath = pathname?.replace(/\/+$/, '') ?? '';
  // Batch 2 only: approved procurement pages and existing service routes.
  const procurementOrService = APPROVED_GUIDE_PATHS.has(pagePath)
    || APPROVED_PROCUREMENT_PATHS.has(pagePath)
    || /^\/(?:zh|en)\/service(?:\/(?:furnace-renovation-overhaul|installation-after-sales|furnace-relocation-restart|selection-retrofit-guide))?$/.test(pagePath);

  // Keep core pages, article bodies and ordinary list entry links readable.
  // Search/filter lists retain their own (list)/loading boundary; plain lists
  // may reach this layout through the internal news-prerendered rewrite.
  // Product details also render their content directly; nested inquiry tools
  // and other routes retain the shared boundary while page data is arriving.
  if (pathname && (
    /^\/(?:zh|en)\/?$/.test(pathname)
    || /^\/(?:zh|en)\/products\/detail\/[^/]+\/?$/.test(pathname)
    || procurementOrService
    || /^\/zh\/(?:products|products\/detail\/(?:mesh-belt-furnace|trolley-furnace)|service\/furnace-renovation-overhaul)\/?$/.test(pathname)
    || /^\/(?:zh|en)\/news\/[^/]+\/?$/.test(pathname)
    || /^\/(?:zh|en)\/news\/?$/.test(pathname)
    || /^\/(?:zh|en)\/news-prerendered\/[1-9]\d*\/?$/.test(pathname)
  )) return children;

  return <Suspense fallback={<LoadingFeedback locale={locale} />}>{children}</Suspense>;
}
