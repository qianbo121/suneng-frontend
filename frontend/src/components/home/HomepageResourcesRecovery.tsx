'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { HiArrowPath } from 'react-icons/hi2';
import { newsUiText } from '@/lib/news-ui';
import type { Locale } from '@/types/site';
import styles from './HeatTreatmentToolCenter.module.css';

// The server's short homepage wait leaves the shared resource read running.
// Refresh the server content after it settles; keep the form and other client
// state mounted, and stop retrying if the data remains unavailable.
const RETRY_DELAYS = [1500, 4000, 8000];

export function HomepageResourcesRecovery({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [pending, startTransition] = useTransition();
  const english = locale === 'en';
  const exhausted = attempt >= RETRY_DELAYS.length && !pending;

  useEffect(() => {
    if (pending || attempt >= RETRY_DELAYS.length) return;
    const timer = setTimeout(() => {
      setAttempt((value) => value + 1);
      startTransition(() => router.refresh());
    }, RETRY_DELAYS[attempt]);
    return () => clearTimeout(timer);
  }, [attempt, pending, router]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <h2>{newsUiText(locale, '工业炉选型与采购资料')}</h2>
        </div>
        <p className={styles.recoveryStatus} role="status" aria-live="polite">
          {!exhausted && <HiArrowPath className={styles.recoverySpinner} aria-hidden="true" />}
          {exhausted
            ? english ? 'Resources are temporarily unavailable. Please try again.' : '资料暂时无法加载，请重试。'
            : english ? 'Loading technical resources…' : '正在加载技术资料…'}
        </p>
        <div className={styles.recoveryActions}>
          {exhausted && (
            <button
              type="button"
              className={styles.allArticlesLink}
              onClick={() => {
                setAttempt(0);
                startTransition(() => router.refresh());
              }}
            >
              {english ? 'Retry loading' : '重新加载'}
            </button>
          )}
          <Link className={styles.allArticlesLink} href={`/${locale}/news`}>
            {english ? 'Browse technical resources' : '查看技术资料'}
          </Link>
        </div>
      </div>
    </section>
  );
}
