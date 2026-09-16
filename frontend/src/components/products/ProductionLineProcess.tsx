'use client';

import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  HiArrowRight,
  HiChevronDown,
  HiOutlineMapPin,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineFire,
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowsRightLeft,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';
import type { getLineProcessSteps, ProcessMap } from '@/lib/production-line-process-map';
import type { LineImage, ProductionLineContent } from '@/lib/production-line-types';
import { ProductionLineImage } from './ProductionLineImage';
import { getProcessAnnotation } from './production-line-annotations';
import styles from './ProductionLineProcess.module.css';

type Props = {
  pageId: string;
  image?: LineImage;
  process: ProductionLineContent['sections']['process'];
  model?: ProcessMap;
  steps: ReturnType<typeof getLineProcessSteps>;
};
const number = (index: number) => String(index + 1).padStart(2, '0');
const shortTitle = (title: string) =>
  title.replace(/（按需）|（按来料）|（下游）|按需|必要的/g, '').trim();
// The track-line sample excludes pale background and floor shadows within each zone.
const BODY_HIGHLIGHT_CUTOFF = 215;

function ProcessActionIcon({ title }: { title: string }) {
  if (/检验|记录|识别|核对|确认|放行/.test(title))
    return <HiOutlineClipboardDocumentCheck aria-hidden="true" />;
  if (/转移|转出|交接|取放|下料|装料|上料|输送|收线/.test(title))
    return <HiOutlineArrowsRightLeft aria-hidden="true" />;
  if (/加热|升温|均温|保温|固溶|固化|回火/.test(title)) return <HiOutlineFire aria-hidden="true" />;
  if (/淬火|冷却|清洗|沥液|排液/.test(title))
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M3 6c3 4 6-4 9 0s6-4 9 0M3 12c3 4 6-4 9 0s6-4 9 0M3 18c3 4 6-4 9 0s6-4 9 0" />
      </svg>
    );
  return <HiOutlineCog6Tooth aria-hidden="true" />;
}

