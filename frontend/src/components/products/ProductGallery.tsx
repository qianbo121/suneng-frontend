'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { HiArrowLongLeft, HiArrowLongRight } from 'react-icons/hi2';

import { buildImageAlt } from '@/lib/seo';

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

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
                <Image src={image} alt={buildImageAlt('zh', `${alt} ${index + 1}`, alt)} fill className="object-cover" />
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
              <Image src={image} alt={buildImageAlt('zh', `${alt} thumbnail ${index + 1}`, alt)} fill className="object-cover" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
