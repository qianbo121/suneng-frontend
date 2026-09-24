'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiPlay, HiStop } from 'react-icons/hi2';

import {
  FurnaceAnimation,
  useFurnaceAnimationPreload,
} from '@/components/furnace-scenes/FurnaceAnimation';
import { getAdditionalFurnace } from '@/lib/additional-furnaces';
import type { HomeSingleFurnace } from '@/lib/home-product-types';

import styles from './ProductTypesShowcase.module.css';

const homepageFurnaceImages: Readonly<Record<string, string>> = {
  'shovel-furnace':
    '/images/home/product-center/style-matched-20260909/shovel-furnace-v1.webp',
  'walking-beam-furnace':
    '/images/home/product-center/style-matched-20260909/walking-beam-furnace-v1.webp',
  'elevator-hearth-furnace':
    '/images/home/product-center/style-matched-20260909/elevator-hearth-furnace-v1.webp',
  'gas-nitriding-furnace':
    '/images/home/product-center/style-matched-20260909/gas-nitriding-furnace-v1.webp',
};

type Preview = { session: number; active: boolean; ready: boolean; finished: boolean };

export function HomeFurnaceCard({ item: sourceItem, locale = 'zh' }: { item: HomeSingleFurnace; locale?: 'zh' | 'en' }) {
  const english = locale === 'en';
  const t = (zh: string, en: string) => english ? en : zh;
  const item = english ? { ...sourceItem, name: sourceItem.nameEn, description: sourceItem.descriptionEn, imageAlt: sourceItem.nameEn, href: sourceItem.href.replace('/zh/', '/en/') } : sourceItem;
  const matchedImage = homepageFurnaceImages[item.id];
  const image = matchedImage ?? item.image;
  const cardRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const nextSession = useRef(0);
  useFurnaceAnimationPreload(cardRef);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const active = preview?.active ?? false;
  const finished = preview?.finished ?? false;
  const session = preview?.session;

  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);

  const stop = useCallback(() => {
    clearHoverTimer();
    setPreview((current) => (current ? { ...current, active: false } : null));
  }, [clearHoverTimer]);

  const reset = useCallback(() => {
    clearHoverTimer();
    setPreview(null);
  }, [clearHoverTimer]);

  // Keep the last rendered frame until its fade has completed. Re-entering the
  // card cancels disposal and reverses the fade without rebuilding the scene.
  useEffect(() => {
    if (active || session === undefined) return;
    const timer = window.setTimeout(() => {
      setPreview((current) => (current?.active ? current : null));
    }, 360);
    return () => window.clearTimeout(timer);
  }, [active, session]);

  const play = () => {
    clearHoverTimer();
    setUnavailable(false);
    const newSession = ++nextSession.current;
    setPreview((current) =>
      current && !current.finished
        ? { ...current, active: true }
        : { session: newSession, active: true, ready: false, finished: false },
    );
  };

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setReducedMotion(motion.matches);
      reset();
    };
    const hide = () => {
      if (document.hidden) reset();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) reset();
    });
    if (cardRef.current) observer.observe(cardRef.current);
    // Initial effects can follow a replayed first tap; do not cancel that playback.
    setReducedMotion(motion.matches);
    if (motion.matches) reset();
    motion.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', hide);
    return () => {
      clearHoverTimer();
      observer.disconnect();
      motion.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [clearHoverTimer, reset]);

  return (
    <article
      ref={cardRef}
      className={styles.furnaceItem}
      data-active={active || undefined}
      data-furnace-item={item.id}
      data-furnace-addition={getAdditionalFurnace(item.id) ? true : undefined}
      onPointerEnter={(event) => {
        if (active || event.pointerType !== 'mouse') return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        // Give a direct click priority over expensive scene initialization.
        hoverTimer.current = window.setTimeout(play, 150);
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
      <Link href={item.href} className={styles.furnaceTitleLink} onClick={stop}>
        <span className={styles.furnaceEnglishName} lang="en">
          {item.englishName}
        </span>
        <h3>{item.name}</h3>
      </Link>
      <p className={styles.furnaceDescription}>{item.description}</p>

      <Link
        href={item.href}
        className={styles.furnaceMediaControl}
        aria-label={english ? `View ${item.name}` : `查看${item.name}详情`}
        data-furnace-media={item.id}
        onClick={stop}
      >
        <span className={styles.furnaceRealImageLayer}>
          <Image
            src={image}
            alt={item.imageAlt}
            // Serve the compact matched assets at source resolution, like their reference row.
            unoptimized={Boolean(matchedImage)}
            fill
            sizes="(max-width: 767px) 50vw, 25vw"
            className={styles.furnaceImage}
            draggable={false}
          />
        </span>
        <span
          className={styles.furnaceAnimationLayer}
          data-furnace-animation={item.animationKind}
          data-visible={(active && preview?.ready) || undefined}
          data-playing={(active && !finished) || undefined}
          aria-hidden="true"
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === 'opacity') {
              setPreview((current) => (current?.active ? current : null));
            }
          }}
        >
          {preview ? (
            <FurnaceAnimation
              key={session}
              kind={item.animationKind}
              active
              preview={item.animationKind === 'trolley'}
              image={image}
              locale={locale}
              label={english ? `${item.name} operating principle demonstration` : `${item.name}工作原理演示`}
              onReady={() => {
                setPreview((current) =>
                  current && current.session === session ? { ...current, ready: true } : current,
                );
              }}
              onComplete={() => {
                setPreview((current) =>
                  current && current.session === session ? { ...current, finished: true } : current,
                );
              }}
              onError={() => {
                reset();
                setUnavailable(true);
              }}
            />
          ) : null}
        </span>
      </Link>

      <div className={styles.furnaceActions}>
        {!reducedMotion ? (
          <button
            type="button"
            className={styles.furnacePlayButton}
            data-furnace-play={item.id}
            aria-label={`${active && !finished ? t('停止', 'Stop ') : finished ? t('重播', 'Replay ') : t('播放', 'Play ')}${item.name}${t('演示', ' demo')}`}
            onClick={() => {
              if (active && !finished) stop();
              else play();
            }}
          >
            {active && !finished ? <HiStop aria-hidden="true" /> : <HiPlay aria-hidden="true" />}
            {active && !finished ? t('停止演示', 'Stop demo') : finished ? t('重播演示', 'Replay demo') : t('播放演示', 'Play demo')}
          </button>
        ) : null}
      </div>
      <span role="status" className={unavailable ? styles.furnaceError : 'sr-only'}>
        {unavailable ? t('暂时无法播放，可查看设备详情。', 'Demo unavailable. Please view the furnace details.') : finished ? (english ? `${item.name} demo finished` : `${item.name}演示已结束`) : ''}
      </span>
    </article>
  );
}
