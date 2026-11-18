import type { NewsContentFormat } from '@/lib/news-content-type';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { LoadingFeedback } from '@/components/common/LoadingFeedback';
import type { Locale } from '@/types/site';
import { newsUiText } from '@/lib/news-ui';
import Link from 'next/link';
import { NewsChecklists } from '@/components/news/NewsChecklists';
import { QuoteModalButton } from '@/components/lead/QuoteModalButton';
import { NewsSearchForm } from '@/components/news/NewsSearchForm';
import { NewsListCards } from '@/components/news/NewsListCards';
import {
  NewsListFilterControls,
  NewsListHeading,
  NewsListResults,
  NewsListScope,
  NewsFilterPanel,
  NewsResultsSummary,
  NewsListToolbar,
  NewsContentTabs,
} from '@/components/news/NewsListInteractive';
import {
  buildNewsDecisionHref,
  NEWS_DECISION_TOPICS,
  type NewsDecisionTopicId,
  type NewsFurnaceFilterId,
  type NewsSort,
} from '@/lib/news-decision-center';
import type { NewsListCardItem } from '@/types/news';
import styles from './NewsDecisionCenter.module.css';

type Props = {
  locale?: Locale;
  items: NewsListCardItem[];
  sourceItems: NewsListCardItem[];
  page: number;
  total: number;
  pageSize: number;
  query: string;
  topic: NewsDecisionTopicId;
  furnace: NewsFurnaceFilterId;
  sort: NewsSort;
  format?: NewsContentFormat;
  error?: string | null;
  loading?: boolean;
  // Lightweight cards for switching topic, equipment, sort and page in the
  // browser. Search results, errors and the loading shell stay server-driven.
  interactive?: {
    cards: NewsListCardItem[];
    pageTitles: string[];
    filteredTitle: string;
  };
};
export function NewsDecisionCenter({
  locale = 'zh',
  items,
  sourceItems,
  page,
  total,
  pageSize,
  query,
  topic,
  furnace,
  sort,
  format = 'article',
  error,
  loading = false,
  interactive,
}: Props) {
  const t = (text: string) => newsUiText(locale, text);
  const BASE = `/${locale}/news`;
  const filters = { query, topic, furnace, sort, format };
  const checklist = sourceItems.find((a) => a.id === 67);
  const tools = [
    {
      title: locale === 'en' ? 'Overseas Delivery Checklist' : '海外交付核对清单',
      detail: '',
      href: `/${locale}/service/installation-after-sales#overseas-delivery`,
    },
    {
      title: checklist ? t('网带炉报价边界清单') : t('工业炉报价参数清单'),
      detail: checklist ? t('9项内容') : '',
      href: checklist
        ? `/${locale}/news/${checklist.slug}`
        : locale === 'en'
          ? '/en/about#contact'
          : '/zh/articles/gongye-lu-baojia-canshu#param-table',
    },
    {
      title: t('生产线交付核验清单'),
      detail: '',
      href:
        locale === 'en'
          ? '/en/solutions/continuous-heat-treatment-line'
          : '/zh/solutions/continuous-heat-treatment-line#checkpoints',
    },
  ];
  const live = interactive && !loading && !error && !query ? interactive : null;
  const scopeClassName = `${styles.scope} news-center-scope`;
  const visibleTools = tools.filter(
    (item) =>
      !isWithdrawnTechnicalPath(item.href) && (checklist || item.title !== t('工业炉报价参数清单')),
  );
  const content = (
    <>
      <header className={styles.pageHead}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label={t('面包屑')}>
            <Link href={`/${locale}`}>{t('首页')}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t('技术资料')}</span>
          </nav>
          <div className={styles.titleSearchRow}>
            <div>
              {/* A skeleton never owns the section heading: this fallback also wraps
                  /news/[slug], so an <h1> here ships a duplicate on every article. */}
              {loading ? (
                <p className={styles.pageTitle}>{t('工业炉选型与采购资料')}</p>
              ) : (
                <h1 className={styles.pageTitle}>{t('工业炉选型与采购资料')}</h1>
              )}
              <p className={styles.pageDescription}>
                {t('了解设备选型、报价参数、工艺质量、工程验收与维修改造。')}
              </p>
            </div>
            <NewsSearchForm locale={locale} {...filters} disabled={loading} />
          </div>
        </div>
      </header>
      <div className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <aside className={styles.listSidebar}>
              <p className={styles.sidebarLabel}>
                {locale === 'en' ? 'Browse by question' : '按问题找资料'}
              </p>
              <NewsFilterPanel locale={locale} topic={topic} furnace={furnace} loading={loading}>
                {live ? (
                  <NewsListFilterControls />
                ) : (
                  <>
                    <nav className={styles.topicNav} aria-label={t('内容分类')}>
                      {NEWS_DECISION_TOPICS.map((item) => (
                        <Link
                          key={item.id}
                          prefetch={false}
                          href={buildNewsDecisionHref(BASE, { ...filters, topic: item.id })}
                          className={`${styles.topicLink} ${!loading && item.id === topic ? styles.topicLinkActive : ''}`}
                          aria-current={!loading && item.id === topic ? 'page' : undefined}
                        >
                          {t(item.label)}
                        </Link>
                      ))}
                    </nav>
                  </>
                )}
              </NewsFilterPanel>
              {visibleTools.length > 0 && (
                <div className={styles.sidebarTools} inert={loading || undefined}>
                  <NewsChecklists title={t('常用清单')} tools={visibleTools} />
                </div>
              )}
              <div className={styles.sidebarHelp}>
                <p>{locale === 'en' ? 'Need help choosing a resource?' : '不确定该看哪类资料？'}</p>
                <Link href={`/${locale}/contact`}>{t('联系苏能工程师')}</Link>
              </div>
            </aside>
            <section
              className={styles.listColumn}
              aria-labelledby="news-list-title"
              aria-busy={loading}
            >
              <NewsContentTabs locale={locale} {...filters} disabled={loading} />
              <div className={styles.listHeader}>
                {live ? (
                  <NewsListHeading />
                ) : (
                  <>
                    <div className={styles.headingCopy}>
                      <h2 id="news-list-title" className={styles.listTitle}>
                        {loading
                          ? t('资料列表')
                          : t(NEWS_DECISION_TOPICS.find((item) => item.id === topic)?.label || '')}
                      </h2>
                      {!loading && !error ? (
                        <NewsResultsSummary
                          locale={locale}
                          total={total}
                          page={page}
                          pageSize={pageSize}
                        />
                      ) : null}
                    </div>
                    <NewsListToolbar
                      locale={locale}
                      query={query}
                      topic={topic}
                      furnace={furnace}
                      sort={sort}
                      format={format}
                      disabled={loading}
                    />
                  </>
                )}
              </div>
              {query && (
                <p className={styles.listHint}>
                  {locale === 'en'
                    ? `Results for “${query}” · ${total} articles`
                    : `“${query}”相关资料 · ${total}篇`}
                </p>
              )}
              {loading ? (
                <div>
                  <LoadingFeedback locale={locale} resource />
                  <div aria-hidden="true">
                    {[0, 1, 2].map((index) => (
                      <div className={styles.loadingCard} key={index}>
                        <div className={styles.loadingImage} />
                        <div className={styles.loadingCopy}>
                          <div className={styles.loadingTitle} />
                          <div className={styles.loadingLine} />
                          <div className={styles.loadingLine} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className={styles.emptyState} role="alert">
                  <h3>{t('资料暂时无法加载')}</h3>
                  <p>{t('请稍后重试，或联系苏能工程师。')}</p>
                  <a href={buildNewsDecisionHref(BASE, { ...filters, page })}>{t('重新加载')}</a>
                </div>
              ) : live ? (
                <NewsListResults />
              ) : (
                <NewsListCards
                  locale={locale}
                  items={items}
                  page={page}
                  total={total}
                  pageSize={pageSize}
                  {...filters}
                />
              )}
            </section>
          </div>
          <section className={styles.bottomCta} aria-labelledby="news-bottom-cta-title">
            <div>
              <h2 id="news-bottom-cta-title" className={styles.bottomCtaTitle}>
                {t('把项目情况发过来，先做一次工况初判')}
              </h2>
              <p className={styles.bottomCtaText}>
                {t('提供工件、产量或现有设备情况，工程师协助核准关键参数。')}
              </p>
            </div>
            <div className={styles.bottomCtaActions}>
              <QuoteModalButton
                locale={locale}
                formVariant="compact-news"
                label={t('提交项目参数')}
                title={t('提交工业炉项目参数')}
                description={t('提供工件、产量、现有设备和场地信息，工程师会协助整理缺失参数。')}
                submitLabel={t('提交项目参数')}
                className={styles.primaryButton}
              />
              <Link className={styles.contactButton} href={`/${locale}/about#contact`}>
                {t('联系苏能工程师')}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );

  if (!live) return <div className={scopeClassName}>{content}</div>;

  return (
    <NewsListScope
      locale={locale}
      cards={live.cards}
      initialState={{ topic, furnace, sort, page, format }}
      pageSize={pageSize}
      pageTitles={live.pageTitles}
      filteredTitle={live.filteredTitle}
      className={scopeClassName}
    >
      {content}
    </NewsListScope>
  );
}
