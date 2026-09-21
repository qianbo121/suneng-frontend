'use client';

import { homeLineMotionCopyEn } from '@/lib/home-products-localized';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiArrowPath, HiPlay, HiStop } from 'react-icons/hi2';
import type { productCenterProductionLines } from '@/lib/products-landing-data';
import { ProductionLineAnimationScene } from './ProductionLineAnimationScene';
import { productionLineAnimationConfig } from '@/lib/production-line-animation-config';
import defaultCardStyles from './ChineseProductsLanding.module.css';
import styles from './TrackPlateLinePreview.module.css';

type AnimationProduct = Pick<
  (typeof productCenterProductionLines)[number],
  'id' | 'name' | 'image' | 'imageAlt' | 'href' | 'applicable' | 'process' | 'compositionHref'
> & {
  imagePosition?: string;
  steps: readonly string[];
  accentSteps: readonly string[];
};

export function ProductionLineAnimationCard({
  product,
  locale = 'zh',
  cardStyles: card = defaultCardStyles,
}: {
  product: AnimationProduct;
  locale?: 'zh' | 'en';
  cardStyles?: typeof defaultCardStyles;
}) {
  const english = locale === 'en';
  const t = (zh: string, en: string) => english ? en : zh;
  const config = english ? homeLineMotionCopyEn[product.id] : productionLineAnimationConfig[product.id];
  const root = useRef<HTMLElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mode, setMode] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [stage, setStage] = useState(0);
  const [session, setSession] = useState(0);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const active = mode !== 'idle';

  const clearHover = useCallback(() => {
    if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);
  const stop = useCallback(() => {
    clearHover();
    setMode('idle');
  }, [clearHover]);
  const play = () => {
    clearHover();
    setStage(0);
    setReady(false);
    setUnavailable(false);
    setSession((current) => current + 1);
    setMode('playing');
  };

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motion.matches);
    const updateMotion = () => {
      setReducedMotion(motion.matches);
      stop();
    };
    const hide = () => {
      if (document.hidden) stop();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) stop();
      },
      { threshold: 0.15 },
    );
    if (root.current) observer.observe(root.current);
    motion.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', hide);
    return () => {
      clearHover();
      observer.disconnect();
      motion.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [clearHover, stop]);

  return (
    <article
      ref={root}
      className={`${card.productionLineCard} ${styles.card}`}
      data-production-line-card
      data-line-id={product.id}
      data-line-preview={mode}
      data-stage-details={active || undefined}
      data-preview-stage={active ? stage : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse' || mode !== 'idle' || reducedMotion) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        clearHover();
        hoverTimer.current = setTimeout(play, 250);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') stop();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) stop();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') stop();
      }}
    >
      <div className={card.productionLineImage}>
        <Link href={product.href} tabIndex={-1} aria-hidden="true" onClick={stop}>
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 46vw, 424px"
            style={{ objectPosition: product.imagePosition }}
          />
        </Link>
        {active && (
          <div
            className={`${styles.preview} ${styles.expandedPreview}`}
            data-ready={ready}
            data-motion={reducedMotion ? 'reduced' : 'full'}
          >
            <ProductionLineAnimationScene
              key={session}
              lineId={product.id}
              title={product.name}
              locale={locale}
              reducedMotion={reducedMotion}
              onStage={setStage}
              onReady={() => setReady(true)}
              onComplete={() => setMode('finished')}
              onError={() => {
                stop();
                setUnavailable(true);
              }}
            />
          </div>
        )}
        <button
          type="button"
          className={styles.playButton}
          aria-label={`${mode === 'playing' ? t('停止', 'Stop ') : mode === 'finished' ? t('重播', 'Replay ') : t('播放', 'Play ')}${product.name}${t('工艺演示', ' process demo')}`}
          aria-pressed={mode === 'playing'}
          onPointerEnter={clearHover}
          onClick={() => {
            if (mode === 'playing') stop();
            else play();
          }}
        >
          {mode === 'playing' ? (
            <HiStop aria-hidden="true" />
          ) : mode === 'finished' ? (
            <HiArrowPath aria-hidden="true" />
          ) : (
            <HiPlay aria-hidden="true" />
          )}
          {mode === 'playing'
            ? ready
              ? t('停止演示', 'Stop demo')
              : t('准备中…', 'Loading…')
            : mode === 'finished'
              ? t('重播演示', 'Replay demo')
              : unavailable
                ? t('重试演示', 'Retry demo')
                : t('播放流程', 'Play process')}
        </button>
      </div>
      <h3 className={card.productionLineName} data-static-info aria-hidden={active || undefined}>
        <Link href={product.href} onClick={stop}>
          {product.name}
        </Link>
      </h3>
      <p className={card.productionLineCopy} data-static-info aria-hidden={active || undefined}>{t('适用：', 'For: ')}{product.applicable}</p>
      <p className={card.productionLineCopy} data-static-info aria-hidden={active || undefined}>{product.process}</p>
      {active && (
        <div className={styles.playbackInfo}>
          <h3 className={styles.stageHeading}>
            <span className={styles.stageNumber} aria-hidden="true">{String(stage + 1).padStart(2, '0')}</span>
            <span>{product.steps[stage]}</span>
          </h3>
          <p className={styles.stageDescription}>{config.stages[stage]}</p>
          <p className={styles.stageNote}>{config.note}</p>
        </div>
      )}
      <div className={card.productionLineFlowPanel}>
        <Link
          href={product.compositionHref}
          className={card.productionLineFlowLink}
          aria-label={english ? `${product.name}: view equipment details` : `${product.name}：查看完整工艺流程`}
          onClick={stop}
        >
          <ol className={card.productionLineFlow} aria-label={t('典型工艺流程', 'Typical process')}>
            {product.steps.map((step, index) => (
              <li
                key={step}
                data-process-accent={product.accentSteps.includes(step) || undefined}
                data-current={active && stage === index ? true : undefined}
                aria-current={active && stage === index ? 'step' : undefined}
              >
                <span data-process-number aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span data-process-label>{step}</span>
              </li>
            ))}
          </ol>
        </Link>
      </div>
      <span className="sr-only" role="status">
        {unavailable
          ? t('演示暂时无法播放，请重试或查看设备详情。', 'Demo unavailable. Retry or view equipment details.')
          : mode === 'finished'
            ? t('生产线工艺演示已结束', 'Production line demo finished')
            : ''}
      </span>
    </article>
  );
}
