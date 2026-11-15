import { EnglishCaseArticle, englishCaseMetadata } from '@/components/case-studies/EnglishCasePages';
import { notFound } from 'next/navigation';
import { CaseArticlePage, caseArticleMetadata } from '@/components/case-studies/CaseArticlePage';
import type { SearchParams } from '@/lib/cases/query';

import './strip-case.css';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };
const slug = 'stainless-strip-annealing-supply-scope';
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (locale === 'en') return englishCaseMetadata(slug);
  if (locale !== 'zh') notFound();
  return caseArticleMetadata(slug);
}
export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'zh') notFound();
  const Article = locale === 'en' ? EnglishCaseArticle : CaseArticlePage;
  return <div className="strip-case"><Article slug={slug} searchParams={await searchParams} /></div>;
}
