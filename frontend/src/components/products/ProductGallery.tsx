'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { HiArrowLongLeft, HiArrowLongRight } from 'react-icons/hi2';

import { buildProductImageAlt } from '@/lib/seo';
import { Locale } from '@/types/site';

type ProductGalleryProps = {
  locale: Locale;
  images: string[];
  alt: string;
  imageDescriptions?: string[];
};

export function ProductGallery({ locale, images, alt, imageDescriptions = [] }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const imageLabel = (index: number) => imageDescriptions[index] || (locale === 'en' ? `product image ${index + 1}` : `产品图 ${index + 1}`);
  const thumbnailLabel = (index: number) => locale === 'en' ? `thumbnail ${index + 1}` : `缩略图 ${index + 1}`;

  return (
    <div className="product-gallery">
      <div className="relative overflow-hidden border border-[#e6eaf0] bg-[#f5f7fa]">
        <Swiper
          modules={[Navigation, Thumbs]}
          navigation={{
            prevEl: '.product-gallery-prev',
            nextEl: '.product-gallery-next',
          }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          className="aspect-[4/3]"
        >
          {images.map((image, index) => (
            <SwiperSlide key={`${image}-${index}`}>
              <div className="relative h-full w-full">
                <Image src={image} alt={buildProductImageAlt(locale, alt, imageLabel(index))} fill className="object-cover" sizes="(min-width: 1024px) 640px, 100vw" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          className="product-gallery-prev absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur transition hover:bg-black/35"
          aria-label="Previous image"
        >
          <HiArrowLongLeft className="text-xl" />
        </button>
        <button
          type="button"
          className="product-gallery-next absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur transition hover:bg-black/35"
          aria-label="Next image"
        >
          <HiArrowLongRight className="text-xl" />
        </button>
      </div>
      <Swiper
        modules={[FreeMode, Thumbs]}
        onSwiper={setThumbsSwiper}
        watchSlidesProgress
        freeMode
        spaceBetween={12}
        slidesPerView={4}
        breakpoints={{
          640: { slidesPerView: 4.2 },
          1024: { slidesPerView: 4 },
        }}
        className="mt-4"
      >
        {images.map((image, index) => (
          <SwiperSlide key={`${image}-thumb-${index}`}>
            <div className="relative aspect-[4/3] cursor-pointer overflow-hidden border border-[#e6eaf0] bg-[#f5f7fa]">
              <Image src={image} alt={buildProductImageAlt(locale, alt, thumbnailLabel(index))} fill className="object-cover" sizes="160px" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
