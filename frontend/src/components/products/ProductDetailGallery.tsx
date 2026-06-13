'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

import { buildProductImageAlt } from '@/lib/seo';
import { Locale } from '@/types/site';

type ProductDetailGalleryProps = {
  locale: Locale;
  images: string[];
  title: string;
  fillMode?: 'contain' | 'cover-left';
};

export function ProductDetailGallery({ locale, images, title, fillMode = 'contain' }: ProductDetailGalleryProps) {
  const safeImages = images.length ? images : ['/images/products/trolley-furnace/gallery/trolley-01.png'];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = safeImages[activeIndex] || safeImages[0];
  const mainImageClassName = fillMode === 'cover-left' ? 'object-cover object-left' : 'object-contain';
  const activeDescriptor = activeIndex === 0
    ? (locale === 'en' ? 'main product image' : '产品主图')
    : locale === 'en'
      ? `product image ${activeIndex + 1}`
      : `产品图 ${activeIndex + 1}`;

  const goPrev = () => {
    setActiveIndex((current) => (current === 0 ? safeImages.length - 1 : current - 1));
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % safeImages.length);
  };

  return (
    // 产品图册：缩略图和切换箭头悬浮在主图容器内部，不再占用额外垂直空间。
    <div className="w-full min-w-0 lg:w-[480px] lg:shrink-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] border border-[#eef0f3] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <Image src={activeImage} alt={buildProductImageAlt(locale, title, activeDescriptor)} fill priority className={mainImageClassName} sizes="480px" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 to-transparent" />

        <div className="absolute bottom-[11px] left-1/2 z-10 max-w-[calc(100%-32px)] -translate-x-1/2 overflow-x-auto rounded-[10px] bg-white/90 px-2 py-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex min-w-max items-center justify-center gap-[8px]">
            {safeImages.length > 1 ? (
              <button
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#6b7280] shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition hover:bg-white hover:text-[#1f2937]"
                type="button"
                aria-label="上一张"
                onClick={goPrev}
              >
                <HiChevronLeft className="h-[14px] w-[14px]" />
              </button>
            ) : null}

            {safeImages.map((image, index) => {
              const isActive = index === activeIndex;
              const thumbClassName =
                fillMode === 'cover-left'
                  ? `relative h-[25px] w-[34px] shrink-0 overflow-hidden rounded-[4px] bg-transparent transition hover:-translate-y-[1px] hover:shadow-[0_4px_10px_rgba(15,23,42,0.10)] md:h-[36px] md:w-[48px] ${
                      isActive ? 'ring-2 ring-[#e60012] ring-offset-0 shadow-[0_4px_12px_rgba(230,0,18,0.18)]' : ''
                    }`
                  : `relative h-[25px] w-[34px] shrink-0 overflow-hidden rounded-[4px] border bg-white transition hover:-translate-y-[1px] hover:border-[#9ca3af] hover:shadow-[0_4px_10px_rgba(15,23,42,0.10)] md:h-[36px] md:w-[48px] ${
                      isActive ? 'border-2 border-[#e60012] shadow-[0_4px_12px_rgba(230,0,18,0.18)]' : 'border-gray-200'
                    }`;

              return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`切换到第 ${index + 1} 张产品图`}
                aria-current={isActive ? 'true' : undefined}
                className={thumbClassName}
              >
                <Image
                  src={image}
                  alt={locale === 'en' ? `Product thumbnail ${index + 1}` : `产品缩略图 ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </button>
              );
            })}

            {safeImages.length > 1 ? (
              <button
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#6b7280] shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition hover:bg-white hover:text-[#1f2937]"
                type="button"
                aria-label="下一张"
                onClick={goNext}
              >
                <HiChevronRight className="h-[14px] w-[14px]" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
