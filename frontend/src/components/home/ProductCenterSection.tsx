'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Locale } from '@/types/site';

type ProductCenterSectionProps = {
  locale: Locale;
};

type ProductCenterCard = {
  id: number;
  en: string;
  zh: string;
  image: string;
  slug: string;
};

const productCenterCards: ProductCenterCard[] = [
  { id: 1, en: 'BOX FURNACE', zh: '箱式炉', image: '/images/home/product-center/box-furnace-real.png', slug: 'box-furnace' },
  { id: 2, en: 'TROLLEY FURNACE', zh: '台车炉', image: '/images/home/product-center/trolley-furnace-real.png', slug: 'trolley-furnace' },
  { id: 3, en: 'PIT FURNACE', zh: '井式炉', image: '/images/home/product-center/pit-furnace-real.png', slug: 'pit-furnace' },
  { id: 4, en: 'BELL FURNACE', zh: '罩式炉', image: '/images/home/product-center/bell-furnace-real.png', slug: 'bell-furnace' },
  { id: 5, en: 'PUSHER FURNACE', zh: '推杆炉', image: '/images/home/product-center/pusher-furnace-real.png', slug: 'pusher-furnace' },
  { id: 6, en: 'MESH BELT FURNACE', zh: '网带炉', image: '/images/home/product-center/mesh-belt-furnace-real.png', slug: 'mesh-belt-furnace' },
  { id: 7, en: 'ROLLER HEARTH FURNACE', zh: '辊底炉', image: '/images/home/product-center/roller-hearth-furnace-real.png', slug: 'roller-hearth-furnace' },
  { id: 8, en: 'ROTARY HEARTH FURNACE', zh: '转底炉', image: '/images/home/product-center/rotary-hearth-furnace-real.png', slug: 'rotary-hearth-furnace' },
];

export function ProductCenterSection({ locale }: ProductCenterSectionProps) {
  return (
    <section className="overflow-hidden bg-white pb-14 pt-5 lg:pb-18 lg:pt-5">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-5 lg:px-5 xl:px-4">
        <div className="border-l border-t border-[#ebebeb]">
          <div className="grid grid-cols-2 lg:grid-cols-4">
          {productCenterCards.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/products/detail/${item.slug}`}
              className="group flex min-h-[248px] flex-col border-b border-r border-[#ebebeb] bg-white px-6 py-6 transition-colors duration-300 hover:bg-[#fcfcfc] lg:min-h-[292px] lg:px-8 lg:py-8"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#9aa0a6]">
                {item.en}
              </p>
              <h3 className="mt-3 text-[18px] font-medium leading-[1.5] text-[#1f1f1f] lg:text-[19px]">
                {locale === 'en' ? item.en : item.zh}
              </h3>
              <div className="relative mt-5 flex min-h-0 flex-1 items-center justify-center">
                <div className="relative h-[118px] w-full max-w-[228px] lg:h-[146px] lg:max-w-[248px]">
                  <Image
                    src={item.image}
                    alt={locale === 'en' ? item.en : item.zh}
                    fill
                    className="scale-[1.3] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.38]"
                    sizes="(min-width: 1024px) 248px, 45vw"
                  />
                </div>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
