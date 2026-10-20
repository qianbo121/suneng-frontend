'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { LoadingFeedback } from '@/components/common/LoadingFeedback';
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';
import { APPROVED_GUIDE_PATHS, APPROVED_PROCUREMENT_PATHS } from '@/lib/publication-scope';
import type { Locale } from '@/types/site';

export function PageLoadingBoundary({ children, locale }: { children: ReactNode; locale: Locale }) {
  const pathname = usePathname();
  const pagePath = pathname?.replace(/\/+$/, '') ?? '';

  // Batch 1.2: match the product page itself, never nested inquiry tools.
  // Product existence and publication remain the page's responsibility.
  const productDetail = /^\/(?:zh|en)\/products\/detail\/[^/]+$/.test(pagePath);

  // These two public checklists must expose their text without running scripts.
  // Other nested product tools keep their existing loading boundary.
  const publicInquiryChecklist = /^\/(?:zh|en)\/products\/detail\/copper-wire-annealing-line\/inquiry-checklist$/.test(pagePath);

  // Batch 1.3: only approved procurement pages and existing service pages.
  // This does not reopen their withdrawn English editions or unknown routes.
  const procurementOrService = APPROVED_GUIDE_PATHS.has(pagePath)
    || APPROVED_PROCUREMENT_PATHS.has(pagePath)
    || /^\/(?:zh|en)\/service(?:\/(?:furnace-renovation-overhaul|installation-after-sales|furnace-relocation-restart|selection-retrofit-guide))?$/.test(pagePath);

  // Batch 1.4: exact information pages and owner-approved case routes.
  const informationPage = /^\/(?:zh|en)\/(?:products|about|contact|partner|strength(?:\/honors)?)$/.test(pagePath);
  const caseRoute = pagePath.match(/^\/(zh|en)\/case(?:\/([^/]+))?$/);
  const publicCases = caseRoute?.[1] === 'en' ? PUBLIC_ENGLISH_CASE_SLUGS : PUBLIC_CASE_SLUGS;
  const publishedCase = !!caseRoute && (caseRoute[2] ? publicCases.has(caseRoute[2]) : publicCases.size > 0);

  // Keep home pages, article bodies and ordinary list entry links readable.
  // Search/filter lists retain their own (list)/loading boundary; plain lists
  // may reach this layout through the internal news-prerendered rewrite.
  // Ordinary inquiry pages and all other routes retain the shared boundary.
  if (pathname && (
    /^\/(?:zh|en)\/?$/.test(pathname)
    || productDetail
    || publicInquiryChecklist
    || procurementOrService
    || informationPage
    || publishedCase
    || /^\/(?:zh|en)\/news\/[^/]+\/?$/.test(pathname)
    || /^\/(?:zh|en)\/news\/?$/.test(pathname)
    || /^\/(?:zh|en)\/news-prerendered\/[1-9]\d*\/?$/.test(pathname)
  )) return children;

  return <Suspense fallback={<LoadingFeedback locale={locale} />}>{children}</Suspense>;
}
