import Link from 'next/link';
import { ListPagination } from '@/components/ui/ListPagination';
import { NEWS_PAGE_SIZE } from '@/constants/news';

import { formatNewsDisplayDate } from '@/lib/news';
import {
  buildNewsDecisionHref,
  getNewsDecisionDisplayMeta,
  isFeaturedNewsPage,
  type NewsSort,
  type NewsDecisionTopicId,
  type NewsFurnaceFilterId,
} from '@/lib/news-decision-center';
import { NewsListCardItem } from '@/types/news';
import { Locale } from '@/types/site';

import { NewsCardImage } from './NewsCardImage';
import styles from './NewsDecisionCenter.module.css';

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
};

function NewsListItem({
  locale,
  item,
  priority,
  featured,
}: {
  locale: Locale;
  item: NewsListCardItem;
  priority: boolean;
  featured: boolean;
}) {
  const meta = getNewsDecisionDisplayMeta(item, locale);
  const displayDate = formatNewsDisplayDate(item.updatedAt || item.date);

  return (
    <article
      className={`${styles.articleCard} ${featured ? styles.featuredCard : ''}`}
      data-news-id={item.id}
      data-featured={featured}
    >
      <Link href={`/${locale}/news/${item.slug}`} className={styles.articleLink}>
        <div className={styles.articleImage}>
          <NewsCardImage
            src={item.image}
            alt={locale === 'en' ? item.title.en : `${item.title.zh}封面图`}
            priority={priority}
            sizes={
              featured
                ? '(max-width: 700px) calc(100vw - 56px), 288px'
                : '(max-width: 700px) 96px, 176px'
            }
          />
        </div>

        <div className={styles.articleBody}>
          <h3 className={styles.articleTitle}>{item.title[locale]}</h3>
          <div className={styles.articleTags}>
            {featured ? (
              <span className={styles.recommendLabel}>
                {locale === 'en' ? 'Recommended' : '推荐阅读'}
              </span>
            ) : null}
            <span className={styles.articleTag}>{meta.topicLabel}</span>
            <span className={styles.articleTag}>{meta.furnaceLabel}</span>
            {displayDate ? (
              <time className={styles.articleDate} dateTime={displayDate}>
                {displayDate}
              </time>
            ) : null}
          </div>
          <p className={styles.articleSummary}>{item.summary[locale]}</p>
        </div>
      </Link>
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
  sort = 'recommended',
}: NewsListCardsProps) {
  const normalized = items.slice(0, pageSize);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const href = (nextPage: number) =>
    buildNewsDecisionHref(`/${locale}/news`, {
      query,
      topic,
      furnace,
      sort,
      page: nextPage,
    });

  if (normalized.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>{locale === 'en' ? 'No resources found' : '没有找到匹配资料'}</h3>
        <p>{locale === 'en' ? 'Try another search or filter.' : '请调整搜索词或筛选条件。'}</p>
        <Link href={`/${locale}/news`}>{locale === 'en' ? 'Reset filters' : '清除筛选'}</Link>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.articleList}>
        {normalized.map((item, index) => (
          <NewsListItem
            key={item.id}
            locale={locale}
            item={item}
            priority={index === 0}
            featured={index === 0 && isFeaturedNewsPage({ query, topic, furnace, sort, page })}
          />
        ))}
      </div>
      <ListPagination
        page={page}
        pageCount={pageCount}
        href={href}
        locale={locale}
        ariaLabel={locale === 'en' ? 'Resource pages' : '资料分页'}
      />
    </div>
  );
}
