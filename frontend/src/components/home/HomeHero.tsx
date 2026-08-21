'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import styles from './HomeHero.module.css';

const companyStats = [
  {
    value: '2006',
    unit: '年',
    label: '公司成立',
  },
  {
    value: '5080',
    unit: '万元',
    label: '注册资本',
  },
  {
    value: '150+',
    unit: '人',
    label: '在职人数',
  },
  {
    value: '14700',
    unit: 'm²',
    label: '车间占地',
  },
] as const;

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let frameId = 0;
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

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
    <span
      className={styles.animatedNumber}
      style={{ minWidth: `${String(value).length}ch` }}
    >
      {displayValue}
    </span>
  );
}

export default function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Image
        src="/images/home/suneng-factory-aerial-hd.webp"
        alt="江苏苏能工业炉有限公司厂区航拍"
        fill
        priority
        unoptimized
        sizes="100vw"
        className={styles.heroImage}
      />

      <div className={styles.blueOverlay} aria-hidden="true" />

      <div className={styles.heroContainer}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>JIANGSU SUNENG INDUSTRIAL FURNACE CO LTD</p>

          <h1 id="hero-title" className={styles.title}>
            江苏苏能工业炉有限公司
          </h1>

          <p className={styles.description}>工业炉单机、配套件与整线交钥匙工程一体化解决方案商</p>

          <p className={styles.certification}>国家高新技术企业</p>
        </div>
      </div>

      <div className={styles.stats} aria-label="企业实力">
        {companyStats.map((item, index) => (
          <div className={styles.statCard} key={item.label} style={{ zIndex: index + 1 }}>
            <div className={styles.statContent}>
              <p className={styles.statValue}>
                <span>
                  <AnimatedNumber value={Number.parseInt(item.value, 10)} />
                  {item.value.endsWith('+') ? '+' : null}
                </span>
                <span className={styles.statUnit}>{item.unit}</span>
              </p>

              <p className={styles.statLabel}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
