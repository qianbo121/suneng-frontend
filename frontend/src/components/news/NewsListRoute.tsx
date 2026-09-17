import { JsonLd } from '@/components/JsonLd';
import { NewsDecisionCenter } from '@/components/news/NewsDecisionCenter';
import { NEWS_PAGE_SIZE } from '@/constants/news';
import {
  filterAndSortNewsDecisionItems,
  NEWS_CENTER_FAQS,
  type NewsDecisionTopicId,
  type NewsFurnaceFilterId,
  type NewsSort,
} from '@/lib/news-decision-center';
import { toNewsListLiteCards } from '@/lib/news-list-client';
import { getNewsListDocumentTitles } from '@/lib/news-list-metadata';
import { newsUiText } from '@/lib/news-ui';
import { cleanObject, getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl } from '@/lib/seo/metadata';
import type { NewsListCardItem } from '@/types/news';
import type { Locale } from '@/types/site';

export function getNewsListPageCount(total: number) {
  return Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));
}

type NewsListRouteProps = {
  locale: Locale;
  sourceItems: NewsListCardItem[];
  error: string | null;
  page: number;
  query: string;
  topic: NewsDecisionTopicId;
  furnace: NewsFurnaceFilterId;
  sort: NewsSort;
};

// Body of /{locale}/news for both the on-demand route (search and filters)
// and the prerendered plain list pages.
export function NewsListRoute({
  locale,
  sourceItems,
  error,
  page,
  query,
  topic,
  furnace,
  sort,
}: NewsListRouteProps) {
  const filteredItems = filterAndSortNewsDecisionItems(sourceItems, { query, topic, furnace, sort });
  const currentPage = Math.min(page, getNewsListPageCount(filteredItems.length));
  const start = (currentPage - 1) * NEWS_PAGE_SIZE;
  const newsItems = filteredItems.slice(start, start + NEWS_PAGE_SIZE);
  const total = filteredItems.length;
  const interactive =
    !error && !query && sourceItems.length
      ? {
          cards: toNewsListLiteCards(sourceItems, locale),
          ...getNewsListDocumentTitles(locale, getNewsListPageCount(sourceItems.length)),
        }
      : undefined;
  const newsJsonLd = cleanObject([
    getBreadcrumbJsonLd([
      { name: locale === 'en' ? 'Home' : '首页', url: `/${locale}` },
      { name: locale === 'en' ? 'Resources' : '资料中心', url: `/${locale}/news` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: newsItems.map((item, index) => ({
        '@type': 'ListItem',
        position: (currentPage - 1) * NEWS_PAGE_SIZE + index + 1,
        name: item.title[locale],
        url: absoluteUrl(`/${locale}/news/${item.slug}`),
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: NEWS_CENTER_FAQS.map((item) => ({
        '@type': 'Question',
        name: newsUiText(locale, item.question),
        acceptedAnswer: {
          '@type': 'Answer',
          text: newsUiText(locale, item.answer),
        },
      })),
    },
  ]);

  return (
    <div>
      <JsonLd id={`news-list-jsonld-${locale}`} data={newsJsonLd} />
      <NewsDecisionCenter
        locale={locale}
        items={newsItems}
        sourceItems={sourceItems}
        sort={sort}
        error={error}
        page={currentPage}
        total={total}
        pageSize={NEWS_PAGE_SIZE}
        query={query}
        topic={topic}
        furnace={furnace}
        interactive={interactive}
      />
    </div>
  );
}
