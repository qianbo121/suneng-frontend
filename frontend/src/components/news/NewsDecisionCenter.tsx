import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import type { Locale } from '@/types/site';
import { newsUiText } from '@/lib/news-ui';
import Link from 'next/link';
import { HiOutlineDocumentText } from 'react-icons/hi2';
import { QuoteModalButton } from '@/components/lead/QuoteModalButton';
import { NewsSearchForm } from '@/components/news/NewsSearchForm';
import { NewsListCards } from '@/components/news/NewsListCards';
import {
  NewsListFilterControls,
  NewsListHeading,
  NewsListResults,
  NewsListScope,
} from '@/components/news/NewsListInteractive';
import {
  buildNewsDecisionHref,
  NEWS_CENTER_FAQS,
  NEWS_DECISION_TOPICS,
  NEWS_FURNACE_FILTERS,
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
  error,
  loading = false,
  interactive,
}: Props) {
  const t = (text: string) => newsUiText(locale, text);
  const BASE = `/${locale}/news`;
  const filters = { query, topic, furnace, sort };
  const articleHref = (id: number, fallback: string) => {
    const item = sourceItems.find((a) => a.id === id);
    return item ? `/${locale}/news/${item.slug}` : locale === 'en' ? '/en/service' : isWithdrawnTechnicalPath(fallback) ? '/zh/products' : fallback;
  };
  const faqLinks = [
    articleHref(74, '/zh/articles/gongye-lu-baojia-canshu'),
    articleHref(75, '/zh/solutions/continuous-heat-treatment-line'),
    articleHref(73, '/zh/solutions/continuous-heat-treatment-line#checkpoints'),
    articleHref(21, '/zh/service/furnace-renovation-overhaul'),
  ];
  const checklist = sourceItems.find((a) => a.id === 67);
  const tools = [
    {
      title: checklist ? t('网带炉报价边界清单') : t('工业炉报价参数清单'),
      detail: checklist ? t('9项内容') : '',
      href: checklist
        ? `/${locale}/news/${checklist.slug}`
        : locale === 'en'
          ? '/en/contact'
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
  const visibleTools = tools.filter((item) => !isWithdrawnTechnicalPath(item.href) && (checklist || item.title !== t('工业炉报价参数清单')));
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
          <div className={styles.filterPanel} inert={loading || undefined}>
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
                <section className={styles.furnaceInner} aria-label={t('设备类型筛选')}>
                  <span className={styles.furnaceLabel}>{t('设备类型')}</span>
                  <div className={styles.furnaceLinks}>
                    {NEWS_FURNACE_FILTERS.map((item) => (
                      <Link
                        key={item.id}
                        prefetch={false}
                        href={buildNewsDecisionHref(BASE, { ...filters, furnace: item.id })}
                        className={`${styles.furnaceLink} ${!loading && item.id === furnace ? styles.furnaceLinkActive : ''}`}
                        aria-current={!loading && item.id === furnace ? 'page' : undefined}
                      >
                        {t(item.label)}
                      </Link>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </header>
      <div className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <section
              className={styles.listColumn}
              aria-labelledby="news-list-title"
              aria-busy={loading}
            >
              <div className={styles.listHeader}>
                {live ? (
                  <NewsListHeading />
                ) : (
                  <>
                    <h2 id="news-list-title" className={styles.listTitle}>
                      {loading
                        ? t('资料列表')
                        : t(NEWS_DECISION_TOPICS.find((item) => item.id === topic)?.label || '')}
                    </h2>
                    <nav
                      className={styles.sortNav}
                      aria-label={t('文章排序')}
                      inert={loading || undefined}
                    >
                      {(
                        [
                          { id: 'recommended', label: t('推荐阅读') },
                          { id: 'updated', label: t('最近更新') },
                        ] as const
                      ).map((item) => (
                        <Link
                          prefetch={false}
                          key={item.id}
                          href={buildNewsDecisionHref(BASE, { ...filters, sort: item.id })}
                          aria-current={!loading && sort === item.id ? 'page' : undefined}
                          className={`${styles.sortLink} ${!loading && sort === item.id ? styles.sortActive : ''}`}
                        >
                          {t(item.label)}
                        </Link>
                      ))}
                    </nav>
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
                <div role="status" aria-live="polite">
                  <p className="sr-only">{t('正在加载技术资料…')}</p>
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
            <aside
              className={styles.sidebar}
              aria-label={t('资料工具与常见问题')}
              inert={loading || undefined}
            >
              {visibleTools.length > 0 && <section
                className={`${styles.sideModule} ${styles.toolsModule}`}
                aria-labelledby="news-tools-title"
              >
                <h2 id="news-tools-title" className={styles.moduleTitle}>
                  {t('常用清单')}
                </h2>
                <p className={styles.moduleDescription}>{t('先预览内容，再按项目需要使用。')}</p>
                <div className={styles.toolRows}>
                  {visibleTools.map((tool) => (
                    <div key={tool.title} className={styles.toolRow}>
                      <HiOutlineDocumentText aria-hidden="true" />
                      <div>
                        <h3>{tool.title}</h3>
                        {tool.detail && <p>{tool.detail}</p>}
                        <Link href={tool.href}>
                          {locale === 'en' ? 'View Checklist' : '预览清单'}
                          <span className="sr-only">
                            {locale === 'en' ? ': ' : '：'}
                            {tool.title}
                          </span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>}
              <section className={styles.sideModule} aria-labelledby="news-faq-title">
                <h2 id="news-faq-title" className={styles.moduleTitle}>
                  {t('常见问题')}
                </h2>
                <div className={styles.faqList}>
                  {NEWS_CENTER_FAQS.map((item, i) => (
                    <article key={t(item.question)} className={styles.faqItem}>
                      <h3 className={styles.faqQuestion}>
                        <Link href={faqLinks[i]}>{t(item.question)}</Link>
                      </h3>
                      <p className={styles.faqAnswer}>{t(item.answer)}</p>
                    </article>
                  ))}
                </div>
              </section>
              <section className={styles.sidebarCta} aria-labelledby="news-side-cta-title">
                <h2 id="news-side-cta-title" className={styles.sidebarCtaTitle}>
                  {t('参数还没整理齐？')}
                </h2>
                <p className={styles.sidebarCtaText}>{t('可先发工件、产能或现有设备照片。')}</p>
                <Link className={styles.sidebarCtaButton} href={`/${locale}/contact`}>
                  {t('联系苏能工程师')}
                </Link>
              </section>
            </aside>
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
                label={t('提交项目参数')}
                title={t('提交工业炉项目参数')}
                description={t('提供工件、产量、现有设备和场地信息，工程师会协助整理缺失参数。')}
                submitLabel={t('提交项目参数')}
                className={styles.primaryButton}
              />
              <Link className={styles.contactButton} href={`/${locale}/contact`}>
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
      initialState={{ topic, furnace, sort, page }}
      pageSize={pageSize}
      pageTitles={live.pageTitles}
      filteredTitle={live.filteredTitle}
      className={scopeClassName}
    >
      {content}
    </NewsListScope>
  );
}
