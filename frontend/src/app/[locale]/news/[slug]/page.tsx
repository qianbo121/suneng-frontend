import Image from 'next/image';
import { notFound } from 'next/navigation';
import { HiCalendarDays } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { NewsBreadcrumbBar } from '@/components/news/NewsBreadcrumbBar';
import { NewsArticleContent } from '@/components/news/NewsArticleContent';
import { NewsViewPing } from '@/components/news/NewsViewPing';
import {
  FALLBACK_NEWS_DETAIL,
  FALLBACK_NEWS_SLUGS,
  NEWS_DETAIL_LABEL,
  NEWS_LABEL,
} from '@/constants/news';
import {
  formatNewsDisplayDate,
  getNewsDetailPageData,
  normalizeNewsHtml,
  resolveNewsImage,
} from '@/lib/news';
import { getArticleJsonLd, getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { Locale } from '@/types/site';

type NewsDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

// ISR: render on demand for unknown slugs, then cache. View counting is
// decoupled (NewsViewPing), so caching the HTML does not suppress counts.
export const revalidate = 600;

export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const { article: apiArticle, error } = await getNewsDetailPageData(slug);
  const article = apiArticle || (FALLBACK_NEWS_SLUGS.has(slug) ? FALLBACK_NEWS_DETAIL : null);

  if (!article) {
    // Distinguish a genuinely-missing article (404) from an upstream API outage:
    // on error, throw so error.tsx renders per-request instead of caching a 404
    // for the whole revalidate window (an outage would otherwise 404 a real
    // article until the cache expires).
    if (error) {
      throw new Error(`Failed to load news article "${slug}": ${error}`);
    }
    notFound();
  }

  const title = currentLocale === 'en' ? article.titleEn || article.titleZh : article.titleZh;
  const rawDescription =
    currentLocale === 'en'
      ? article.summaryEn || article.summaryZh || article.contentEn || article.contentZh || ''
      : article.summaryZh || article.summaryEn || article.contentZh || article.contentEn || '';
  const description = rawDescription.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120) || title;
  const image = resolveNewsImage(article, { preferFallback: FALLBACK_NEWS_SLUGS.has(slug) });
  const keywords = currentLocale === 'en'
    ? article.seoKeywordsEn || article.seoKeywordsZh || ''
    : article.seoKeywordsZh || article.seoKeywordsEn || '';

  return buildMetadata({
    title,
    description,
    path: `/${currentLocale}/news/${slug}`,
    pageKey: 'news-detail',
    keywords: keywords ? keywords.split(/[，,、;；\n\r]+/) : undefined,
    image,
    type: 'article',
    publishedTime: article.publishDate,
    modifiedTime: article.publishDate,
    alternateLocales: {
      'zh-CN': `/zh/news/${slug}`,
      'en-US': `/en/news/${slug}`,
      'x-default': `/zh/news/${slug}`,
    },
  });
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const { article: apiArticle, error } = await getNewsDetailPageData(slug);
  const article = apiArticle || (FALLBACK_NEWS_SLUGS.has(slug) ? FALLBACK_NEWS_DETAIL : null);

  if (!article) {
    // Distinguish a genuinely-missing article (404) from an upstream API outage:
    // on error, throw so error.tsx renders per-request instead of caching a 404
    // for the whole revalidate window (an outage would otherwise 404 a real
    // article until the cache expires).
    if (error) {
      throw new Error(`Failed to load news article "${slug}": ${error}`);
    }
    notFound();
  }

  const title = currentLocale === 'en' ? article.titleEn || article.titleZh : article.titleZh;
  const summary =
    currentLocale === 'en'
      ? article.summaryEn || article.summaryZh || ''
      : article.summaryZh || article.summaryEn || '';
  const image = resolveNewsImage(article, { preferFallback: FALLBACK_NEWS_SLUGS.has(slug) });
  const html = normalizeNewsHtml(currentLocale, article);
  const newsLabel = NEWS_LABEL[currentLocale];
  const detailLabel = NEWS_DETAIL_LABEL[currentLocale];

  return (
    <div className="bg-[#f7f7f7]">
      <NewsViewPing newsId={apiArticle?.id} />
      <JsonLd
        id={`news-detail-jsonld-${slug}`}
        data={[
          getArticleJsonLd({
            slug,
            path: `/${currentLocale}/news/${slug}`,
            headline: title,
            description: summary || title,
            image,
            datePublished: article.publishDate,
            dateModified: article.publishDate,
          }),
          getBreadcrumbJsonLd([
            { name: '首页', url: `/${currentLocale}` },
            { name: newsLabel, url: `/${currentLocale}/news` },
            { name: title, url: `/${currentLocale}/news/${slug}` },
          ]),
        ]}
      />

      <NewsBreadcrumbBar
        locale={locale}
        currentLabel={detailLabel}
        items={[
          { label: newsLabel, href: `/${locale}/news` },
          { label: detailLabel },
        ]}
      />

      <main className="bg-[#f8f8f8] px-6 py-[38px] lg:py-[48px]">
        <article className="mx-auto max-w-[1240px] rounded-[4px] border border-[#e3e3e3] bg-white px-6 py-[50px] shadow-[0_8px_28px_rgba(0,0,0,0.03)] md:px-[72px] lg:px-[86px] lg:py-[62px]">
          <header className="text-center">
            <h1 className="text-[28px] font-semibold leading-[1.45] text-[#202020] lg:text-[34px]">
              {title}
            </h1>
            <div className="mt-[22px] flex items-center justify-center gap-2 text-[15px] text-[#888888]">
              <HiCalendarDays className="h-[18px] w-[18px] text-[#8f969d]" />
              <span>{formatNewsDisplayDate(article.publishDate)}</span>
            </div>
          </header>

          <div className="mx-auto mt-[40px] max-w-[1060px] overflow-hidden rounded-[2px] bg-[#f1f1f1]">
            <Image
              src={image}
              alt={title}
              width={1672}
              height={941}
              priority
              quality={85}
              sizes="(min-width: 1200px) 1060px, 100vw"
              className="h-auto w-full"
            />
          </div>

          <div className="mx-auto mt-[46px] max-w-[1060px]">
            <NewsArticleContent html={html} />
          </div>
        </article>
      </main>
    </div>
  );
}
