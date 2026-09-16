import type { ReactNode } from 'react';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';

export default async function RelatedCaseLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <>{children}<EntryCaseEvidence entryPath="/service/furnace-renovation-overhaul" locale={locale === 'en' ? 'en' : 'zh'} /></>;
}
