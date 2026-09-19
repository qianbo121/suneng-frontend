import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isPublishedGuide } from '@/lib/publication-scope';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';

export default async function RelatedCaseLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  // Withdrawn content must not be rendered even if a request slips past middleware.
  const { locale } = await params;
  if (!isPublishedGuide(locale, '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou')) notFound();
  return <>{children}<EntryCaseEvidence entryPath="/solutions/rechuli-lu-dian-gai-ran-yure-huishou" locale={locale === 'en' ? 'en' : 'zh'} /></>;
}
