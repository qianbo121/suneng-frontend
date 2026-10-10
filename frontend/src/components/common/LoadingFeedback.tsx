'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Locale } from '@/types/site';
import styles from './LoadingFeedback.module.css';

export function ClientLoadingContent({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? children : null;
}

export function LoadingFeedback({
  locale,
  resource = false,
  variant,
}: {
  locale: Locale;
  resource?: boolean;
  variant?: 'article-skeleton';
}) {
  const english = locale === 'en';
  const articleSkeleton = variant === 'article-skeleton';

  return (
    <div className={`${styles.feedback}${articleSkeleton ? ` ${styles.articleSkeleton}` : ''}`}>
      {articleSkeleton && (
        <div className={styles.skeletonLayout} aria-hidden="true">
          <div className={styles.skeletonArticle}>
            <div className={styles.skeletonHeader}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonTitleShort}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonMeta}`} />
            </div>
            <div className={styles.skeletonBody}>
              {[0, 1, 2].map((paragraph) => (
                <div className={styles.skeletonParagraph} key={paragraph}>
                  <div className={styles.skeletonBlock} />
                  <div className={styles.skeletonBlock} />
                  <div className={styles.skeletonBlock} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.skeletonRelated}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonRelatedTitle}`} />
            {[0, 1].map((item) => (
              <div className={styles.skeletonRelatedItem} key={item}>
                <div className={styles.skeletonBlock} />
                <div className={styles.skeletonBlock} />
              </div>
            ))}
          </div>
        </div>
      )}
      <ClientLoadingContent>
        <p className={styles.pending} role="status" aria-live="polite">
          {resource
            ? english
              ? 'Loading resources…'
              : '正在加载技术资料…'
            : english
              ? 'Loading page…'
              : '正在加载页面…'}
        </p>
        <div className={styles.slow}>
          <p role="status" aria-live="polite">
            {english
              ? 'Loading is taking longer than usual. Please wait or try again.'
              : '加载时间较长，请继续等待或重试。'}
          </p>
          {/* An empty href reloads the current URL with its search parameters
              instead of clearing filters. */}
          <a href="" className={styles.retry}>
            {english ? 'Retry loading' : '重新加载'}
          </a>
        </div>
      </ClientLoadingContent>
    </div>
  );
}
