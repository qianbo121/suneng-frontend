'use client';

import Image from 'next/image';
import { useState } from 'react';

import { NEWS_FALLBACK_IMAGE } from '@/constants/news';

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
      onError={() => {
        if (currentSrc !== NEWS_FALLBACK_IMAGE) {
          setCurrentSrc(NEWS_FALLBACK_IMAGE);
        }
      }}
    />
  );
}
