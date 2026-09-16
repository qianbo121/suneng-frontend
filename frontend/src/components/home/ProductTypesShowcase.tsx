'use client';

import { getHomeProductionLines } from '@/lib/home-products-localized';

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
import { HiArrowLeft, HiArrowRight, HiChevronDoubleRight } from 'react-icons/hi2';

import { HomeFurnaceCard } from './HomeFurnaceCard';
import { ProductionLineAnimationCard } from '@/components/products/ProductionLineAnimationCard';
import { homeProductionLines, homeSingleFurnaces } from '@/lib/home-product-types';
import { isProductionLineAnimationApproved } from '@/lib/production-line-animation-approval';

import styles from './ProductTypesShowcase.module.css';

const DRAG_THRESHOLD = 7;
const animationCardStyles = {
  productionLineCard: styles.homeLineCard,
  productionLineImage: styles.homeLineImage,
  productionLineName: styles.homeLineName,
  productionLineCopy: styles.homeLineCopy,
  productionLineFlowPanel: styles.homeLineFlowPanel,
  productionLineFlowLink: styles.homeLineFlowLink,
  productionLineFlow: styles.homeLineFlow,
};

function setRailCardsInert(rail: HTMLDivElement, inert: boolean) {
  rail.querySelectorAll<HTMLElement>('[data-production-line-card]').forEach((card) => {
    card.inert = inert;
  });
}

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startScrollLeft: number;
  dragging: boolean;
};

export function ProductTypesShowcase({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const english = locale === 'en';
  const t = (zh: string, en: string) => english ? en : zh;
  const lines = getHomeProductionLines(locale);
  const railRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector<HTMLElement>('[data-production-line-card]');
    if (!firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    const nextIndex = Math.min(
      homeProductionLines.length - 1,
      Math.max(0, Math.round(rail.scrollLeft / step)),
    );
    const isScrollable = rail.scrollWidth > rail.clientWidth + 4;

    setActiveLineIndex(nextIndex);
    setCanScrollPrevious(isScrollable && nextIndex > 0);
    setCanScrollNext(isScrollable && nextIndex < homeProductionLines.length - 1);
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
    if (
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      event.currentTarget.scrollWidth <= event.currentTarget.clientWidth + 4
    ) {
      return;
    }

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
    <section id="product-types" className={styles.section} data-locale={locale}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2>{t('我们有哪些产品类型？', 'Explore our furnace types')}</h2>
          <Link href={`/${locale}/products`} className={styles.allProductsLink}>
            {t('查看全部', 'View all')}
            <HiChevronDoubleRight aria-hidden="true" />
          </Link>
        </header>

        <div className={styles.lineViewport}>
          <div
            ref={railRef}
            className={`${styles.lineRail} ${styles.homeLineRail}`}
            role="region"
            aria-label={t('热处理生产线横向浏览', 'Browse heat-treatment lines')}
            tabIndex={0}
            onScroll={updateScrollState}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerDrag}
            onPointerCancel={finishPointerDrag}
            onClickCapture={handleClickCapture}
            onDragStart={(event) => event.preventDefault()}
          >
            {lines.map((item) => {
              if (isProductionLineAnimationApproved(item.id)) {
                return (
                  <ProductionLineAnimationCard
                    key={item.id}
                    product={{
                      ...item,
                      name: item.title,
                      process: item.summary,
                      compositionHref: english ? item.href : `${item.href}#process`,
                    }}
                    cardStyles={animationCardStyles}
                    locale={locale}
                  />
                );
              }
              return (
                <article key={item.id} className={styles.homeLineCard} data-production-line-card>
                  <Link
                    href={item.href}
                    className={styles.homeLineImage}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 767px) calc(100vw - 64px), (max-width: 1199px) 72vw, (max-width: 1367px) calc((100vw - 96px) / 3), 424px"
                      style={{ objectPosition: item.imagePosition ?? 'center' }}
                      draggable={false}
                    />
                  </Link>
                  <h3 className={styles.homeLineName}>
                    <Link href={item.href}>{item.title}</Link>
                  </h3>
                  <p className={styles.homeLineCopy}>{t('适用：', 'For: ')}{item.applicable}</p>
                  <p className={styles.homeLineCopy}>{item.summary}</p>
                  <div className={styles.homeLineFlowPanel}>
                    <Link
                      href={english ? item.href : `${item.href}#process`}
                      className={styles.homeLineFlowLink}
                      aria-label={english ? `${item.title}: view equipment details` : `${item.title}：查看完整工艺流程`}
                    >
                      <ol className={styles.homeLineFlow} aria-label={t('典型工艺流程', 'Typical process')}>
                        {item.steps.map((step, index) => (
                          <li
                            key={step}
                            data-process-accent={
                              item.accentSteps.some((accentStep) => accentStep === step) ||
                              undefined
                            }
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
                </article>
              );
            })}
          </div>

          <nav className={styles.linePagination} aria-label={t('生产线卡片翻页', 'Production line pages')}>
            <button
              type="button"
              className={styles.linePaginationButton}
              aria-label={t('查看上一条生产线', 'Previous production line')}
              disabled={!canScrollPrevious}
              onClick={() => scrollByCard(-1)}
            >
              <HiArrowLeft aria-hidden="true" />
            </button>

            <span
              className={styles.linePaginationStatus}
              role="status"
              aria-live="polite"
              aria-label={english ? `${activeLineIndex + 1} of ${lines.length}` : `第 ${activeLineIndex + 1} 条，共 ${lines.length} 条`}
            >
              <strong aria-hidden="true">{String(activeLineIndex + 1).padStart(2, '0')}</strong>
              <span className={styles.linePaginationTrack} aria-hidden="true">
                <span
                  className={styles.linePaginationValue}
                  style={{
                    width: `${((activeLineIndex + 1) / homeProductionLines.length) * 100}%`,
                  }}
                />
              </span>
              <span aria-hidden="true">{String(homeProductionLines.length).padStart(2, '0')}</span>
            </span>

            <button
              type="button"
              className={styles.linePaginationButton}
              aria-label={t('查看下一条生产线', 'Next production line')}
              disabled={!canScrollNext}
              onClick={() => scrollByCard(1)}
            >
              <HiArrowRight aria-hidden="true" />
            </button>
          </nav>
        </div>

        <p className={styles.homeLineNote}>
          {t('设备与典型流程示意，具体工艺及配置按材料、产品要求和供货范围确认。', 'Equipment and process illustrations. Final configuration depends on the material, product requirements and agreed scope of supply.')}
        </p>

        <div className={styles.furnaceGrid} role="group" aria-label={t('单炉产品类型', 'Individual furnace types')}>
          {homeSingleFurnaces.map((item) => (
            <HomeFurnaceCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
