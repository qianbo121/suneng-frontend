import type { ReactNode } from 'react';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';

export default async function RelatedCaseLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <>{children}<EntryCaseEvidence entryPath="/solutions/rechuli-lu-wendu-bujun-zhenggai" locale={locale === 'en' ? 'en' : 'zh'} /></>;
}
