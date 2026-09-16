'use client';

import Link from 'next/link';
import { useState } from 'react';

import { SectionTitle } from '@/components/common/SectionTitle';
import { FurnaceAnimation } from '@/components/furnace-scenes';
import { FurnaceAnimationKind, homeSingleFurnaces } from '@/lib/home-product-types';
import { HotProductItem } from '@/types/home';
import { Locale } from '@/types/site';

type HotProductsProps = {
  locale: Locale;
  items: HotProductItem[];
};

type FurnaceProductCard = {
  id: number;
  slug: string;
  name: HotProductItem['name'];
  model: string;
  image: string;
  kind: FurnaceAnimationKind;
  description: Record<Locale, string>;
};

const furnaceProducts: FurnaceProductCard[] = homeSingleFurnaces.map((item, index) => ({
  id: index + 1,
  slug: item.id,
  name: { zh: item.name, en: item.nameEn },
  model: item.englishName,
  image: item.image,
  kind: item.animationKind,
  description: { zh: item.description, en: item.descriptionEn },
}));

export function buildHomeFurnaceProducts(items: HotProductItem[]) {
  if (!items.length) return furnaceProducts;

  const cmsBySlug = new Map(items.map((item) => [item.slug, item]));
  return furnaceProducts.map((item) => {
    const cmsItem = cmsBySlug.get(item.slug);
    if (!cmsItem) return item;

    return {
      ...item,
      id: cmsItem.id,
      name: cmsItem.name,
      model: cmsItem.model || item.model,
      image: cmsItem.image || item.image,
    };
  });
}

export function HotProducts({ locale, items }: HotProductsProps) {
  const displayProducts = buildHomeFurnaceProducts(items);
  const [activeFurnace, setActiveFurnace] = useState<string | null>(null);

  return (
    <section className="site-section hot-products overflow-hidden bg-white">
      <div className="site-page-container">
        <SectionTitle
          eyebrow="furnace showcase"
          title={locale === 'en' ? 'Furnace Showcase' : '炉型展示'}
          align="center"
        />

        <div className="mt-8 lg:mt-10">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3.5">
            {displayProducts.map((item) => {
              const description = item.description[locale];

              return (
                <Link
                  key={item.slug}
                  onMouseEnter={() => setActiveFurnace(item.slug)}
                  onMouseLeave={() => setActiveFurnace(null)}
                  onFocus={() => setActiveFurnace(item.slug)}
                  onBlur={() => setActiveFurnace(null)}
                  href={`/${locale}/products/detail/${item.slug}`}
                  className="group flex h-[250px] flex-col overflow-hidden rounded-[2px] border border-[#dbe4ec] bg-[#f8fbfd] transition-[transform,background-color,border-color,box-shadow] duration-300 hover:-translate-y-[4px] hover:border-[#c9d6e3] hover:bg-white hover:shadow-[0_14px_28px_rgba(18,47,84,0.08)] sm:h-[292px] lg:h-[344px]"
                >
                  <div className="relative h-[172px] shrink-0 overflow-hidden bg-[#0d1625] sm:h-[194px] lg:h-[230px]">
                    <div className="relative h-full w-full">
                      <FurnaceAnimation
                        locale={locale}
                        kind={item.kind}
                        active={activeFurnace === item.slug}
                        image={item.image}
                        label={
                          locale === 'en'
                            ? `${item.name.en} working principle animation`
                            : `${item.name.zh}工作原理动画`
                        }
                      />
                    </div>
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col justify-start overflow-hidden px-3.5 pb-2.5 pt-2.5 text-left lg:px-4 lg:pb-3 lg:pt-3">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-[#526277] transition-colors duration-300 group-hover:text-brand-primary/72 lg:text-[10px]">
                      {item.model}
                    </p>
                    <h3 className="mt-0.5 text-[16px] font-semibold leading-[1.22] text-text-primary transition-colors duration-300 group-hover:text-brand-primary lg:text-[18px]">
                      {item.name[locale]}
                    </h3>
                    {description ? (
                      <p className="mt-2 hidden line-clamp-2 min-h-[36px] text-[12px] leading-[1.5] text-[#7f8b98] sm:block lg:min-h-[40px] lg:text-[13px]">
                        {description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
