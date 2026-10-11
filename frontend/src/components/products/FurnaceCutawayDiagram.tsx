'use client';

import Image from 'next/image';
import { useState } from 'react';

import styles from './PitFurnaceDetailPage.module.css';

export type FurnaceCutawayLabelPosition =
  | 'leftTop'
  | 'leftMiddle'
  | 'leftBottom'
  | 'rightTop'
  | 'rightMiddle'
  | 'rightBottom';

export type FurnaceCutawayCallout = {
  target: string;
  label: string;
  position: FurnaceCutawayLabelPosition;
  line: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
};

type FurnaceCutawayDiagramProps = {
  locale?: 'zh' | 'en';
  furnaceName: string;
  image: {
    src: string;
    alt: string;
    caption: string;
    unoptimized?: boolean;
  };
  callouts: readonly FurnaceCutawayCallout[];
  pitCompatibility?: boolean;
  markerLabels?: boolean;
};

const positionClasses: Record<FurnaceCutawayLabelPosition, string> = {
  leftTop: styles.cutawayLabelLeftTop,
  leftMiddle: styles.cutawayLabelLeftMiddle,
  leftBottom: styles.cutawayLabelLeftBottom,
  rightTop: styles.cutawayLabelRightTop,
  rightMiddle: styles.cutawayLabelRightMiddle,
  rightBottom: styles.cutawayLabelRightBottom,
};

function CutawayImage({
  image,
  furnaceName,
  locale,
  pitCompatibility = false,
}: {
  image: FurnaceCutawayDiagramProps['image'];
  furnaceName: string;
  locale: 'zh' | 'en';
  pitCompatibility?: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const separator = image.src.includes('?') ? '&' : '?';
  const source = attempt ? `${image.src}${separator}retry=${attempt}` : image.src;

  return (
    <>
      <Image
        key={source}
        src={source}
        unoptimized={image.src.endsWith('.svg') && image.unoptimized}
        alt={image.alt}
        fill
        sizes="(max-width: 640px) calc(100vw - 64px), (min-width: 1100px) 650px, 100vw"
        className={styles.cutawayImage}
        data-furnace-cutaway-image={furnaceName}
        {...(pitCompatibility ? { 'data-pit-cutaway-image': true } : {})}
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('error')}
      />
      {status !== 'ready' && (
        <div className={styles.cutawayImageStatus} role="status" aria-live="polite">
          <span>{status === 'error'
            ? locale === 'en' ? 'The diagram did not load. Retry or view the original below.' : '结构图暂未加载，可重试或查看下方原图。'
            : locale === 'en' ? 'Loading structural diagram…' : '结构示意图加载中…'}</span>
          {status === 'error' && (
            <button type="button" onClick={() => {
              setStatus('loading');
              setAttempt((value) => value + 1);
            }}>
              {locale === 'en' ? 'Retry diagram' : '重新加载结构图'}
            </button>
          )}
        </div>
      )}
    </>
  );
}

function CutawayCaption({ image, locale }: { image: FurnaceCutawayDiagramProps['image']; locale: 'zh' | 'en' }) {
  return (
    <figcaption>
      {image.caption}
      <br />
      <a className={styles.cutawayOriginalLink} href={image.src} target="_blank" rel="noopener noreferrer">
        {locale === 'en' ? 'View original image' : '查看原图'}
      </a>
    </figcaption>
  );
}

export function FurnaceCutawayDiagram({
  furnaceName,
  locale = 'zh',
  image,
  callouts,
  pitCompatibility = false,
  markerLabels = false,
}: FurnaceCutawayDiagramProps) {
  if (markerLabels) {
    return (
      <figure className={styles.cutawayFigure}>
        <div className={styles.cutawayMarkerStage} data-furnace-cutaway-stage={furnaceName}>
          <CutawayImage image={image} furnaceName={furnaceName} locale={locale} />
          <svg
            className={styles.cutawayMarkerOverlay}
            viewBox="0 0 100 75"
            aria-hidden="true"
            focusable="false"
          >
            {callouts.map(({ target, line }, index) => (
              <g key={target} data-furnace-cutaway-marker={target}>
                <circle
                  cx={line.x2}
                  cy={line.y2}
                  r="1.6"
                  fill="#0f4f86"
                  stroke="#fff"
                  strokeWidth="0.25"
                />
                <text
                  x={line.x2}
                  y={line.y2}
                  dy="0.35em"
                  textAnchor="middle"
                  fontSize="2"
                  fontWeight="700"
                  fill="#fff"
                >
                  {index + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <ol className={styles.cutawayMarkerLegend} aria-label={locale === 'en' ? `${furnaceName} structure labels` : `${furnaceName}结构标注`}>
          {callouts.map(({ target, label }, index) => (
            <li key={target} data-furnace-cutaway-target={target}>
              <span className={styles.cutawayLabelNumber} aria-hidden="true">
                {index + 1}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
        <CutawayCaption image={image} locale={locale} />
      </figure>
    );
  }

  return (
    <figure className={styles.cutawayFigure}>
      <div
        className={styles.cutawayStage}
        data-furnace-cutaway-stage={furnaceName}
        {...(pitCompatibility ? { 'data-pit-cutaway-stage': true } : {})}
      >
        <div className={styles.cutawayImageFrame}>
          <CutawayImage image={image} furnaceName={furnaceName} locale={locale} pitCompatibility={pitCompatibility} />
        </div>

        <svg
          className={styles.cutawayLeaders}
          viewBox="0 0 100 75"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {callouts.map(({ label, line }) => (
            <g key={label}>
              <line
                {...line}
                className={styles.cutawayLeaderLine}
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={line.x2} cy={line.y2} r="0.45" className={styles.cutawayLeaderDot} />
            </g>
          ))}
        </svg>

        <ol className={styles.cutawayLabels} aria-label={locale === 'en' ? `${furnaceName} structure labels` : `${furnaceName}结构标注`}>
          {callouts.map(({ label, position, target }, index) => (
            <li
              key={label}
              className={`${styles.cutawayLabel} ${positionClasses[position]}`}
              data-furnace-cutaway-label={index + 1}
              data-furnace-cutaway-target={target}
              {...(pitCompatibility
                ? {
                    'data-pit-cutaway-label': index + 1,
                    'data-pit-cutaway-target': target,
                  }
                : {})}
            >
              <span
                className={styles.cutawayLabelNumber}
                data-furnace-cutaway-number
                {...(pitCompatibility ? { 'data-pit-cutaway-number': true } : {})}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span
                data-furnace-cutaway-label-text
                {...(pitCompatibility ? { 'data-pit-cutaway-label-text': true } : {})}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <CutawayCaption image={image} locale={locale} />
    </figure>
  );
}
