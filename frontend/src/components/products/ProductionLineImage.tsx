import Image from 'next/image';
import type { LineImage } from '@/lib/production-line-types';

/** Keep original files for previews; opt in to the site's responsive image optimizer. */
export function ProductionLineImage({
  photo,
  alt,
  className,
  sizes,
  priority = false,
  original = false,
}: {
  photo: LineImage;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  original?: boolean;
}) {
  return (
    <Image
      src={photo.src}
      width={photo.width}
      height={photo.height}
      alt={alt ?? photo.alt}
      className={className}
      sizes={original ? undefined : sizes}
      unoptimized={original || !photo.optimized}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
    />
  );
}
