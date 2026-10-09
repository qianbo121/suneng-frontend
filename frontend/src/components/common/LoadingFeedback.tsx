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
}: {
  locale: Locale;
  resource?: boolean;
}) {
  const english = locale === 'en';

  return (
    <div className={styles.feedback}>
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
