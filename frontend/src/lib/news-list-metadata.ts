import type { Metadata } from 'next';

import { NEWS_LIST_HERO_IMAGE } from '@/constants/news';
import { getNewsListCanonicalPath, getNewsListPageTitle } from '@/lib/news-pagination';
import { buildMetadata, buildPageTitle } from '@/lib/seo/metadata';
import { NEWS_SEO } from '@/lib/seo/page-data';
import type { Locale } from '@/types/site';

// Shared by the on-demand list route and the prerendered plain list pages.
export const NEWS_LIST_SEO = {
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

export function buildNewsListMetadata(
  locale: Locale,
  currentPage: number,
  hasActiveFilters: boolean,
): Metadata {
  const seo = NEWS_LIST_SEO[locale];
  const pageQuery = !hasActiveFilters && currentPage > 1 ? `?page=${currentPage}` : '';
  const canonicalPath = hasActiveFilters
    ? `/${locale}/news`
    : getNewsListCanonicalPath(locale, currentPage);
  const title = hasActiveFilters
    ? seo.title
    : getNewsListPageTitle(seo.title, locale, currentPage);

  const metadata = buildMetadata({
    title,
    description: seo.description,
    path: canonicalPath,
    pageKey: 'news',
    locale,
    keywords: seo.keywords,
    image: locale === 'en' ? '/images/news/en-final-20260912/news-hero.webp' : NEWS_LIST_HERO_IMAGE,
    alternateLocales:
      currentPage === 1
        ? {
            'zh-CN': '/zh/news',
            'en-US': '/en/news',
            'x-default': '/zh/news',
          }
        : { [locale === 'en' ? 'en-US' : 'zh-CN']: `/${locale}/news${pageQuery}` },
  });

  if (hasActiveFilters) {
    return { ...metadata, robots: { index: false, follow: true } } satisfies Metadata;
  }

  return metadata;
}

// The browser updates document.title itself when it switches list pages.
export function getNewsListDocumentTitles(locale: Locale, pageCount: number) {
  const { title } = NEWS_LIST_SEO[locale];
  return {
    filteredTitle: buildPageTitle(title, locale),
    pageTitles: Array.from({ length: pageCount }, (_, index) =>
      buildPageTitle(getNewsListPageTitle(title, locale, index + 1), locale),
    ),
  };
}
