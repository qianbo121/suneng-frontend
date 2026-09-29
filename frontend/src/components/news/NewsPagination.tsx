import Link from 'next/link';
import type { Locale } from '@/types/site';
import { NewsPageJump } from './NewsPageJump';
import styles from './NewsPagination.module.css';

type NewsPaginationProps = {
  locale: Locale;
  page: number;
  pageCount: number;
  href: (page: number) => string;
  ariaLabel: string;
  prefetch?: boolean;
};

export function NewsPagination({
  locale,
  page,
  pageCount,
  href,
  ariaLabel,
  prefetch,
}: NewsPaginationProps) {
  if (pageCount <= 1) return null;

  const english = locale === 'en';
  const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => firstPage + index);
  const step = (label: string, target: number, disabled: boolean, edge = false) =>
    disabled ? (
      <span aria-disabled="true" className={`${styles.link} ${styles.disabled}`}>
        {label}
      </span>
    ) : (
      <Link
        href={href(target)}
        prefetch={prefetch}
        className={`${styles.link} ${edge ? styles.edge : ''}`}
      >
        {label}
      </Link>
    );

  return (
    <nav className={styles.pagination} aria-label={ariaLabel}>
      <div className={styles.navigation}>
        {step(english ? 'First' : '首页', 1, page <= 1)}
        {step(english ? 'Previous' : '上一页', page - 1, page <= 1)}
        <div className={styles.pageNumbers}>
          {pages.map((item) => (
            <Link
              key={item}
              href={href(item)}
              prefetch={prefetch}
              aria-label={english ? `Page ${item}` : `第 ${item} 页`}
              aria-current={item === page ? 'page' : undefined}
              className={`${styles.link} ${item === page ? styles.active : ''}`}
            >
              {item}
            </Link>
          ))}
        </div>
        {step(english ? 'Next' : '下一页', page + 1, page >= pageCount)}
        {step(english ? 'Last' : '尾页', pageCount, page >= pageCount, true)}
      </div>
      <div className={styles.jumpSection}>
        <span className={styles.totalPages}>
          {english ? `${pageCount} pages` : `共 ${pageCount} 页`}
        </span>
        <span className={styles.currentPage}>
          {english ? 'Page ' : '第 '}
          <strong>{page}</strong> / {pageCount}
          {english ? '' : ' 页'}
        </span>
        <NewsPageJump
          key={`${href(page)}:${pageCount}`}
          locale={locale}
          page={page}
          pageCount={pageCount}
          firstPageHref={href(1)}
        />
      </div>
    </nav>
  );
}
