'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import styles from './HomeHero.module.css';

const companyStats = [
  {
    value: 2006,
    fractionDigits: 0,
    useGrouping: false,
    unit: '',
    label: 'Founded',
  },
  {
    value: 50.8,
    fractionDigits: 1,
    useGrouping: false,
    unit: 'M CNY',
    label: 'Registered Capital',
  },
  {
    value: 150,
    fractionDigits: 0,
    useGrouping: false,
    suffix: '+',
    unit: '',
    label: 'Employees',
  },
  {
    value: 14700,
    fractionDigits: 0,
    useGrouping: true,
    unit: 'm²',
    label: 'Production Site',
  },
] as const;

type AnimatedNumberProps = {
  value: number;
  fractionDigits: number;
  useGrouping: boolean;
  duration?: number;
};

function AnimatedNumber({
  value,
  fractionDigits,
  useGrouping,
  duration = 1500,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
        useGrouping,
      }),
    [fractionDigits, useGrouping],
  );
  const finalText = formatter.format(value);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    let frameId = 0;
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    setDisplayValue(0);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, value]);

  return (
    <span className={styles.animatedNumber} style={{ minWidth: `${finalText.length}ch` }}>
      {formatter.format(displayValue)}
    </span>
  );
}

export default function EnglishHomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="english-hero-title">
      <Image
        src="/images/home/suneng-factory-aerial-hd.webp"
        alt="Aerial view of Jiangsu Suneng Industrial Furnace Co., Ltd."
        fill
        priority
        unoptimized
        sizes="100vw"
        className={styles.heroImage}
      />

      <div className={styles.blueOverlay} aria-hidden="true" />

      <div className={styles.heroContainer}>
        <div className={`${styles.heroCopy} ${styles.englishCopy}`}>
          <p className={styles.eyebrow}>JIANGSU SUNENG INDUSTRIAL FURNACE CO LTD</p>

          <h1
            id="english-hero-title"
            className={`${styles.title} ${styles.englishTitle}`}
          >
            Jiangsu Suneng Industrial Furnace Co., Ltd.
          </h1>

          <p className={`${styles.description} ${styles.englishDescription}`}>
            Integrated industrial furnace equipment, components and turnkey heat-treatment line
            solutions.
          </p>

          <p className={styles.certification}>National High-tech Enterprise</p>
        </div>
      </div>

      <div className={`${styles.stats} ${styles.englishStats}`} aria-label="Company profile">
        {companyStats.map((item, index) => (
          <div className={styles.statCard} key={item.label} style={{ zIndex: index + 1 }}>
            <div className={styles.statContent}>
              <p className={styles.statValue}>
                <span>
                  <AnimatedNumber
                    value={item.value}
                    fractionDigits={item.fractionDigits}
                    useGrouping={item.useGrouping}
                  />
                  {'suffix' in item ? item.suffix : null}
                </span>
                {item.unit ? <span className={styles.statUnit}>{item.unit}</span> : null}
              </p>

              <p className={`${styles.statLabel} ${styles.englishStatLabel}`}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
