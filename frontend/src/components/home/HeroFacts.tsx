'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Locale } from '@/types/site';
import styles from './HomeHero.module.css';

type Fact = {
  amount: number;
  label: string;
  grouped?: boolean;
  plus?: boolean;
  unit?: string;
  note?: string;
};

export default function HeroFacts({ facts, locale }: { facts: Fact[]; locale: Locale }) {
  const [progress, setProgress] = useState<number | null>(null);
  const rows = useMemo(() => facts.map(fact => {
    const format = new Intl.NumberFormat(locale, {
      useGrouping: fact.grouped ?? false,
      maximumFractionDigits: Number.isInteger(fact.amount) ? 0 : 1,
    });
    return { ...fact, format, final: format.format(fact.amount) };
  }), [facts, locale]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) {
      setProgress(1);
      return;
    }

    setProgress(0);
    let start: number | undefined;
    let frame: number;
    function tick(now: number) {
      start ??= now;
      const elapsed = Math.min((now - start) / 1000, 1);
      setProgress(1 - (1 - elapsed) ** 2);
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    }
    function finish() {
      cancelAnimationFrame(frame);
      setProgress(1);
    }
    frame = requestAnimationFrame(tick);
    preference.addEventListener('change', finish);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', finish);
    };
  }, []);

  return (
    <dl className={styles.facts}>
      {rows.map(fact => {
        const suffix = (fact.plus ? '+' : '') + (fact.unit ? ' ' + fact.unit : '');
        return (
          <div key={fact.label}>
            <dt>{fact.label}{fact.note && <span className="sr-only">{fact.note}</span>}</dt>
            <dd aria-label={fact.final + suffix}>
              <span className={styles.number} data-final={fact.final} data-pending={progress === null || undefined} aria-hidden="true">
                <span>{progress === null ? fact.final : fact.format.format(fact.amount * progress)}</span>
              </span>
              {fact.plus && <span aria-hidden="true">+</span>}
              {fact.unit && <span className={styles.unit} aria-hidden="true"> {fact.unit}</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
