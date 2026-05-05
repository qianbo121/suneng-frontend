'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { buildImageAlt } from '@/lib/seo';
import { StrengthDisplayCard, StrengthDisplayMode } from '@/types/strength';
import { Locale } from '@/types/site';

const ImageLightbox = dynamic(
  () => import('@/components/ui/ImageLightbox').then((module) => ({ default: module.ImageLightbox })),
  { ssr: false },
);

type StrengthGalleryGridProps = {
  locale: Locale;
  items: StrengthDisplayCard[];
  displayMode: StrengthDisplayMode;
};

export function StrengthGalleryGrid({
  locale,
  items,
  displayMode,
}: StrengthGalleryGridProps) {
  const [lightboxState, setLightboxState] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  if (!items.length) {
    return (
      <EmptyState
        title={locale === 'en' ? 'No content available' : '暂无展示内容'}
        description={
          locale === 'en'
            ? 'The current strength category has no published content yet.'
            : '当前实力分类下还没有已发布内容。'
        }
      />
    );
  }

  const isCertificateMode = displayMode !== 'strength-item';

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => {
          const wide = !isCertificateMode && index % 5 === 0;

          return (
            <article
              key={`${item.sourceType}-${item.id}`}
              className={wide ? 'xl:col-span-2' : ''}
            >
              <button
                type="button"
                onClick={() => setLightboxState({ images: item.gallery, index: 0 })}
                className="group h-full w-full overflow-hidden border border-[#e8ebf0] bg-white text-left transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(14,33,60,0.08)]"
              >
                <div className={wide ? 'grid lg:grid-cols-[1.1fr_0.9fr]' : ''}>
                  <div className="relative aspect-[16/11] overflow-hidden bg-[#f3f5f8]">
                    <Image
                      src={item.image}
                      alt={buildImageAlt(locale, item.title, item.summary)}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-5 py-5 lg:px-6 lg:py-6">
                    <p className="text-[12px] uppercase tracking-[0.24em] text-brand-accent">
                      {isCertificateMode
                        ? locale === 'en'
                          ? 'Certificate'
                          : '证书展示'
                        : locale === 'en'
                          ? 'Strength'
                          : '企业实力'}
                    </p>
                    <h2 className="mt-4 text-[22px] font-semibold leading-8 text-[#202020]">
                      {item.title}
                    </h2>
                    <p className="mt-4 line-clamp-4 text-sm leading-7 text-neutral-700">
                      {item.summary}
                    </p>
                    <p className="mt-5 text-sm font-medium text-brand-primary">
                      {locale === 'en' ? 'Click to enlarge »' : '点击查看大图 »'}
                    </p>
                  </div>
                </div>
              </button>
            </article>
          );
        })}
      </div>

      <ImageLightbox
        images={lightboxState?.images ?? []}
        isOpen={Boolean(lightboxState)}
        initialIndex={lightboxState?.index ?? 0}
        onClose={() => setLightboxState(null)}
      />
    </>
  );
}
