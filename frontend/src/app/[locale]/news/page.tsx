import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/JsonLd';
import { PageBanner } from '@/components/layout/PageBanner';
import { QuoteModalButton } from '@/components/lead/QuoteModalButton';
import { NewsBreadcrumbBar } from '@/components/news/NewsBreadcrumbBar';
import { NewsListCards } from '@/components/news/NewsListCards';
import {
  FALLBACK_NEWS_ITEMS,
  NEWS_LABEL,
  NEWS_LIST_HERO_IMAGE,
  NEWS_PAGE_SIZE,
  NEWS_SUBTITLE,
} from '@/constants/news';
import { getNewsListPageData, mapNewsCard } from '@/lib/news';
import {
  getNewsListCanonicalPath,
  getNewsListPageTitle,
  normalizeNewsPage,
} from '@/lib/news-pagination';
import { cleanObject, getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { NEWS_SEO } from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

type NewsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
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
} satisfies Record<Locale, {
  title: string;
  description: string;
  keywords: string[];
}>;

export async function generateMetadata({ params, searchParams }: NewsPageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const currentPage = normalizeNewsPage(page);
  const seo = newsSeoCopy[currentLocale];
  const pageQuery = currentPage > 1 ? `?page=${currentPage}` : '';
  const canonicalPath = getNewsListCanonicalPath(currentLocale, currentPage);
  const title = getNewsListPageTitle(seo.title, currentLocale, currentPage);

  const metadata = buildMetadata({
    title,
    description: seo.description,
    path: canonicalPath,
    pageKey: 'news',
    keywords: seo.keywords,
    image: NEWS_LIST_HERO_IMAGE,
    alternateLocales: currentLocale === 'zh'
      ? {
          'zh-CN': `/zh/news${pageQuery}`,
          'x-default': `/zh/news${pageQuery}`,
        }
      : undefined,
  });

  if (currentLocale === 'en') {
    return { ...metadata, robots: { index: false, follow: false } } satisfies Metadata;
  }

  return metadata;
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const currentPage = normalizeNewsPage(page);

  if (currentLocale === 'en') {
    notFound();
  }

  const { list } = await getNewsListPageData(currentLocale, {
    page: currentPage,
    pageSize: NEWS_PAGE_SIZE,
  });

  const newsItems = list?.items?.length
    ? list.items.map((item) => mapNewsCard(currentLocale, item))
    : currentPage === 1
      ? FALLBACK_NEWS_ITEMS
      : [];
  const total = list ? list.total : FALLBACK_NEWS_ITEMS.length;
  const title = NEWS_LABEL[currentLocale];
  const subtitle = NEWS_SUBTITLE[currentLocale];
  const contactHref = '/zh/contact';
  const newsJsonLd = cleanObject([
    getBreadcrumbJsonLd([
      { name: '首页', url: `/${currentLocale}` },
      { name: title, url: `/${currentLocale}/news` },
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
  ]);

  return (
    <div className="bg-[#f7f8fa]">
      <JsonLd id={`news-list-jsonld-${currentLocale}`} data={newsJsonLd} />
      <PageBanner
        locale={locale}
        title={title}
        englishTitle={NEWS_LABEL.en}
        subtitle={subtitle}
        backgroundImage={NEWS_LIST_HERO_IMAGE}
        variant="compact"
      />

      <NewsBreadcrumbBar locale={locale} currentLabel={title} />

      <main className="mx-auto max-w-[1660px] px-6 py-10 lg:px-[86px] lg:py-12">
        <div className="mx-auto w-full max-w-[1120px]">
          <NewsListCards
            locale={currentLocale}
            items={newsItems}
            page={currentPage}
            total={total}
            pageSize={NEWS_PAGE_SIZE}
          />
          {currentLocale === 'zh' ? (
            <div className="mt-10 rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)] lg:flex lg:items-center lg:justify-between lg:gap-8">
              <div>
                <h2 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">需要工业炉报价或方案判断？</h2>
                <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">
                  可先提交工件、温度、工艺和产能信息，由苏能工程师做初步判断。
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
                <QuoteModalButton
                  label="获取报价方案"
                  className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] cta-primary px-6 text-[15px] font-semibold text-white transition"
                />
                <a
                  href={contactHref}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] cta-secondary px-6 text-[15px] font-semibold transition"
                >
                  联系苏能工程师
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
