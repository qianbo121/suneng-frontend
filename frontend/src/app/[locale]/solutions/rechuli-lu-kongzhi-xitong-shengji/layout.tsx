import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';

export default async function RelatedCaseLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  // Withdrawn content must not be rendered even if a request slips past middleware.
  if (!TECHNICAL_CONTENT_PUBLISHED) notFound();
  const { locale } = await params;
  return <>{children}<EntryCaseEvidence entryPath="/solutions/rechuli-lu-kongzhi-xitong-shengji" locale={locale === 'en' ? 'en' : 'zh'} /></>;
}
