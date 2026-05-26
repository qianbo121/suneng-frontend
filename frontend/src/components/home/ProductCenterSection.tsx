'use client';

import Image from 'next/image';
import Link from 'next/link';

import { buildProductImageAlt } from '@/lib/seo';
import { Locale } from '@/types/site';

type ProductCenterSectionProps = {
  locale: Locale;
};

type ProductCenterCard = {
  id: number;
  en: string;
  zh: string;
  feature: {
    zh: string;
    en: string;
  };
  image: string;
  slug: string;
};

const productCenterCards: ProductCenterCard[] = [
  { id: 1, en: 'BOX FURNACE', zh: '箱式炉', feature: { zh: '中小型零件退火淬火非标定制', en: 'custom annealing and quenching for small and medium workpieces' }, image: '/images/home/product-center/box-furnace-real.jpg', slug: 'box-furnace' },
  { id: 2, en: 'TROLLEY FURNACE', zh: '台车炉', feature: { zh: '大型工件与模具热处理承载设备', en: 'large workpiece and die heat treatment equipment' }, image: '/images/home/product-center/trolley-furnace-real.jpg', slug: 'trolley-furnace' },
  { id: 3, en: 'PIT FURNACE', zh: '井式炉', feature: { zh: '轴类杆类工件垂直均匀加热', en: 'vertical uniform heating for shaft and rod workpieces' }, image: '/images/home/product-center/pit-furnace-real.jpg', slug: 'pit-furnace' },
  { id: 4, en: 'BELL FURNACE', zh: '罩式炉', feature: { zh: '保护气氛与批量工件整体热处理', en: 'protective atmosphere heat treatment for batch workpieces' }, image: '/images/home/product-center/bell-furnace-real.jpg', slug: 'bell-furnace' },
  { id: 5, en: 'PUSHER FURNACE', zh: '推杆炉', feature: { zh: '料盘节拍推进连续热处理', en: 'continuous heat treatment with paced tray pushing' }, image: '/images/home/product-center/pusher-furnace-real.jpg', slug: 'pusher-furnace' },
  { id: 6, en: 'MESH BELT FURNACE', zh: '网带炉', feature: { zh: '小件零件连续退火回火生产', en: 'continuous annealing and tempering for small parts' }, image: '/images/home/product-center/mesh-belt-furnace-real.jpg', slug: 'mesh-belt-furnace' },
  { id: 7, en: 'ROLLER HEARTH FURNACE', zh: '辊底炉', feature: { zh: '板材棒材连续输送热处理', en: 'continuous roller conveying heat treatment for plates and bars' }, image: '/images/home/product-center/roller-hearth-furnace-real.jpg', slug: 'roller-hearth-furnace' },
  { id: 8, en: 'ROTARY HEARTH FURNACE', zh: '转底炉', feature: { zh: '环形炉底节拍式均匀加热', en: 'rhythmic uniform heating on a rotary hearth' }, image: '/images/home/product-center/rotary-hearth-furnace-real.jpg', slug: 'rotary-hearth-furnace' },
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
                    alt={buildProductImageAlt(locale, locale === 'en' ? item.en : item.zh, item.feature[locale])}
                    fill
                    unoptimized
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
