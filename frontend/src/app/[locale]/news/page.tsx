import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/JsonLd';
import { NewsDecisionCenter } from '@/components/news/NewsDecisionCenter';
import { NEWS_LIST_HERO_IMAGE, NEWS_PAGE_SIZE } from '@/constants/news';
import { getNewsDecisionCenterData } from '@/lib/news-decision-center.server';
import {
  filterAndSortNewsDecisionItems,
  NEWS_CENTER_FAQS,
  normalizeNewsDecisionTopic,
  normalizeNewsFurnaceFilter,
  normalizeNewsSort,
} from '@/lib/news-decision-center';
import {
  getNewsListCanonicalPath,
  getNewsListPageTitle,
  normalizeNewsPage,
} from '@/lib/news-pagination';
import { cleanObject, getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { NEWS_SEO } from '@/lib/seo/page-data';
import { Locale } from '@/types/site';
import { newsUiText } from '@/lib/news-ui';

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

const newsSeoCopy = {
  zh: NEWS_SEO,
  en: {
    title: 'Resources | Furnace Selection, Quote Parameters & Heat-Treatment Notes — Suneng',
    description:
      'Furnace selection guides, quote-parameter checklists, retrofit resources and company updates from Suneng Industrial Furnace.',
    keywords: [
      'industrial furnace resources',
      'furnace selection',
      'heat treatment quote parameters',
      'furnace retrofit',
    ],
  },
} satisfies Record<
  Locale,
  {
    title: string;
    description: string;
    keywords: string[];
  }
>;

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
  const seo = newsSeoCopy[currentLocale];
  const hasActiveFilters = Boolean(q?.trim() || topic || furnace || sort);
  if (!hasActiveFilters && currentPage > 1) {
    const { data } = await getNewsDecisionCenterData(currentLocale);
    if (data && currentPage > Math.max(1, Math.ceil(data.length / NEWS_PAGE_SIZE))) {
      notFound();
    }
  }
  const pageQuery = !hasActiveFilters && currentPage > 1 ? `?page=${currentPage}` : '';
  const canonicalPath = hasActiveFilters
    ? `/${currentLocale}/news`
    : getNewsListCanonicalPath(currentLocale, currentPage);
  const title = hasActiveFilters
    ? seo.title
    : getNewsListPageTitle(seo.title, currentLocale, currentPage);

  const metadata = buildMetadata({
    title,
    description: seo.description,
    path: canonicalPath,
    pageKey: 'news',
    locale: currentLocale,
    keywords: seo.keywords,
    image:
      currentLocale === 'en'
        ? '/images/news/en-final-20260912/news-hero.webp'
        : NEWS_LIST_HERO_IMAGE,
    alternateLocales:
      currentPage === 1
        ? {
            'zh-CN': '/zh/news',
            'en-US': '/en/news',
            'x-default': '/zh/news',
          }
        : { [currentLocale === 'en' ? 'en-US' : 'zh-CN']: `/${currentLocale}/news${pageQuery}` },
  });

  if (hasActiveFilters) {
    return { ...metadata, robots: { index: false, follow: true } } satisfies Metadata;
  }

  return metadata;
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params;
  const { page, q, topic: topicParam, furnace: furnaceParam, sort: sortParam } = await searchParams;
  validatePageNumber(page);
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  let currentPage = normalizeNewsPage(page);

  const { data, error } = await getNewsDecisionCenterData(currentLocale);
  const sourceItems = data || [];
  const sort = normalizeNewsSort(sortParam);
  const query = q?.trim() || '';
  const topic = normalizeNewsDecisionTopic(topicParam);
  const furnace = normalizeNewsFurnaceFilter(furnaceParam);
  const filteredItems = filterAndSortNewsDecisionItems(sourceItems, {
    query,
    topic,
    furnace,
    sort,
  });
  const hasActiveFilters = Boolean(query || topicParam || furnaceParam || sortParam);
  if (
    data &&
    !hasActiveFilters &&
    currentPage > Math.max(1, Math.ceil(filteredItems.length / NEWS_PAGE_SIZE))
  ) {
    notFound();
  }
  currentPage = Math.min(
    currentPage,
    Math.max(1, Math.ceil(filteredItems.length / NEWS_PAGE_SIZE)),
  );
  const start = (currentPage - 1) * NEWS_PAGE_SIZE;
  const newsItems = filteredItems.slice(start, start + NEWS_PAGE_SIZE);
  const total = filteredItems.length;
  const newsJsonLd = cleanObject([
    getBreadcrumbJsonLd([
      { name: currentLocale === 'en' ? 'Home' : '首页', url: `/${currentLocale}` },
      { name: currentLocale === 'en' ? 'Resources' : '资料中心', url: `/${currentLocale}/news` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: newsItems.map((item, index) => ({
        '@type': 'ListItem',
        position: (currentPage - 1) * NEWS_PAGE_SIZE + index + 1,
        name: item.title[currentLocale],
        url: absoluteUrl(`/${currentLocale}/news/${item.slug}`),
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: NEWS_CENTER_FAQS.map((item) => ({
        '@type': 'Question',
        name: newsUiText(currentLocale, item.question),
        acceptedAnswer: {
          '@type': 'Answer',
          text: newsUiText(currentLocale, item.answer),
        },
      })),
    },
  ]);

  return (
    <div>
      <JsonLd id={`news-list-jsonld-${currentLocale}`} data={newsJsonLd} />
      <NewsDecisionCenter
        locale={currentLocale}
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
      />
    </div>
  );
}
