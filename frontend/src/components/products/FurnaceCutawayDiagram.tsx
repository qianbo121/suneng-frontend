import Image from 'next/image';

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

export function FurnaceCutawayDiagram({
  furnaceName,
  image,
  callouts,
  pitCompatibility = false,
  markerLabels = false,
}: FurnaceCutawayDiagramProps) {
  if (markerLabels) {
    return (
      <figure className={styles.cutawayFigure}>
        <div className={styles.cutawayMarkerStage} data-furnace-cutaway-stage={furnaceName}>
          <Image
            src={image.src}
            unoptimized={image.unoptimized}
            alt={image.alt}
            fill
            sizes="(min-width: 1100px) 650px, 100vw"
            className={styles.cutawayImage}
            data-furnace-cutaway-image={furnaceName}
          />
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
        <ol className={styles.cutawayMarkerLegend} aria-label={`${furnaceName}结构标注`}>
          {callouts.map(({ target, label }, index) => (
            <li key={target} data-furnace-cutaway-target={target}>
              <span className={styles.cutawayLabelNumber} aria-hidden="true">
                {index + 1}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
        <figcaption>{image.caption}</figcaption>
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
          <Image
            src={image.src}
            unoptimized={image.unoptimized}
            alt={image.alt}
            fill
            sizes="(min-width: 1100px) 650px, 100vw"
            className={styles.cutawayImage}
            data-furnace-cutaway-image={furnaceName}
            {...(pitCompatibility ? { 'data-pit-cutaway-image': true } : {})}
          />
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

        <ol className={styles.cutawayLabels} aria-label={`${furnaceName}结构标注`}>
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
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}
