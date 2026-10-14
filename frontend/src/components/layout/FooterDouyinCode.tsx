'use client';

const FOOTER_DOUYIN_CLIP_ID = 'suneng-footer-douyin-code-clip';
const ORIGINAL_WIDTH = 1219;
const ORIGINAL_HEIGHT = 1820;
const CROP_SIZE = 808;

/** Keep the original pixels and crop; a native lazy image does not delay page load. */
export function FooterDouyinCode({ label }: { label: string }) {
  return (
    <span data-douyin-code className="relative block h-full w-full overflow-hidden">
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <clipPath id={FOOTER_DOUYIN_CLIP_ID} clipPathUnits="objectBoundingBox">
            <ellipse cx={609 / ORIGINAL_WIDTH} cy={650 / ORIGINAL_HEIGHT}
              rx={388 / ORIGINAL_WIDTH} ry={388 / ORIGINAL_HEIGHT} />
            <ellipse cx={846 / ORIGINAL_WIDTH} cy={414 / ORIGINAL_HEIGHT}
              rx={91 / ORIGINAL_WIDTH} ry={91 / ORIGINAL_HEIGHT} />
          </clipPath>
        </defs>
      </svg>
      {/* Preserve code pixels without lossy image optimization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/footer/douyin-code-original-20260907.png"
        alt={label}
        width={ORIGINAL_WIDTH}
        height={ORIGINAL_HEIGHT}
        loading="lazy"
        decoding="async"
        className="absolute max-w-none"
        style={{
          width: `${ORIGINAL_WIDTH / CROP_SIZE * 100}%`,
          height: 'auto',
          left: `${-208 / CROP_SIZE * 100}%`,
          top: `${-248 / CROP_SIZE * 100}%`,
          clipPath: `url(#${FOOTER_DOUYIN_CLIP_ID})`,
        }}
      />
    </span>
  );
}
