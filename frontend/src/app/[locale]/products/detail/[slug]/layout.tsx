import { getEnglishProductionLine } from '@/lib/english-production-lines';
import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { HiArrowUpRight } from 'react-icons/hi2';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';
import { BuyerSelectionGuide } from '@/components/products/BuyerSelectionGuide';
import { productBuyerGuide } from '@/lib/buyer-selection-guides';
import { getProductionLineContent } from '@/lib/production-line-content';

export default async function ProductCaseLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (getProductionLineContent(slug) && (locale === 'zh' || getEnglishProductionLine(slug))) return <>{children}</>;
  return <>{children}
    {slug === 'mesh-belt-furnace' && ['zh', 'en'].includes(locale) && (
      <aside className="mx-auto w-[calc(100%-40px)] max-w-[1280px] border-t border-[#dce5ef] py-8 md:w-[calc(100%-80px)]" aria-label={locale === 'en' ? 'CQI-9 equipment support' : 'CQI-9 设备配合'}>
        <Link className="inline-flex min-h-11 items-center gap-3 font-semibold text-[#3370ff] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" href={`/${locale}/products/detail/fastener-quench-temper-line/cqi-9`}>
          {locale === 'en' ? 'CQI-9 equipment support and purchasing checks' : 'CQI-9 设备配合与采购核对'}
          <HiArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </Link>
      </aside>
    )}
    {TECHNICAL_CONTENT_PUBLISHED && locale === 'en' && productBuyerGuide[slug] && <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}><BuyerSelectionGuide guideKey={productBuyerGuide[slug]} locale="en" /></div>}<EntryCaseEvidence entryPath={`/products/detail/${slug}`} locale={locale === 'en' ? 'en' : 'zh'} /></>;
}
