import { getNewsSummary } from '@/lib/news-summary';
import { getNewsSeoTitle } from '@/lib/news-seo-title';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { HiPhone } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { NewsArticleContent } from '@/components/news/NewsArticleContent';
import { NewsArticleToc } from '@/components/news/NewsArticleToc';
import { NewsRelatedArticles } from '@/components/news/NewsRelatedArticles';
import { siteSettings } from '@/mock/siteSettings';
import { NewsViewPing } from '@/components/news/NewsViewPing';
import {
  FALLBACK_NEWS_DETAIL,
  FALLBACK_NEWS_ITEMS,
  FALLBACK_NEWS_SLUGS,
  NEWS_LABEL,
} from '@/constants/news';
import { getNewsList } from '@/lib/api/news';
import { selectNewsContinueReadingItems } from '@/lib/news-continue-reading';
import {
  formatNewsDisplayDate,
  getNewsDetailPageData,
  normalizeNewsHtml,
  resolveNewsImage,
} from '@/lib/news';
import { getNewsContentModifiedTime } from '@/lib/news-dates';
import { getArticleJsonLd, getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { englishNewsSearchDescription } from '@/lib/seo/english-search-description';
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
  // Keep complete summaries in both languages, including acceptance limitations.
  const description = summary;
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
    description:
      currentLocale === 'en'
        ? englishNewsSearchDescription(article.titleEn || article.titleZh, description)
        : description,
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
  const detailLabel = currentLocale === 'en' ? 'Article' : '正文';
  const contentId = `news-body-${article.id}`;
  const modifiedTime = getNewsContentModifiedTime(article, currentLocale);
  const relatedLinks = getNewsRelatedLinks(article, currentLocale);
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
    3,
  );
  const relatedArticles = continueReadingItems.map((item) => {
    const source = newsListResult.data?.items.find((candidate) => candidate.id === item.id);
    const fallback = !source
      ? FALLBACK_NEWS_ITEMS.find((candidate) => candidate.id === item.id)
      : undefined;
    const date = source?.publishDate || fallback?.date;
    return {
      ...item,
      image:
        source && (source.coverImage || source.ogImage)
          ? resolveNewsImage(source, { locale: currentLocale })
          : fallback?.image,
      date,
      displayDate: date ? formatNewsDisplayDate(date) : undefined,
    };
  });

  return (
    <div className={styles.page}>
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

      <div className={styles.breadcrumb}>
        <Breadcrumb
          locale={currentLocale}
          currentLabel={detailLabel}
          tone="dark"
          items={[
            {
              label: currentLocale === 'en' ? newsLabel : '技术资料',
              href: `/${currentLocale}/news`,
            },
            { label: detailLabel },
          ]}
        />
      </div>

      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <h1 id="news-detail-title" className={styles.title}>
              {title}
            </h1>
            <div className={styles.meta}>
              <time dateTime={article.publishDate}>
                {formatNewsDisplayDate(article.publishDate)}
              </time>
              {currentLocale === 'en' && article.englishSourceDate && (
                <span>
                  {article.englishSourceDate.label}:{' '}
                  <time dateTime={article.englishSourceDate.date}>
                    {formatNewsDisplayDate(article.englishSourceDate.date)}
                  </time>
                </span>
              )}
              <span className={styles.metaDivider} aria-hidden="true">
                |
              </span>
              <span>
                {currentLocale === 'en'
                  ? 'Jiangsu Suneng Industrial Furnace Engineering Team'
                  : '江苏苏能工业炉工程技术团队'}
              </span>
            </div>
          </header>

          <NewsArticleToc
            key={`${contentId}-mobile`}
            contentId={contentId}
            locale={currentLocale}
            mobile
          />
          <div id={contentId} className={styles.bodyWrap} data-news-slug={slug}>
            <NewsArticleContent html={html} />
          </div>

          <div className={styles.supporting}>
            {relatedLinks.length ? (
              <aside aria-labelledby="news-related-links-title" className={styles.related}>
                <h2 id="news-related-links-title" className={styles.relatedTitle}>
                  {currentLocale === 'en'
                    ? 'Related equipment and project guidance'
                    : '相关产品、方案与项目证据'}
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
        <aside
          className={styles.sidebar}
          aria-label={currentLocale === 'en' ? 'Article resources' : '文章辅助资料'}
        >
          <NewsArticleToc key={contentId} contentId={contentId} locale={currentLocale} />
          <div className={styles.sidebarCards} data-news-sidebar-cards>
            <NewsRelatedArticles items={relatedArticles} locale={currentLocale} />
            <section className={styles.consultation} aria-labelledby="news-consultation-title">
              <h2 id="news-consultation-title">
                {currentLocale === 'en' ? 'Need a technical proposal?' : '需要技术方案？'}
              </h2>
              <p>
                {currentLocale === 'en'
                  ? 'Custom heat-treatment equipment and process solutions for different industries and workpieces.'
                  : '我们为不同行业、不同工件提供定制化热处理设备与工艺解决方案。'}
              </p>
              <WechatContactButton
                locale={currentLocale}
                label={currentLocale === 'en' ? 'Contact via WeChat' : '微信联系'}
                description={
                  currentLocale === 'en'
                    ? 'Send workpieces, process, throughput and site conditions for an initial assessment.'
                    : undefined
                }
                className={styles.consultButton}
              />
              <a
                className={styles.phone}
                href={`tel:${siteSettings.salesPhone.replace(/[^+\d]/g, '')}`}
              >
                <HiPhone aria-hidden="true" />
                {currentLocale === 'en' ? siteSettings.salesPhone : '130-5298-6814'}
              </a>
              <p className={styles.hours}>
                {currentLocale === 'en' ? 'Weekdays 8:30–17:30 (China time)' : '工作日 8:30–17:30'}
              </p>
            </section>
          </div>
        </aside>
      </main>
    </div>
  );
}
