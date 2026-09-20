import { getNewsSummary } from '@/lib/news-summary';
import { getNewsSeoTitle } from '@/lib/news-seo-title';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { HiCalendarDays } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { NewsBreadcrumbBar } from '@/components/news/NewsBreadcrumbBar';
import { NewsArticleContent } from '@/components/news/NewsArticleContent';
import { NewsContinueReading } from '@/components/news/NewsContinueReading';
import { NewsViewPing } from '@/components/news/NewsViewPing';
import {
  FALLBACK_NEWS_DETAIL,
  FALLBACK_NEWS_ITEMS,
  FALLBACK_NEWS_SLUGS,
  NEWS_DETAIL_LABEL,
  NEWS_LABEL,
} from '@/constants/news';
import { getNewsList } from '@/lib/api/news';
import { getNewsDecisionDisplayMeta } from '@/lib/news-decision-center';
import { selectNewsContinueReadingItems } from '@/lib/news-continue-reading';
import {
  formatNewsDisplayDate,
  getNewsDetailPageData,
  mapNewsCard,
  normalizeNewsHtml,
  resolveNewsImage,
} from '@/lib/news';
import { getNewsContentModifiedTime } from '@/lib/news-dates';
import { getArticleJsonLd, getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  getCanonicalNewsSlug,
  getPublicNewsRedirectSlug,
  hasPublishableEnglishNews,
} from '@/lib/news-routing';
import { getNewsRelatedLinks } from '@/lib/news-related';
import { Locale } from '@/types/site';

