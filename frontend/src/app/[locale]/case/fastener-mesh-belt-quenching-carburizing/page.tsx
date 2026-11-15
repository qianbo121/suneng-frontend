import { notFound } from 'next/navigation';
import { FastenerCase } from '@/components/case-studies/fastener-mesh-belt/FastenerCase';
import { FASTENER_CASE_SLUG, fastenerCasePublished, fastenerCaseVisible } from '@/lib/cases/fastener-case-entry';
import { caseSearchMetadata } from '@/lib/cases/search-metadata';
import { fastenerCaseSearchContent } from '@/lib/cases/fastener-case-search';

import { readAgreement } from '@/lib/cases/agreement/reader';
import { agreementSearchContent } from '@/lib/cases/agreement/search';
import { AgreementPage } from '@/components/agreement-cases/AgreementPage';

function englishAgreement() {
  return readAgreement('en', FASTENER_CASE_SLUG) ?? notFound();
}

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (locale === 'en') return caseSearchMetadata(agreementSearchContent(englishAgreement()), true);
  if (locale !== 'zh' || !fastenerCaseVisible()) notFound();
  return caseSearchMetadata(fastenerCaseSearchContent, fastenerCasePublished());
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale === 'en') return <AgreementPage data={englishAgreement()} />;
  if (locale !== 'zh' || !fastenerCaseVisible()) notFound();
  return <FastenerCase />;
}
