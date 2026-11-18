import type { NewsContentFormat } from '@/lib/news-content-type';
import Link from 'next/link';
import { NewsPagination } from '@/components/news/NewsPagination';
import { NEWS_PAGE_SIZE } from '@/constants/news';

import { formatNewsDisplayDate } from '@/lib/news-display-date';
import { getNewsListCardHref } from '@/lib/news-list-resources';
import {
  buildNewsDecisionHref,
  getNewsDecisionDisplayMeta,
  type NewsSort,
  type NewsDecisionTopicId,
  type NewsFurnaceFilterId,
} from '@/lib/news-decision-center';
import { NewsListCardItem } from '@/types/news';
import { Locale } from '@/types/site';

import { NewsCardImage } from './NewsCardImage';
import { ResourceDetailLink, ResourceListRestore } from './ResourceListNavigation';
import styles from './NewsDecisionCenter.module.css';
import { DEFAULT_NEWS_SORT } from '@/lib/news-decision-center';

type NewsListCardsProps = {
  locale: Locale;
  items: NewsListCardItem[];
  page?: number;
  total?: number;
  pageSize?: number;
  query?: string;
  topic?: NewsDecisionTopicId;
  furnace?: NewsFurnaceFilterId;
  sort?: NewsSort;
  format?: NewsContentFormat;
  prefetchPages?: boolean;
};

function NewsListItem({
  locale,
  item,
  priority,
  returnTo,
}: {
  locale: Locale;
  item: NewsListCardItem;
  priority: boolean;
  returnTo: string;
}) {
  const meta = getNewsDecisionDisplayMeta(item, locale);
  const displayDate = item.listDisplayDate ?? formatNewsDisplayDate(item.date);
  const isInfographic = item.contentType === 'infographic';

  const href = getNewsListCardHref(item, locale);
  const isCase = href === `/${locale}/case/${item.slug}`;
  const content = (
    <>
      {!isInfographic && (
        <div className={styles.articleImage}>
          <NewsCardImage
            src={item.image}
            alt={locale === 'en' ? item.title.en : `${item.title.zh}封面图`}
            priority={priority}
            sizes="(max-width: 700px) 112px, 176px"
            naturalRatio
          />
        </div>
      )}
      <div className={styles.articleBody}>
        <div className={styles.articleTags}>
          {isCase ? (
            <Link className={`${styles.articleTag} ${styles.caseIndexLink}`} href={`/${locale}/case`}>
              {locale === 'en' ? 'Project Case' : '项目案例'}
            </Link>
          ) : <span className={styles.articleTag}>{meta.topicLabel}</span>}
          <span className={styles.articleTag}>{meta.furnaceLabel}</span>
          {displayDate ? (
            <time className={styles.articleDate} dateTime={displayDate}>{displayDate}</time>
          ) : null}
        </div>
        <h3 className={styles.articleTitle}>
          {isCase ? <Link className={styles.caseTitleLink} href={href}>{item.title[locale]}</Link> : item.title[locale]}
        </h3>
        <p className={styles.articleSummary}>{item.summary[locale]}</p>
      </div>
    </>
  );

  return (
    <article
      className={styles.articleCard}
      data-news-id={item.id}
      data-featured={false}
      data-content-type={item.contentType ?? 'article'}
    >
      {isCase ? (
        <div className={`${styles.articleLink} ${styles.caseRow}`}>{content}</div>
      ) : (
        <ResourceDetailLink
          href={href}
          returnTo={returnTo}
          className={`${styles.articleLink} ${isInfographic ? styles.textOnlyLink : ''}`}
        >
          {content}
        </ResourceDetailLink>
      )}
    </article>
  );
}

export function NewsListCards({
  locale,
  items,
  page = 1,
  total = items.length,
  pageSize = NEWS_PAGE_SIZE,
  query = '',
  topic = 'all',
  furnace = 'all',
  sort = DEFAULT_NEWS_SORT,
  format = 'article',
  prefetchPages,
}: NewsListCardsProps) {
  const normalized = items.slice(0, pageSize);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const href = (nextPage: number) =>
    buildNewsDecisionHref(`/${locale}/news`, {
      query,
      topic,
      furnace,
      sort,
      format,
      page: nextPage,
    });

  if (normalized.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ResourceListRestore href={href(page)} />
        <h3>{locale === 'en' ? 'No resources found' : '没有找到匹配资料'}</h3>
        <p>{locale === 'en' ? 'Try another search or filter.' : '请调整搜索词或筛选条件。'}</p>
        <Link href={`/${locale}/news`}>{locale === 'en' ? 'Reset filters' : '清除筛选'}</Link>
      </div>
    );
  }

  return (
    <div>
      <ResourceListRestore href={href(page)} />
      <div className={styles.articleList}>
        {normalized.map((item, index) => (
          <NewsListItem
            key={item.id}
            locale={locale}
            item={item}
            priority={index === 0}
            returnTo={href(page)}
          />
        ))}
      </div>
      <NewsPagination
        page={page}
        pageCount={pageCount}
        href={href}
        locale={locale}
        ariaLabel={locale === 'en' ? 'Resource pages' : '资料分页'}
        prefetch={prefetchPages}
      />
    </div>
  );
}
