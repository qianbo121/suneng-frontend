import { notFound } from 'next/navigation';
import { EnglishCaseIndex } from '@/components/case-studies/EnglishCasePages';
import { englishCaseHref } from '@/lib/cases/english';
import { CaseIndexPage } from '@/components/case-studies/CaseIndexPage';
import { buildMetadata } from '@/lib/seo/metadata';
import { caseListHref, hasCaseSearch, parseCaseQuery, type SearchParams } from '@/lib/cases/query';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };
export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!['zh', 'en'].includes(locale)) notFound();
  const query = parseCaseQuery(await searchParams);
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
    alternateLocales: { 'zh-CN': caseListHref(query), ...(!hasCaseSearch(query) ? { 'en-US': `/en/case${query.page > 1 ? `?page=${query.page}` : ''}` } : {}), 'x-default': caseListHref(query) },
  });
  return { ...metadata, robots: { index: !hasCaseSearch(query), follow: true } };
}
export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (locale === 'en') return <EnglishCaseIndex query={parseCaseQuery(await searchParams)} />;
  if (locale !== 'zh') notFound();
  return <CaseIndexPage query={parseCaseQuery(await searchParams)} />;
}
