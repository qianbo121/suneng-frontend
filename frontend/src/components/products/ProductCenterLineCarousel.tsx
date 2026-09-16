'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import type { productCenterProductionLines } from '@/lib/products-landing-data';
import { ProductionLineAnimationCard } from './ProductionLineAnimationCard';
import { isProductionLineAnimationApproved } from '@/lib/production-line-animation-approval';
import styles from './ChineseProductsLanding.module.css';

type ProductionLine = (typeof productCenterProductionLines)[number];

export function ProductCenterLineCarousel({
  items,
  previewAll = false,
}: {
  items: ProductionLine[];
  previewAll?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  const [page, setPage] = useState(0);
  const groups = Array.from({ length: Math.ceil(items.length / columns) }, (_, index) =>
    items.slice(index * columns, (index + 1) * columns),
  );

  useEffect(() => {
    const updateColumns = () =>
      setColumns(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    // Reset the old offset when cards are regrouped at a responsive breakpoint.
    rail.scrollTo({ left: 0, behavior: 'instant' });
    setPage(0);
    let frame = 0;
    const syncPage = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
        const current = Math.round(rail.scrollLeft / (rail.clientWidth + gap));
        setPage(Math.max(0, Math.min(current, Math.ceil(items.length / columns) - 1)));
      });
    };
    const resize = new ResizeObserver(syncPage);
    resize.observe(rail);
    rail.addEventListener('scroll', syncPage, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      rail.removeEventListener('scroll', syncPage);
    };
  }, [columns, items.length]);

  const move = (direction: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const target = Math.max(0, Math.min(page + direction, groups.length - 1));
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollTo({
      left: target * (rail.clientWidth + gap),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  };

  const first = page * columns + 1;
  const last = Math.min((page + 1) * columns, items.length);
  return (
    <>
      <div className={styles.productionLineHeader}>
        <div className={styles.productionLineIntro}>
          <div className={styles.productionLineTitle}>
            <h2 id="production-line-title">热处理生产线</h2>
            <span>{items.length} 条</span>
          </div>
          <p>按工件与工艺需求，了解对应的生产线</p>
        </div>
        <div className={styles.productionLineControls}>
          <output className={styles.productionLineCounter} aria-live="polite" aria-atomic="true">
            {first === last ? first : `${first}–${last}`} / {items.length}
          </output>
          <button
            type="button"
            aria-label="查看上一组生产线"
            aria-controls="production-line-rail"
            className={styles.productionLineControl}
            disabled={page === 0}
            onClick={() => move(-1)}
          >
            <HiChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="查看下一组生产线"
            aria-controls="production-line-rail"
            className={styles.productionLineControl}
            disabled={page >= groups.length - 1}
            onClick={() => move(1)}
          >
            <HiChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        id="production-line-rail"
        className={styles.productionLineRail}
        role="region"
        aria-label="产品中心热处理生产线列表"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {groups.map((group, groupIndex) => (
          <div
            key={`${columns}-${groupIndex}`}
            className={styles.productionLineGroup}
            style={{ '--line-columns': columns } as CSSProperties}
            data-line-group
          >
            {group.map((product) =>
              previewAll || isProductionLineAnimationApproved(product.id) ? (
                <ProductionLineAnimationCard key={product.id} product={product} />
              ) : (
                <article
                  key={product.id}
                  className={styles.productionLineCard}
                  data-production-line-card
                >
                  <Link
                    href={product.href}
                    className={styles.productionLineImage}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      loading={groupIndex === 0 ? 'eager' : 'lazy'}
                      sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 46vw, (max-width: 1367px) 31vw, 424px"
                      style={{ objectPosition: product.imagePosition }}
                    />
                  </Link>
                  <h3 className={styles.productionLineName}>
                    <Link href={product.href}>{product.name}</Link>
                  </h3>
                  <p className={styles.productionLineCopy}>适用：{product.applicable}</p>
                  <p className={styles.productionLineCopy}>{product.process}</p>
                  <div className={styles.productionLineFlowPanel}>
                    <Link
                      href={product.compositionHref}
                      className={styles.productionLineFlowLink}
                      aria-label={`${product.name}：查看完整工艺流程`}
                    >
                      <ol className={styles.productionLineFlow} aria-label="典型工艺流程">
                        {product.steps.map((step, stepIndex) => (
                          <li
                            key={step}
                            data-process-accent={product.accentSteps.includes(step) || undefined}
                          >
                            <span data-process-number aria-hidden="true">
                              {String(stepIndex + 1).padStart(2, '0')}
                            </span>
                            <span data-process-label>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </Link>
                  </div>
                </article>
              ),
            )}
          </div>
        ))}
      </div>
      <p className={styles.productionLineNote}>
        设备与典型流程示意，具体工艺及配置按材料、产品要求和供货范围确认
      </p>
    </>
  );
}
