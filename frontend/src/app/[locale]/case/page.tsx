import { notFound } from 'next/navigation';
import { EnglishCaseIndex } from '@/components/case-studies/EnglishCasePages';
import { englishCaseHref, getEnglishCaseResults } from '@/lib/cases/english';
import { CaseIndexPage } from '@/components/case-studies/CaseIndexPage';
import { getCaseResults } from '@/lib/cases/server';
import { buildMetadata } from '@/lib/seo/metadata';
import { caseListHref, hasCaseSearch, parseCaseQuery, type SearchParams } from '@/lib/cases/query';
import { PUBLIC_ENGLISH_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';
import type { CaseQuery } from '@/lib/cases/types';

const englishCasesPublished = () => PUBLIC_ENGLISH_CASE_SLUGS.size > 0;

// Page numbers past the end are not found, in the metadata as well as in the page,
// so an unbounded ?page= cannot mint indexable empty pages. Filtered views keep
// answering, because they are already excluded from the index and may be empty.
function requireExistingPage(locale: 'zh' | 'en', query: CaseQuery) {
  if (hasCaseSearch(query) || query.page === 1) return;
  const { totalPages } = locale === 'en' ? getEnglishCaseResults(query) : getCaseResults(query);
  if (query.page > Math.max(1, totalPages)) notFound();
}

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };
export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!['zh', 'en'].includes(locale)) notFound();
  const query = parseCaseQuery(await searchParams);
  if (locale === 'en' && !englishCasesPublished()) notFound();
  requireExistingPage(locale === 'en' ? 'en' : 'zh', query);
  if (locale === 'en') return { ...buildMetadata({
    title: query.page > 1 ? `Case studies · Page ${query.page}` : 'Case studies',
    description: 'Compare industrial furnace proposals, workpieces, equipment configurations and project evidence from Suneng.',
    path: englishCaseHref(query), locale: 'en',
    alternateLocales: !hasCaseSearch(query) ? { 'zh-CN': `/zh/case${query.page > 1 ? `?page=${query.page}` : ''}`, 'en-US': englishCaseHref(query), 'x-default': `/zh/case${query.page > 1 ? `?page=${query.page}` : ''}` } : undefined,
  }), robots: { index: !hasCaseSearch(query), follow: true } };
  const metadata = buildMetadata({
    title: query.page > 1 ? `项目案例 · 第 ${query.page} 页` : '项目案例',
    description: '按工件、工艺和改造需求查找苏能工业炉项目，了解设备参数、方案记录与苏能参与范围。',
    path: caseListHref(query),
    pageKey: 'case',
    alternateLocales: { 'zh-CN': caseListHref(query), ...(!hasCaseSearch(query) && englishCasesPublished() ? { 'en-US': `/en/case${query.page > 1 ? `?page=${query.page}` : ''}` } : {}), 'x-default': caseListHref(query) },
  });
  return { ...metadata, robots: { index: !hasCaseSearch(query), follow: true } };
}
export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (locale === 'en') {
    if (!englishCasesPublished()) notFound();
    const query = parseCaseQuery(await searchParams);
    requireExistingPage('en', query);
    return <EnglishCaseIndex query={query} />;
  }
  if (locale !== 'zh') notFound();
  const query = parseCaseQuery(await searchParams);
  requireExistingPage('zh', query);
  return <CaseIndexPage query={query} />;
}
