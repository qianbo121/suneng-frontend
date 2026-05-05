import { JsonLd } from '@/components/JsonLd';
import { PageBanner } from '@/components/layout/PageBanner';
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

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: NewsPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return buildMetadata({
    title: NEWS_SEO.title,
    description: NEWS_SEO.description,
    path: `/${currentLocale}/news`,
    keywords: NEWS_SEO.keywords,
    image: NEWS_LIST_HERO_IMAGE,
    alternateLocales: {
      'zh-CN': '/zh/news',
      'en-US': '/en/news',
      'x-default': '/zh/news',
    },
  });
}

function normalizePage(value?: string) {
  const page = Number(value);

  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const currentPage = normalizePage(page);

  const { list } = await getNewsListPageData(currentLocale, {
    page: currentPage,
    pageSize: NEWS_PAGE_SIZE,
  });

  const newsItems = list?.items?.length
    ? list.items.map((item) => mapNewsCard(currentLocale, item))
    : FALLBACK_NEWS_ITEMS;
  const total = list?.total ?? FALLBACK_NEWS_ITEMS.length;
  const title = NEWS_LABEL[currentLocale];
  const subtitle = NEWS_SUBTITLE[currentLocale];
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
        position: index + 1,
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
        variant="about"
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
        </div>
      </main>
    </div>
  );
}
