import type { Locale } from '@/types/site';
import Link from 'next/link';

import styles from './ListPagination.module.css';

type ListPaginationProps = {
  locale?: Locale;
  page: number;
  pageCount: number;
  href: (page: number) => string;
  ariaLabel: string;
};

export function ListPagination({
  page,
  pageCount,
  href,
  ariaLabel,
  locale = 'zh',
}: ListPaginationProps) {
  if (pageCount <= 1) return null;

  const pageStart = Math.max(1, Math.min(page, pageCount) - 2);
  const pageEnd = Math.min(pageCount, pageStart + 4);
  const pages = Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index);

  return (
    <nav className={styles.pagination} aria-label={ariaLabel}>
      {page <= 1 ? (
        <span aria-disabled="true" className={`${styles.link} ${styles.step} ${styles.disabled}`}>
          {locale === 'en' ? 'Previous' : '上一页'}
        </span>
      ) : (
        <Link href={href(page - 1)} className={`${styles.link} ${styles.step}`}>
          {locale === 'en' ? 'Previous' : '上一页'}
        </Link>
      )}
      {pages.map((item) => (
        <Link
          key={item}
          href={href(item)}
          aria-label={locale === 'en' ? `Page ${item}` : `第 ${item} 页`}
          aria-current={item === page ? 'page' : undefined}
          className={`${styles.link} ${item === page ? styles.active : ''}`}
        >
          {item}
        </Link>
      ))}
      {page >= pageCount ? (
        <span aria-disabled="true" className={`${styles.link} ${styles.step} ${styles.disabled}`}>
          {locale === 'en' ? 'Next' : '下一页'}
        </span>
      ) : (
        <Link href={href(page + 1)} className={`${styles.link} ${styles.step}`}>
          {locale === 'en' ? 'Next' : '下一页'}
        </Link>
      )}
    </nav>
  );
}
