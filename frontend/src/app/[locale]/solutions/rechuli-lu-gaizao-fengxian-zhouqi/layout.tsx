import type { ReactNode } from 'react';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';
import { BuyerSelectionGuide } from '@/components/products/BuyerSelectionGuide';

export default async function RelatedCaseLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <>{children}{locale === 'en' && <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}><BuyerSelectionGuide guideKey="trolley-renovation" locale="en" /></div>}<EntryCaseEvidence entryPath="/solutions/rechuli-lu-gaizao-fengxian-zhouqi" locale={locale === 'en' ? 'en' : 'zh'} /></>;
}
