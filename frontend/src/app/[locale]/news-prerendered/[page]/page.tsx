import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { getNewsListPageCount, NewsListRoute } from '@/components/news/NewsListRoute';
import { routing } from '@/i18n/routing';
import { DEFAULT_NEWS_SORT } from '@/lib/news-decision-center';
import { getNewsDecisionCenterCards } from '@/lib/news-decision-center.server';
import { buildNewsListMetadata } from '@/lib/news-list-metadata';
import { NEWS_LIST_PRERENDER_MAX_PAGE } from '@/lib/news-list-prerender';

// Keep the internal rewrite, but do not cache each numbered page independently:
// stale page snapshots otherwise overlap/skip articles when new content arrives.
// Only the complete collection is cached; all pages slice that shared snapshot.

type PrerenderedNewsListProps = {
  params: Promise<{
    locale: string;
    page: string;
  }>;
};

// Throws when the list cannot be read; see getNewsDecisionCenterCards. Pages
// past the end are not found, in the metadata as well as in the page.
async function resolvePage(params: PrerenderedNewsListProps['params']) {
  await connection();
  const { locale, page } = await params;
  if (!hasLocale(routing.locales, locale) || !/^[1-9]\d*$/.test(page)) notFound();
  const currentPage = Number(page);
  if (currentPage > NEWS_LIST_PRERENDER_MAX_PAGE) notFound();
  const cards = await getNewsDecisionCenterCards(locale);
  if (currentPage > getNewsListPageCount(cards.length)) notFound();
  return { locale, currentPage, cards };
}

export async function generateMetadata({ params }: PrerenderedNewsListProps) {
  const { locale, currentPage } = await resolvePage(params);
  return buildNewsListMetadata(locale, currentPage, false);
}

export default async function PrerenderedNewsListPage({ params }: PrerenderedNewsListProps) {
  const { locale, currentPage, cards } = await resolvePage(params);
  setRequestLocale(locale);

  return (
    <NewsListRoute
      locale={locale}
      sourceItems={cards}
      error={null}
      page={currentPage}
      query=""
      topic="all"
      furnace="all"
      sort={DEFAULT_NEWS_SORT}
    />
  );
}
