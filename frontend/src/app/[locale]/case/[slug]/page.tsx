import { EnglishCaseArticle, englishCaseMetadata, englishCaseReturn } from '@/components/case-studies/EnglishCasePages';
import { notFound } from 'next/navigation';
import { CaseArticlePage, caseArticleMetadata } from '@/components/case-studies/CaseArticlePage';
import { getPublicCases } from '@/lib/cases/server';
import { getEnglishCases } from '@/lib/cases/english';
import { readAgreement } from '@/lib/cases/agreement/reader';
import { agreementSearchContent } from '@/lib/cases/agreement/search';
import { AgreementPage } from '@/components/agreement-cases/AgreementPage';
import { caseSearchMetadata } from '@/lib/cases/search-metadata';
import { safeCaseReturn, type SearchParams } from '@/lib/cases/query';
import { ForkReview } from '@/components/fork-case-review/ForkReview';
import { isForkReview } from '@/components/fork-case-review/review-source';

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
  if (isForkReview(locale, slug)) return locale === 'en' ? englishCaseMetadata(slug) : caseArticleMetadata(slug);
  const agreement = readAgreement(locale, slug);
  if (agreement) return caseSearchMetadata(agreementSearchContent(agreement), true);
  if (locale === 'en') return englishCaseMetadata(slug);
  if (locale !== 'zh') notFound();
  return caseArticleMetadata(slug);
}
export default async function Page({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  if (isForkReview(locale, slug)) {
    const target = (await searchParams).returnTo;
    const returnHref = locale === 'en' ? englishCaseReturn(target) : safeCaseReturn(target);
    return <ForkReview key={slug} slug={slug} locale={locale === 'en' ? 'en' : 'zh'} returnHref={returnHref} />;
  }
  const agreement = readAgreement(locale, slug);
  if (agreement) return <AgreementPage data={agreement} />;
  if (locale === 'en') return <EnglishCaseArticle slug={slug} searchParams={await searchParams} />;
  if (locale !== 'zh') notFound();
  return <CaseArticlePage slug={slug} searchParams={await searchParams} />;
}
