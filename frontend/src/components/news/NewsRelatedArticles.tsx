import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';

import { NewsCardImage } from '@/components/news/NewsCardImage';
import type { Locale } from '@/types/site';
import styles from './NewsRelatedArticles.module.css';

export type NewsRelatedArticle = {
  slug: string;
  title: string;
  image?: string;
  date?: string;
  displayDate?: string;
};

export function NewsRelatedArticles({
  items,
  locale,
}: {
  items: NewsRelatedArticle[];
  locale: Locale;
}) {
  if (!items.length) return null;

  return (
    <section className={styles.card} aria-labelledby="news-related-articles-title">
      <div className={styles.heading}>
        <h2 id="news-related-articles-title">
          {locale === 'en' ? 'Related articles' : '相关文章'}
        </h2>
        <Link href={`/${locale}/news`}>
          {locale === 'en' ? 'View all' : '查看更多'}
          <HiArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <Link href={`/${locale}/news/${item.slug}`} key={item.slug} className={styles.item}>
            {item.image && (
              <span className={styles.image}>
                <NewsCardImage src={item.image} alt="" priority={false} sizes="100px" />
              </span>
            )}
            <span className={styles.copy}>
              <span className={styles.title}>{item.title}</span>
              {item.date && <time dateTime={item.date}>{item.displayDate}</time>}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
