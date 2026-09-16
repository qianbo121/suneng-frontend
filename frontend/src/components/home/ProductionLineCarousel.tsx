'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';

import type { HomeProductionLine } from '@/lib/home-product-types';

import styles from './ProductTypesShowcase.module.css';

const DRAG_THRESHOLD = 7;

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startScrollLeft: number;
  dragging: boolean;
};

type ProductionLineCarouselItem = Omit<HomeProductionLine, 'href'> & {
  href?: string;
  detailStatus?: 'published' | 'placeholder';
  imageLabel?: string;
  temperatureNote?: string;
};

function setRailCardsInert(rail: HTMLDivElement, inert: boolean) {
  rail.querySelectorAll<HTMLElement>('[data-production-line-card]').forEach((card) => {
    card.inert = inert;
  });
}

export function ProductionLineCarousel({
  items,
  ariaLabel = '热处理生产线横向浏览',
  layout = 'carousel',
}: {
  items: readonly ProductionLineCarouselItem[];
  ariaLabel?: string;
  layout?: 'carousel' | 'grid';
}) {
  const isGrid = layout === 'grid';
  const railRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    setCanScrollPrevious(rail.scrollLeft > 4);
    setCanScrollNext(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(rail);
    window.addEventListener('resize', updateScrollState);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>('[data-production-line-card]');
    if (!rail || !card) return;

    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByCard(1);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByCard(-1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: event.currentTarget.scrollLeft,
      dragging: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.dragging) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      dragState.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = 'true';
      setRailCardsInert(event.currentTarget, true);
    }

    event.preventDefault();
    event.currentTarget.scrollLeft = dragState.startScrollLeft - deltaX;
  };

  const finishPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (dragState.dragging) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    delete event.currentTarget.dataset.dragging;
    setRailCardsInert(event.currentTarget, false);
    dragStateRef.current = null;
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  return (
    <div className={`${styles.lineViewport} ${isGrid ? styles.lineViewportGrid : ''}`}>
      {!isGrid && canScrollPrevious ? (
        <button
          type="button"
          className={`${styles.nextButton} ${styles.previousButton}`}
          aria-label="查看上一条生产线"
          onClick={() => scrollByCard(-1)}
        >
          <HiArrowLeft aria-hidden="true" />
        </button>
      ) : null}

      <div
        ref={railRef}
        className={`${styles.lineRail} ${isGrid ? styles.productLineGrid : ''}`}
        role="region"
        aria-label={ariaLabel}
        tabIndex={isGrid ? undefined : 0}
        onScroll={isGrid ? undefined : updateScrollState}
        onKeyDown={isGrid ? undefined : handleKeyDown}
        onPointerDown={isGrid ? undefined : handlePointerDown}
        onPointerMove={isGrid ? undefined : handlePointerMove}
        onPointerUp={isGrid ? undefined : finishPointerDrag}
        onPointerCancel={isGrid ? undefined : finishPointerDrag}
        onClickCapture={isGrid ? undefined : handleClickCapture}
        onDragStart={isGrid ? undefined : (event) => event.preventDefault()}
      >
        {items.map((item) => {
          const isPlaceholder = item.detailStatus === 'placeholder' || !item.href;
          const temperaturePosition = `${Math.min(
            100,
            Math.max(
              0,
              ((item.typicalTemperature - item.minimumTemperature) /
                (item.maximumTemperature - item.minimumTemperature)) *
                100,
            ),
          )}%`;

          const cardContent = (
            <>
              <Image
                src={item.image}
                alt={isPlaceholder ? '' : item.imageAlt}
                fill
                sizes="(max-width: 767px) 88vw, (max-width: 1199px) 72vw, (max-width: 1367px) calc((75vw - 54px) / 2), 486px"
                className={styles.lineImage}
                style={{ objectPosition: item.imagePosition ?? 'center' }}
                draggable={false}
              />
              <div className={styles.lineShade} aria-hidden="true" />
              {isPlaceholder ? (
                <span className={styles.linePlaceholderBadge}>资料整理中</span>
              ) : item.imageLabel ? (
                <span className={styles.linePlaceholderBadge}>{item.imageLabel}</span>
              ) : null}
              <div className={styles.lineContent}>
                <div className={styles.lineTitleRow}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>适用：{item.applicable}</p>
                  </div>
                  {!item.temperatureNote && (
                    <strong>
                      {item.typicalTemperature}
                      <small>℃</small>
                    </strong>
                  )}
                </div>
                <p className={styles.lineSummary}>{item.summary}</p>
                <div className={styles.processFlow} aria-label={`${item.title}典型流程`}>
                  {item.steps.map((step, index) => (
                    <span key={step} className={styles.processStepGroup}>
                      <span
                        data-process-accent={
                          item.accentSteps.some((accentStep) => accentStep === step)
                            ? 'true'
                            : undefined
                        }
                        className={`${styles.processStep} ${
                          item.accentSteps.some((accentStep) => accentStep === step)
                            ? styles.processStepAccent
                            : ''
                        }`}
                      >
                        {step}
                      </span>
                      {index < item.steps.length - 1 ? (
                        <HiArrowRight className={styles.processArrow} aria-hidden="true" />
                      ) : null}
                    </span>
                  ))}
                </div>
                {!item.temperatureNote && (
                  <div className={styles.temperatureScale} aria-hidden="true">
                    <span className={styles.temperatureTrack}>
                      <span
                        className={styles.temperatureValue}
                        style={{ width: temperaturePosition }}
                      />
                    </span>
                    <span className={styles.temperatureLabels}>
                      <span>{item.minimumTemperature}℃</span>
                      <span>{item.maximumTemperature}℃</span>
                    </span>
                  </div>
                )}
                {isPlaceholder ? (
                  <span className={styles.linePlaceholderNote}>通用设备场景图 · 暂无详情页</span>
                ) : (
                  <span className={styles.lineAction}>
                    查看生产线
                    <HiArrowRight aria-hidden="true" />
                  </span>
                )}
              </div>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.lineCard} ${isGrid ? styles.productLineGridCard : ''}`}
                data-production-line-card
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <article
              key={item.id}
              className={`${styles.lineCard} ${styles.lineCardPlaceholder} ${
                isGrid ? styles.productLineGridCard : ''
              }`}
              data-production-line-card
              data-production-line-placeholder
            >
              {cardContent}
            </article>
          );
        })}
      </div>

      {!isGrid && canScrollNext ? (
        <button
          type="button"
          className={styles.nextButton}
          aria-label="查看下一条生产线"
          onClick={() => scrollByCard(1)}
        >
          <HiArrowRight aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
