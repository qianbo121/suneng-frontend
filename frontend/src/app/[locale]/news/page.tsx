import { notFound } from 'next/navigation';

import { getNewsListPageCount, NewsListRoute } from '@/components/news/NewsListRoute';
import { NEWS_PAGE_SIZE } from '@/constants/news';
import { getNewsDecisionCenterData } from '@/lib/news-decision-center.server';
import {
  normalizeNewsDecisionTopic,
  normalizeNewsFurnaceFilter,
  normalizeNewsSort,
} from '@/lib/news-decision-center';
import { buildNewsListMetadata } from '@/lib/news-list-metadata';
import { normalizeNewsPage } from '@/lib/news-pagination';
import { Locale } from '@/types/site';

// Plain list URLs (/zh/news, /zh/news?page=N) are rewritten by middleware to
// the prerendered route in ../news-prerendered. This on-demand route answers
// search and filter URLs, plus any page number the prerendered route refuses.
type NewsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    q?: string;
    topic?: string;
    furnace?: string;
  }>;
};

function validatePageNumber(page: string | undefined) {
  if (page !== undefined && (!/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page)))) {
    notFound();
  }
}

export async function generateMetadata({ params, searchParams }: NewsPageProps) {
  const { locale } = await params;
  const { page, q, topic, furnace, sort } = await searchParams;
  validatePageNumber(page);
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const currentPage = normalizeNewsPage(page);
  const hasActiveFilters = Boolean(q?.trim() || topic || furnace || sort);
  if (!hasActiveFilters && currentPage > 1) {
    const { data } = await getNewsDecisionCenterData(currentLocale);
    if (data && currentPage > Math.max(1, Math.ceil(data.length / NEWS_PAGE_SIZE))) {
      notFound();
    }
  }
  return buildNewsListMetadata(currentLocale, currentPage, hasActiveFilters);
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params;
  const { page, q, topic: topicParam, furnace: furnaceParam, sort: sortParam } = await searchParams;
  validatePageNumber(page);
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const currentPage = normalizeNewsPage(page);

  const { data, error } = await getNewsDecisionCenterData(currentLocale);
  const sourceItems = data || [];
  const sort = normalizeNewsSort(sortParam);
  const query = q?.trim() || '';
  const topic = normalizeNewsDecisionTopic(topicParam);
  const furnace = normalizeNewsFurnaceFilter(furnaceParam);
  const hasActiveFilters = Boolean(query || topicParam || furnaceParam || sortParam);
  if (data && !hasActiveFilters && currentPage > getNewsListPageCount(sourceItems.length)) {
    notFound();
  }

  return (
    <NewsListRoute
      locale={currentLocale}
      sourceItems={sourceItems}
      error={error}
      page={currentPage}
      query={query}
      topic={topic}
      furnace={furnace}
      sort={sort}
    />
  );
}
