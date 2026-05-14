'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { buildImageAlt, buildIndexedImageAlt } from '@/lib/seo';
import { DeliveryGalleryCard } from '@/types/service-support';
import { Locale } from '@/types/site';

const ImageLightbox = dynamic(
  () => import('@/components/ui/ImageLightbox').then((module) => ({ default: module.ImageLightbox })),
  { ssr: false },
);

type DeliveryGalleryProps = {
  locale: Locale;
  items: DeliveryGalleryCard[];
};

function formatDate(date?: string | null, locale: Locale = 'zh') {
  if (!date) return '';

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';

  if (locale === 'en') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(value);
  }

  return `${value.getFullYear()}年${String(value.getMonth() + 1).padStart(2, '0')}月${String(
    value.getDate(),
  ).padStart(2, '0')}日`;
}

export function DeliveryGallery({ locale, items }: DeliveryGalleryProps) {
  const [lightboxState, setLightboxState] = useState<{
    images: string[];
    imageAlts: string[];
    index: number;
  } | null>(null);

  if (!items.length) {
    return (
      <EmptyState
        title={locale === 'en' ? 'No delivery gallery available' : '暂无交车现场图集'}
        description={
          locale === 'en'
            ? 'Delivery scene data has not been configured yet.'
            : '当前还没有配置交车现场图集数据。'
        }
      />
    );
  }

  return (
    <>
      <section>
        <div className="mb-8">
          <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">
            {locale === 'en' ? 'Delivery Scenes' : '交车现场'}
          </p>
          <h2 className="mt-3 text-[30px] font-semibold text-[#202020]">
            {locale === 'en' ? 'Project Delivery Gallery' : '项目交付图集'}
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const wide = index % 5 === 0;
            const imageAlt = buildImageAlt(locale, item.title, item.description);
            const imageAlts = item.images.map((_, galleryIndex) => buildIndexedImageAlt(locale, imageAlt, galleryIndex));

            return (
              <article key={item.id} className={wide ? 'xl:col-span-2' : ''}>
                <button
                  type="button"
                  onClick={() => setLightboxState({ images: item.images, imageAlts, index: 0 })}
                  className="group h-full w-full overflow-hidden border border-[#e8ebf0] bg-white text-left transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(14,33,60,0.08)]"
                >
                  <div className={wide ? 'grid lg:grid-cols-[1.08fr_0.92fr]' : ''}>
                    <div className="relative aspect-[16/11] overflow-hidden bg-[#edf2f7]">
                      <Image
                        src={item.image}
                        alt={imageAlt}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes={wide ? '(min-width: 1280px) 560px, (min-width: 768px) 50vw, 100vw' : '(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw'}
                      />
                    </div>
                    <div className="px-6 py-6">
                      {item.date ? (
                        <p className="text-[12px] uppercase tracking-[0.22em] text-neutral-400">
                          {formatDate(item.date, locale)}
                        </p>
                      ) : null}
                      <h3 className="mt-3 text-[22px] font-semibold leading-8 text-[#202020]">
                        {item.title}
                      </h3>
                      <p className="mt-4 line-clamp-4 text-sm leading-7 text-neutral-700">
                        {item.description}
                      </p>
                      <p className="mt-5 text-sm font-medium text-brand-primary">
                        {locale === 'en' ? 'Open Gallery »' : '打开图集 »'}
                      </p>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <ImageLightbox
        images={lightboxState?.images ?? []}
        imageAlts={lightboxState?.imageAlts ?? []}
        isOpen={Boolean(lightboxState)}
        initialIndex={lightboxState?.index ?? 0}
        onClose={() => setLightboxState(null)}
      />
    </>
  );
}
