'use client';

import Image from 'next/image';
import { useState } from 'react';

import { NEWS_FALLBACK_IMAGE } from '@/constants/news';
import { getReviewedEnglishNewsCover } from '@/lib/english-news-presentation';

const reviewedPressureCover = getReviewedEnglishNewsCover(
  'atmosphere-furnace-pressure-fluctuation-process-or-equipment',
);

type NewsCardImageProps = {
  src: string;
  alt: string;
  priority: boolean;
  sizes: string;
};

export function NewsCardImage({ src, alt, priority, sizes }: NewsCardImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || NEWS_FALLBACK_IMAGE);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      style={currentSrc === reviewedPressureCover ? { objectFit: 'contain' } : undefined}
      onError={() => {
        if (currentSrc !== NEWS_FALLBACK_IMAGE) {
          setCurrentSrc(NEWS_FALLBACK_IMAGE);
        }
      }}
    />
  );
}
