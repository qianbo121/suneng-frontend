'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiArrowPath, HiPlay, HiStop } from 'react-icons/hi2';
import type { productCenterProductionLines } from '@/lib/products-landing-data';
import { TrackPlateLineScene } from './TrackPlateLineScene';
import card from './ChineseProductsLanding.module.css';
import styles from './TrackPlateLinePreview.module.css';

const stages = [
  '履带板有序进入输送辊道',
  '工件在炉内加热',
  '转移定位，辊道下降使工件落模',
  '合模约束工件，通入介质冷却',
  '开模、退挡、托起，再转入回火冷却',
  '冷却后检验尺寸与性能',
];

export function TrackPlateLineCard({
  product,
}: {
  product: (typeof productCenterProductionLines)[number];
}) {
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
      data-line-preview={mode}
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
            className={styles.preview}
            data-ready={ready}
            data-motion={reducedMotion ? 'reduced' : 'full'}
          >
            <TrackPlateLineScene
              key={session}
              reducedMotion={reducedMotion}
              onStage={setStage}
              onReady={() => setReady(true)}
              onComplete={() => setMode('finished')}
              onError={() => {
                stop();
                setUnavailable(true);
              }}
            />
            <p className={styles.caption}>
              <strong>{product.steps[stage]}</strong>
              <span>{stages[stage]}</span>
            </p>
            <span className={styles.note}>电加热与喷淋方案示意 · 节拍已压缩</span>
          </div>
        )}
        <button
          type="button"
          className={styles.playButton}
          aria-label={`${mode === 'playing' ? '停止' : mode === 'finished' ? '重播' : '播放'}履带板生产线工艺演示`}
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
              ? '停止演示'
              : '准备中…'
            : mode === 'finished'
              ? '重播演示'
              : unavailable
                ? '重试演示'
                : '播放流程'}
        </button>
      </div>
      <h3 className={card.productionLineName}>
        <Link href={product.href} onClick={stop}>
          {product.name}
        </Link>
      </h3>
      <p className={card.productionLineCopy}>适用：{product.applicable}</p>
      <p className={card.productionLineCopy}>{product.process}</p>
      <div className={card.productionLineFlowPanel}>
        <Link
          href={product.compositionHref}
          className={card.productionLineFlowLink}
          aria-label={`${product.name}：查看完整工艺流程`}
          onClick={stop}
        >
          <ol className={card.productionLineFlow} aria-label="典型工艺流程">
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
          ? '演示暂时无法播放，请重试或查看设备详情。'
          : mode === 'finished'
            ? '生产线工艺演示已结束'
            : ''}
      </span>
    </article>
  );
}
