import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { getNewsListPageCount, NewsListRoute } from '@/components/news/NewsListRoute';
import { routing } from '@/i18n/routing';
import { getNewsDecisionCenterCards } from '@/lib/news-decision-center.server';
import { buildNewsListMetadata } from '@/lib/news-list-metadata';
import { NEWS_LIST_PRERENDER_MAX_PAGE } from '@/lib/news-list-prerender';

// Internal route behind /{locale}/news and /{locale}/news?page=N (see
// middleware). Readers get finished HTML from the page cache; it is refreshed
// in the background at most once a minute from the shared five-minute resource
// cache. Nothing is generated at build time, because the build has no backend.
export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type PrerenderedNewsListProps = {
  params: Promise<{
    locale: string;
    page: string;
  }>;
};

// Throws when the list cannot be read; see getNewsDecisionCenterCards. Pages
// past the end are not found, in the metadata as well as in the page.
async function resolvePage(params: PrerenderedNewsListProps['params']) {
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
      sort="recommended"
    />
  );
}
