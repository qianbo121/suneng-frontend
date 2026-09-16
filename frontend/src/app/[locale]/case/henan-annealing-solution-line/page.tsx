import { EnglishCaseArticle, englishCaseMetadata } from '@/components/case-studies/EnglishCasePages';
import { notFound } from 'next/navigation';
import { CaseArticlePage, caseArticleMetadata } from '@/components/case-studies/CaseArticlePage';
import type { SearchParams } from '@/lib/cases/query';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };
const slug = 'henan-annealing-solution-line';
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (locale === 'en') return englishCaseMetadata(slug);
  if (locale !== 'zh') notFound();
  return caseArticleMetadata(slug);
}
export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (locale === 'en') return <EnglishCaseArticle slug={slug} searchParams={await searchParams} />;
  if (locale !== 'zh') notFound();
  return <CaseArticlePage slug={slug} searchParams={await searchParams} />;
}
