import { EnglishCaseArticle, englishCaseMetadata } from '@/components/case-studies/EnglishCasePages';
import { notFound } from 'next/navigation';
import { CaseArticlePage, caseArticleMetadata } from '@/components/case-studies/CaseArticlePage';
import { getPublicCases } from '@/lib/cases/server';
import { getEnglishCases } from '@/lib/cases/english';
import { readAgreement } from '@/lib/cases/agreement/reader';
import { agreementSearchContent } from '@/lib/cases/agreement/search';
import { AgreementPage } from '@/components/agreement-cases/AgreementPage';
import { caseSearchMetadata } from '@/lib/cases/search-metadata';
import type { SearchParams } from '@/lib/cases/query';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
};
export function generateStaticParams() {
  return [
    ...getPublicCases().map((item) => ({ locale: 'zh', slug: item.slug })),
    ...getEnglishCases().map((item) => ({ locale: 'en', slug: item.slug })),
  ];
}
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const agreement = readAgreement(locale, slug);
  if (agreement) return caseSearchMetadata(agreementSearchContent(agreement), true);
  if (locale === 'en') return englishCaseMetadata(slug);
  if (locale !== 'zh') notFound();
  return caseArticleMetadata(slug);
}
export default async function Page({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const agreement = readAgreement(locale, slug);
  if (agreement) return <AgreementPage data={agreement} />;
  if (locale === 'en') return <EnglishCaseArticle slug={slug} searchParams={await searchParams} />;
  if (locale !== 'zh') notFound();
  return <CaseArticlePage slug={slug} searchParams={await searchParams} />;
}
