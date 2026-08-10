import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { HiCalendarDays } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { QuoteModalButton } from '@/components/lead/QuoteModalButton';
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
import { getNewsContentModifiedTime } from '@/lib/news-dates';
import { getArticleJsonLd, getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getCanonicalNewsSlug, hasPublishableEnglishNews } from '@/lib/news-routing';
import { getNewsRelatedLinks } from '@/lib/news-related';
import { Locale } from '@/types/site';

type NewsDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

// News can be taken offline by the isolated Shuju publishing service.  Detail
// pages therefore render dynamically so an offline item cannot remain publicly
// reachable through a stale full-route cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const canonicalSlug = getCanonicalNewsSlug(slug);

  if (canonicalSlug !== slug) {
    permanentRedirect(`/${currentLocale}/news/${canonicalSlug}`);
  }

  const { article: apiArticle, error } = await getNewsDetailPageData(slug);
  const article = apiArticle || (
    currentLocale === 'zh' && FALLBACK_NEWS_SLUGS.has(slug) ? FALLBACK_NEWS_DETAIL : null
  );

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

  if (currentLocale === 'en' && !hasPublishableEnglishNews(article)) {
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
  const modifiedTime = getNewsContentModifiedTime(article);

  return buildMetadata({
    title,
    description,
    path: `/${currentLocale}/news/${slug}`,
    pageKey: 'news-detail',
    locale: currentLocale,
    keywords: keywords ? keywords.split(/[，,、;；\n\r]+/) : undefined,
    image,
    type: 'article',
    publishedTime: article.publishDate,
    modifiedTime,
    alternateLocales: hasPublishableEnglishNews(article)
      ? {
          'zh-CN': `/zh/news/${slug}`,
          'en-US': `/en/news/${slug}`,
          'x-default': `/zh/news/${slug}`,
        }
      : {
          'zh-CN': `/zh/news/${slug}`,
          'x-default': `/zh/news/${slug}`,
        },
  });
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const canonicalSlug = getCanonicalNewsSlug(slug);

  if (canonicalSlug !== slug) {
    permanentRedirect(`/${currentLocale}/news/${canonicalSlug}`);
  }

  const { article: apiArticle, error } = await getNewsDetailPageData(slug);
  const article = apiArticle || (
    currentLocale === 'zh' && FALLBACK_NEWS_SLUGS.has(slug) ? FALLBACK_NEWS_DETAIL : null
  );

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

  if (currentLocale === 'en' && !hasPublishableEnglishNews(article)) {
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
  const contactHref = '/zh/contact';
  const modifiedTime = getNewsContentModifiedTime(article);
  const relatedLinks = currentLocale === 'zh' ? getNewsRelatedLinks(article) : [];

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
            dateModified: modifiedTime || article.publishDate,
          }, currentLocale),
          getBreadcrumbJsonLd([
            { name: currentLocale === 'en' ? 'Home' : '首页', url: `/${currentLocale}` },
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

          {relatedLinks.length ? (
            <aside
              aria-labelledby="news-related-links-title"
              className="mx-auto mt-[48px] max-w-[1060px] border-t border-[#e4e7ec] pt-8"
            >
              <h2 id="news-related-links-title" className="text-[22px] font-semibold text-[#101828]">
                相关产品、方案与项目证据
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-[6px] border border-[#dce3ec] bg-[#fbfcfe] p-5 transition hover:border-[#c51624] hover:bg-white"
                  >
                    <span className="text-[12px] font-semibold">{link.kind}</span>
                    <h3 className="mt-2 text-[17px] font-semibold leading-[1.45] text-[#101828]">{link.title}</h3>
                    <p className="mt-2 text-[14px] leading-[1.75] text-[#667085]">{link.description}</p>
                  </Link>
                ))}
              </div>
            </aside>
          ) : null}

          {currentLocale === 'zh' ? (
            <div className="mx-auto mt-[48px] max-w-[1060px] rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
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
        </article>
      </main>
    </div>
  );
}
