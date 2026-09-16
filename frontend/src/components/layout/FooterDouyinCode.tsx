'use client';

import { useId } from 'react';

/** Display-only cutout: retain the original Douyin code pixels, never redraw the code. */
export function FooterDouyinCode({ label }: { label: string }) {
  const clipId = useId();

  return (
    <svg
      data-douyin-code
      role="img"
      aria-label={label}
      viewBox="208 248 808 808"
      width="124"
      height="124"
      className="h-full w-full"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="609" cy="650" r="388" />
          <circle cx="846" cy="414" r="91" />
        </clipPath>
      </defs>
      <image
        href="/images/footer/douyin-code-original-20260907.png"
        width="1219"
        height="1820"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}
