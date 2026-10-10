'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import styles from './PitFurnaceDetailPage.module.css';

export function ProductHeroDetails({ label, children }: { label: string; children: ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 640px)');
    const syncBreakpoint = () => {
      if (detailsRef.current) detailsRef.current.open = !mobile.matches;
    };
    syncBreakpoint();
    mobile.addEventListener('change', syncBreakpoint);
    return () => mobile.removeEventListener('change', syncBreakpoint);
  }, []);

  return (
    <details ref={detailsRef} className={styles.heroDetails}>
      <summary>{label}</summary>
      {children}
    </details>
  );
}
