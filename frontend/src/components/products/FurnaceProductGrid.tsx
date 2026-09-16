'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type KeyboardEvent, useEffect, useState } from 'react';
import { HiArrowRight, HiPlay } from 'react-icons/hi2';

import { FurnaceAnimation } from '@/components/furnace-scenes';
import { homeSingleFurnaces } from '@/lib/home-product-types';
import { Locale } from '@/types/site';

import styles from './FurnaceProductGrid.module.css';

type FurnaceProductGridProps = {
  locale: Locale;
};

const tapInteractionQuery = '(max-width: 767px), (pointer: coarse)';

export function FurnaceProductGrid({ locale }: FurnaceProductGridProps) {
  const [activeFurnace, setActiveFurnace] = useState<string | null>(null);
  const [usesTapInteraction, setUsesTapInteraction] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(tapInteractionQuery);
    const updateInteractionMode = () => {
      setUsesTapInteraction(mediaQuery.matches);
      setActiveFurnace(null);
    };

    updateInteractionMode();
    mediaQuery.addEventListener('change', updateInteractionMode);
    return () => mediaQuery.removeEventListener('change', updateInteractionMode);
  }, []);

  const handleMediaKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Escape') return;

    setActiveFurnace(null);
    event.currentTarget.blur();
  };

  const isEnglish = locale === 'en';

  return (
    <div className={styles.productSeries}>
      <header className={styles.heading}>
        <h2>{isEnglish ? 'Industrial Furnace Series' : '工业炉产品系列'}</h2>
        <p className={styles.interactionHint}>
          <span className={styles.desktopHint}>
            {isEnglish
              ? 'Hover over an equipment image to view how it works'
              : '悬停设备图片，查看工作原理'}
          </span>
          <span className={styles.touchHint}>
            {isEnglish
              ? 'Tap an equipment image to view how it works'
              : '轻触设备图片，查看炉型工作原理'}
          </span>
        </p>
      </header>

      <div className={styles.grid}>
        {homeSingleFurnaces.map((item, index) => {
          const isActive = activeFurnace === item.id;
          const localizedName = isEnglish ? item.nameEn : item.name;
          const localizedDescription = isEnglish ? item.descriptionEn : item.description;
          const detailsHref = `/${locale}/products/detail/${item.id}`;
          const animationLabel = isEnglish
            ? `${item.nameEn} working principle animation`
            : `${item.name}工作原理动画`;
          const mediaActionLabel = isActive
            ? isEnglish
              ? `Show ${item.nameEn} equipment image`
              : `返回${item.name}设备图`
            : isEnglish
              ? `Show ${item.nameEn} working principle animation`
              : `查看${item.name}工作原理`;

          return (
            <article key={item.id} className={styles.card} data-active={isActive || undefined}>
              <p className={styles.englishName}>{item.englishName}</p>
              <h3>{localizedName}</h3>

              <button
                type="button"
                className={styles.mediaControl}
                aria-label={mediaActionLabel}
                aria-pressed={isActive}
                onMouseEnter={() => {
                  if (!usesTapInteraction) setActiveFurnace(item.id);
                }}
                onMouseLeave={() => {
                  if (!usesTapInteraction) setActiveFurnace(null);
                }}
                onFocus={() => {
                  if (!usesTapInteraction) setActiveFurnace(item.id);
                }}
                onBlur={() => setActiveFurnace(null)}
                onClick={() => {
                  if (usesTapInteraction) {
                    setActiveFurnace((current) => (current === item.id ? null : item.id));
                  }
                }}
                onKeyDown={handleMediaKeyDown}
              >
                <div className={styles.realImageLayer} aria-hidden={isActive || undefined}>
                  <Image
                    src={item.image}
                    alt={isEnglish ? `${item.nameEn} equipment` : item.imageAlt}
                    fill
                    priority={index < 4}
                    className={styles.realImage}
                    sizes="(min-width: 1200px) 330px, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div
                  className={styles.animationLayer}
                  data-playing={isActive || undefined}
                  aria-hidden={!isActive || undefined}
                >
                  <FurnaceAnimation locale={locale} kind={item.animationKind} label={animationLabel} active={isActive} image={item.image} touchCaption />
                </div>

                <span className={styles.touchToggleLabel} aria-hidden="true">
                  <HiPlay />
                  {isActive
                    ? isEnglish
                      ? 'Back to equipment image'
                      : '返回设备图'
                    : isEnglish
                      ? 'View working principle'
                      : '查看工作原理'}
                </span>
              </button>

              <p className={styles.description}>{localizedDescription}</p>
              <Link href={detailsHref} className={styles.detailsLink}>
                {isEnglish ? 'View details' : '查看详情'}
                <HiArrowRight aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