export function ProductionLineProcess({ pageId, image, process, model, steps }: Props) {
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(Math.min(model?.initial ?? 0, steps.length - 1));
  const imageScroll = useRef<HTMLDivElement>(null);
  const keepImagePosition = useRef(false);
  const timeline = useRef<HTMLOListElement>(null);
  const current = steps[selected];
  const imageMatches = Boolean(image && model && image.src.split('/').at(-1) === model.imageFile);
  const zones = imageMatches
    ? (model?.zones ?? []).filter((zone) => steps.some((item) => item.zone === zone.id))
    : [];
  const activeZone = zones.find((zone) => zone.id === current?.zone);
  const activeOutlines = activeZone && getProcessAnnotation(pageId, activeZone).outlines;
  const detailsId = `${pageId}-process-explanation`;
  const cell = process.mode === 'cell';
  const bodyHighlight = pageId === 'track-shoe-press-quench-line';
  const hitPixels = useRef<ImageData | null>(null);
  const maskId = `${pageId}-equipment-pixels`;

  useEffect(() => {
    hitPixels.current = null;
    if (!bodyHighlight || !imageMatches || !image) return;
    const source = new window.Image();
    let cancelled = false;
    source.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = source.naturalWidth;
      canvas.height = source.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.drawImage(source, 0, 0);
      hitPixels.current = context.getImageData(0, 0, canvas.width, canvas.height);
    };
    source.src = image.src;
    return () => {
      cancelled = true;
      source.onload = null;
    };
  }, [bodyHighlight, imageMatches, image]);

  useEffect(() => setReady(true), []);
  useEffect(() => {
    const viewport = imageScroll.current;
    const list = timeline.current;
    if (!list) return;
    const reveal = () => {
      if (viewport && activeZone && !keepImagePosition.current) {
        viewport.scrollTo({
          left:
            (viewport.scrollWidth * (activeZone.box[0] + activeZone.box[2] / 2)) / 100 -
            viewport.clientWidth / 2,
          behavior: 'instant',
        });
      }
      const item = list.children[selected] as HTMLElement | undefined;
      if (item)
        list.scrollTo({
          left: item.offsetLeft - list.offsetLeft - (list.clientWidth - item.offsetWidth) / 2,
          behavior: 'instant',
        });
    };
    reveal();
    let imageWidth = viewport?.clientWidth;
    const observer = new ResizeObserver(() => {
      if (viewport?.clientWidth !== imageWidth) keepImagePosition.current = false;
      imageWidth = viewport?.clientWidth;
      reveal();
    });
    if (viewport) observer.observe(viewport);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeZone, selected]);

  function select(index: number, preserveImagePosition = false) {
    keepImagePosition.current = preserveImagePosition;
    setSelected(index);
  }

  if (!current) return null;
  return (
    <div
      className={styles.explorer}
      data-process-explorer={pageId}
      data-process-ready={ready ? '' : undefined}
    >
      <div className={styles.intro}>
        <h2>{process.routes?.[0]?.title ?? process.title}</h2>
        <p>
          <HiOutlineMapPin aria-hidden="true" />
          指向设备或点选工序，查看位置与处理动作
        </p>
      </div>
      {image && (
        <figure className={styles.figure}>
          <p className={styles.mobileHint}>左右滑动查看整线，或点选下方工序定位</p>
          <div
            className={styles.imageScroll}
            ref={imageScroll}
            data-bottom-labels={cell || pageId === 'aluminum-solution-aging-line' ? '' : undefined}
            tabIndex={0}
            role="region"
            aria-label="设备工序对应图，可左右滚动"
          >
            <div
              className={styles.canvas}
              data-compact={image.width / image.height < 2 ? '' : undefined}
              style={{ '--image-aspect': image.width / image.height } as CSSProperties}
            >
              <ProductionLineImage
                photo={image}
                alt={process.imageAlt ?? image.alt}
                className={styles.photo}
                sizes="(max-width: 767px) 800px, (max-width: 1359px) calc(100vw - 80px), 1280px"
              />
              <svg
                className={styles.overlay}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {bodyHighlight && imageMatches && (
                  <defs>
                    <filter id={`${maskId}-filter`} colorInterpolationFilters="sRGB">
                      <feColorMatrix
                        type="matrix"
                        values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -2.5512 -8.5824 -0.8664 0 ${(BODY_HIGHLIGHT_CUTOFF / 255) * 12}`}
                      />
                    </filter>
                    <mask
                      id={maskId}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="100"
                      height="100"
                      style={{ maskType: 'alpha' }}
                    >
                      <image
                        href={image.src}
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        preserveAspectRatio="none"
                        filter={`url(#${maskId}-filter)`}
                      />
                    </mask>
                  </defs>
                )}
                {activeZone &&
                  activeOutlines?.map((outline, part) => (
                    <polygon
                      key={`${activeZone.id}-${part}`}
                      data-active-zone={activeZone.id}
                      className={styles.highlight}
                      data-body-highlight={bodyHighlight ? '' : undefined}
                      mask={bodyHighlight ? `url(#${maskId})` : undefined}
                      points={outline.map((point) => point.join(',')).join(' ')}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                {zones.map((zone) => {
                  const annotation = getProcessAnnotation(pageId, zone);
                  return (
                    <line
                      key={zone.id}
                      className={styles.leader}
                      data-active={activeZone?.id === zone.id ? '' : undefined}
                      x1={annotation.label[0]}
                      x2={annotation.pin[0]}
                      y1={annotation.label[1]}
                      y2={annotation.pin[1]}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
                {zones.map((zone) => {
                  const outlines = getProcessAnnotation(pageId, zone).outlines;
                  const hitProps = {
                    className: styles.deviceHitArea,
                    'data-device-zone': zone.id,
                    onPointerMove: (event: React.PointerEvent<SVGElement>) => {
                      if (
                        ready &&
                        event.pointerType === 'mouse' &&
                        window.matchMedia('(hover: hover) and (pointer: fine)').matches
                      ) {
                        if (bodyHighlight) {
                          const pixels = hitPixels.current;
                          const bounds =
                            event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                          if (!pixels || !bounds) return;
                          const x = Math.min(
                            pixels.width - 1,
                            Math.max(
                              0,
                              Math.floor(
                                ((event.clientX - bounds.left) / bounds.width) * pixels.width,
                              ),
                            ),
                          );
                          const y = Math.min(
                            pixels.height - 1,
                            Math.max(
                              0,
                              Math.floor(
                                ((event.clientY - bounds.top) / bounds.height) * pixels.height,
                              ),
                            ),
                          );
                          const offset = (y * pixels.width + x) * 4;
                          const brightness =
                            pixels.data[offset] * 0.2126 +
                            pixels.data[offset + 1] * 0.7152 +
                            pixels.data[offset + 2] * 0.0722;
                          if (!pixels.data[offset + 3] || brightness >= BODY_HIGHLIGHT_CUTOFF)
                            return;
                        }
                        const index = steps.findIndex((item) => item.zone === zone.id);
                        if (index >= 0 && current.zone !== zone.id) select(index, true);
                      }
                    },
                  };
                  return outlines?.map((outline, part) => (
                    <polygon
                      key={`${zone.id}-${part}`}
                      {...hitProps}
                      points={outline.map((point) => point.join(',')).join(' ')}
                    />
                  ));
                })}
              </svg>
              {zones.map((zone) => {
                const indices = steps.flatMap((item, index) =>
                  item.zone === zone.id ? [index] : [],
                );
                const active = zone.id === activeZone?.id;
                const annotation = getProcessAnnotation(pageId, zone);
                return (
                  <Fragment key={zone.id}>
                    <button
                      type="button"
                      disabled={!ready}
                      className={styles.hotspot}
                      style={{ left: `${annotation.label[0]}%`, top: `${annotation.label[1]}%` }}
                      data-align-end={
                        annotation.align === 'end' || annotation.label[0] > 86 ? '' : undefined
                      }
                      data-active={active ? '' : undefined}
                      aria-pressed={active}
                      aria-controls={detailsId}
                      aria-label={`查看${zone.label}对应工序`}
                      onClick={() => select(active ? selected : indices[0])}
                      onPointerMove={(event) => {
                        if (
                          event.pointerType === 'mouse' &&
                          window.matchMedia('(min-width: 1051px) and (hover: hover)').matches
                        )
                          select(active ? selected : indices[0]);
                      }}
                    >
                      <span className={styles.hotspotNumber}>
                        {number(active ? selected : indices[0])}
                      </span>
                      <span className={styles.hotspotLabel}>
                        {zone.label}
                        {indices.length > 1 && (
                          <small>{indices.map(number).join(' / ')} 共用</small>
                        )}
                      </span>
                    </button>
                    <span
                      className={styles.pin}
                      data-active={active ? '' : undefined}
                      aria-hidden="true"
                      style={{
                        left: `${annotation.pin[0]}%`,
                        top: `${annotation.pin[1]}%`,
                      }}
                    />
                  </Fragment>
                );
              })}
            </div>
          </div>
        </figure>
      )}
      <ol
        className={styles.timeline}
        ref={timeline}
        aria-label="工序顺序，点选查看说明"
        style={{ '--step-count': steps.length } as CSSProperties}
      >
        {steps.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              disabled={!ready}
              data-process-step={index + 1}
              className={styles.step}
              data-active={selected === index ? '' : undefined}
              data-optional={item.optional ? '' : undefined}
              aria-pressed={selected === index}
              aria-controls={detailsId}
              onClick={() => select(index)}
              onFocus={() => select(index)}
              onPointerMove={(event) => {
                if (
                  event.pointerType === 'mouse' &&
                  window.matchMedia('(min-width: 1051px) and (hover: hover)').matches
                )
                  select(index);
              }}
            >
              <span className={styles.stepNumber}>{number(index)}</span>
              <span className={styles.stepCaption}>
                <span className={styles.stepTitle}>{shortTitle(item.title)}</span>
                {item.optional && <span className={styles.optional}>按需</span>}
              </span>
            </button>
            {index < steps.length - 1 && <span className={styles.connector} aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <div
        className={styles.detail}
        id={detailsId}
        role="region"
        aria-label="当前工序说明"
        aria-live="polite"
        aria-atomic="true"
        data-selected-step={selected + 1}
      >
        <div key={current.id} className={styles.detailCopy}>
          <div className={styles.detailHeading}>
            <span>{number(selected)}</span>
            <h4>{shortTitle(current.title)}</h4>
            {current.optional && <span className={styles.optional}>按需配置</span>}
            <span className={styles.detailReference}>
              {activeZone ? '对应上图高亮区域' : '图外工序或交接'}
            </span>
          </div>
          <p className={styles.detailDescription}>{current.description}</p>
          <p className={styles.location}>
            {activeZone ? `对应设备：${activeZone.label}` : '图外工序或交接环节'}
          </p>
        </div>
        <div className={styles.sequence} aria-label="本步处理动作示意">
          <div className={styles.action}>
            <span className={styles.actionIcon}>
              <HiOutlineArrowLeftOnRectangle className={styles.entryIcon} aria-hidden="true" />
            </span>
            <span>{activeZone ? '进入本段' : '开始本步'}</span>
          </div>
          <HiArrowRight className={styles.actionArrow} aria-hidden="true" />
          <div className={styles.action} data-current="">
            <span className={styles.actionIcon}>
              <ProcessActionIcon title={current.title} />
            </span>
            <span>{current.title === '淬火' ? '按工艺冷却' : shortTitle(current.title)}</span>
          </div>
          <HiArrowRight className={styles.actionArrow} aria-hidden="true" />
          <div className={styles.action}>
            <span className={styles.actionIcon}>
              <HiOutlineArrowRightOnRectangle aria-hidden="true" />
            </span>
            <span>{selected < steps.length - 1 ? '转入后续工序' : '按约定交接'}</span>
          </div>
        </div>
      </div>
      <details className={styles.conditions} data-process-conditions>
        <summary>
          <span className={styles.keyCondition}>
            {model?.movement ?? '具体工艺按材料、型号及性能要求确认。'}
          </span>
          <span className={styles.conditionsTrigger}>
            查看工艺条件与适用限制
            <HiChevronDown aria-hidden="true" />
          </span>
        </summary>
        <div className={styles.conditionsBody}>
          {process.subtitle && <p>{process.subtitle}</p>}
          {process.routes?.[0]?.note && <p>{process.routes[0].note}</p>}
          {process.note && <p>{process.note}</p>}
          <p>{current.locationNote ?? '高亮表示功能区域，具体设备与布置按方案确定。'}</p>
        </div>
      </details>
      {(process.routes?.slice(1) ?? []).map((route) => (
        <details className={styles.alternative} key={route.title}>
          <summary>
            <span>{route.title}</span>
            <span className={styles.expandHint}>
              查看路线
              <HiChevronDown aria-hidden="true" />
            </span>
          </summary>
          <div className={styles.alternativeBody}>
            <p>
              {pageId === 'forging-waste-heat-qt-line'
                ? '未满足放行条件时，按以下路线隔离与复核。'
                : '以下路线单独评估，不与上图设备位置逐一对应。'}
            </p>
            <ol>
              {route.steps.map((item, index) => (
                <li key={`${index}-${item}`}>
                  <span>{number(index)}</span>
                  {item}
                  {index < route.steps.length - 1 && <HiArrowRight aria-hidden="true" />}
                </li>
              ))}
            </ol>
            <p>{route.note}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