import styles from './NewsDetailPage.module.css';

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
  const lookupSlug = getCanonicalNewsSlug(slug);

  const { article: apiArticle, error } = await getNewsDetailPageData(lookupSlug);
  const article =
    apiArticle ||
    (currentLocale === 'zh' && FALLBACK_NEWS_SLUGS.has(lookupSlug) ? FALLBACK_NEWS_DETAIL : null);

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

  const redirectSlug = getPublicNewsRedirectSlug(slug, article);
  if (redirectSlug) {
    permanentRedirect(`/${currentLocale}/news/${redirectSlug}`);
  }

  if (currentLocale === 'en' && !hasPublishableEnglishNews(article)) {
    notFound();
  }

  const title = await getNewsSeoTitle(currentLocale, article);
  const summary = getNewsSummary(currentLocale, article, true);
  // English summaries include material and acceptance limits; keep the complete
  // sentence so metadata does not cut off a word or its qualifying condition.
  const description = currentLocale === 'en' ? summary : summary.slice(0, 120);
  const image = resolveNewsImage(article, {
    preferFallback: FALLBACK_NEWS_SLUGS.has(slug),
    locale: currentLocale,
  });
  const keywords =
    currentLocale === 'en'
      ? article.seoKeywordsEn || ''
      : article.seoKeywordsZh || article.seoKeywordsEn || '';
  const modifiedTime = getNewsContentModifiedTime(article, currentLocale);

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
    alternateLocales: {
      'zh-CN': `/zh/news/${slug}`,
      ...(hasPublishableEnglishNews(article) ? { 'en-US': `/en/news/${slug}` } : {}),
      'x-default': `/zh/news/${slug}`,
    },
  });
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const lookupSlug = getCanonicalNewsSlug(slug);

  const { article: apiArticle, error } = await getNewsDetailPageData(lookupSlug);
  const article =
    apiArticle ||
    (currentLocale === 'zh' && FALLBACK_NEWS_SLUGS.has(lookupSlug) ? FALLBACK_NEWS_DETAIL : null);

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

  const redirectSlug = getPublicNewsRedirectSlug(slug, article);
  if (redirectSlug) {
    permanentRedirect(`/${currentLocale}/news/${redirectSlug}`);
  }

  if (currentLocale === 'en' && !hasPublishableEnglishNews(article)) {
    notFound();
  }

  const title = currentLocale === 'en' ? article.titleEn || article.titleZh : article.titleZh;
  const summary = getNewsSummary(currentLocale, article);
  const image = resolveNewsImage(article, {
    preferFallback: FALLBACK_NEWS_SLUGS.has(slug),
    locale: currentLocale,
  });
  const html = normalizeNewsHtml(currentLocale, article, { coverImage: image });
  const newsLabel = NEWS_LABEL[currentLocale];
  const detailLabel = NEWS_DETAIL_LABEL[currentLocale];
  const modifiedTime = getNewsContentModifiedTime(article, currentLocale);
  const relatedLinks = getNewsRelatedLinks(article, currentLocale);
  const decisionMeta = getNewsDecisionDisplayMeta(mapNewsCard('zh', article));
  const detailTags =
    currentLocale === 'zh'
      ? [decisionMeta.furnaceLabel, decisionMeta.topicLabel]
      : [article.category?.nameEn?.trim() || NEWS_LABEL.en];
  const newsListResult = await getNewsList({ page: 1, pageSize: 12 });
  const recommendationCandidates =
    newsListResult.data?.items
      .filter((item) => currentLocale === 'zh' || hasPublishableEnglishNews(item))
      .map((item) => ({
        id: item.id,
        slug: item.slug,
        title: currentLocale === 'en' ? item.titleEn?.trim() || item.titleZh : item.titleZh,
        categoryId: item.categoryId,
      })) ??
    (!apiArticle && currentLocale === 'zh'
      ? FALLBACK_NEWS_ITEMS.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.title.zh,
          categoryId: FALLBACK_NEWS_DETAIL.categoryId,
        }))
      : []);
  const continueReadingItems = selectNewsContinueReadingItems(
    { id: article.id, slug: article.slug, categoryId: article.categoryId },
    recommendationCandidates,
  );

  return (
    <div className="bg-[#f7f7f7]">
      <NewsViewPing newsId={apiArticle?.id} />
      <JsonLd
        id={`news-detail-jsonld-${slug}`}
        data={[
          getArticleJsonLd(
            {
              slug,
              path: `/${currentLocale}/news/${slug}`,
              headline: title,
              description: summary || title,
              image,
              datePublished: article.publishDate,
              dateModified: modifiedTime || article.publishDate,
            },
            currentLocale,
          ),
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
        items={[{ label: newsLabel, href: `/${locale}/news` }, { label: detailLabel }]}
      />

      <main className={styles.main}>
        <article className={styles.article}>
          <section className={styles.heroCard} aria-labelledby="news-detail-title">
            <header className={styles.heroCopy}>
              <h1 id="news-detail-title" className={styles.title}>
                {title}
              </h1>
              {currentLocale === 'en' ? (
                <div className={styles.englishMeta}>
                  <p>Author: Jiangsu Suneng Industrial Furnace Engineering Team</p>
                  <div className={styles.tags} aria-label="Categories">
                    {detailTags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.englishDates}>
                    <span>
                      Published:{' '}
                      <time dateTime={article.publishDate}>
                        {formatNewsDisplayDate(article.publishDate)}
                      </time>
                    </span>
                    {article.englishSourceDate && (
                      <span>
                        {article.englishSourceDate.label}:{' '}
                        <time dateTime={article.englishSourceDate.date}>
                          {formatNewsDisplayDate(article.englishSourceDate.date)}
                        </time>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.englishMeta}>
                  <p>作者：江苏苏能工业炉工程技术团队</p>
                  <div className={styles.tags} aria-label="资料分类">
                    {detailTags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.englishDates}>
                    <span className={styles.meta}>
                      <HiCalendarDays className={styles.dateIcon} aria-hidden="true" />
                      发布日期：
                      <time dateTime={article.publishDate}>
                        {formatNewsDisplayDate(article.publishDate)}
                      </time>
                    </span>
                  </div>
                </div>
              )}
            </header>
          </section>

          <div className={styles.bodyWrap} data-news-slug={slug}>
            <NewsArticleContent html={html} />
          </div>

          <div className={styles.supporting}>
            <NewsContinueReading items={continueReadingItems} locale={currentLocale} />

            {relatedLinks.length ? (
              <aside aria-labelledby="news-related-links-title" className={styles.related}>
                <h2 id="news-related-links-title" className={styles.relatedTitle}>
                  {currentLocale === 'en' ? 'Related equipment and project guidance' : '相关产品、方案与项目证据'}
                </h2>
                <div className={styles.relatedGrid}>
                  {relatedLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={styles.relatedLink}>
                      <h3 className={styles.relatedLinkTitle}>{link.title}</h3>
                      <p className={styles.relatedLinkDescription}>{link.description}</p>
                    </Link>
                  ))}
                </div>
                <p className={styles.relatedInquiry}>
                  <Link href={currentLocale === 'en' ? '/en/contact' : '/zh/inquiry'}>
                    {currentLocale === 'en'
                      ? 'Discuss your project: send workpiece, process and site requirements'
                      : '咨询本项目：提交工件、工艺和现场条件'}
                  </Link>
                </p>
              </aside>
            ) : null}
          </div>
        </article>
      </main>
    </div>
  );
}
