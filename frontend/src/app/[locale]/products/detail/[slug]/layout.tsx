import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';
import type { ReactNode } from 'react';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';
import { BuyerSelectionGuide } from '@/components/products/BuyerSelectionGuide';
import { productBuyerGuide } from '@/lib/buyer-selection-guides';
import { getProductionLineContent } from '@/lib/production-line-content';

export default async function ProductCaseLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale === 'zh' && getProductionLineContent(slug)) return <>{children}</>;
  return <>{children}{TECHNICAL_CONTENT_PUBLISHED && locale === 'en' && productBuyerGuide[slug] && <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}><BuyerSelectionGuide guideKey={productBuyerGuide[slug]} locale="en" /></div>}<EntryCaseEvidence entryPath={`/products/detail/${slug}`} locale={locale === 'en' ? 'en' : 'zh'} /></>;
}
