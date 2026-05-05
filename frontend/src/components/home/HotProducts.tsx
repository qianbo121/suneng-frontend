'use client';

import Image from 'next/image';
import Link from 'next/link';

import { SectionTitle } from '@/components/common/SectionTitle';
import { BellScene, BogieScene, BoxScene, MeshScene, PitScene, PusherScene, RollerScene, RotaryScene } from '@/components/furnace-scenes';
import { HotProductItem } from '@/types/home';
import { Locale } from '@/types/site';

type HotProductsProps = {
  locale: Locale;
  items: HotProductItem[];
};

type FurnaceKind =
  | 'box'
  | 'trolley'
  | 'pit'
  | 'bell'
  | 'pusher'
  | 'mesh'
  | 'roller'
  | 'rotary';

type FurnaceProductCard = {
  id: number;
  slug: string;
  name: HotProductItem['name'];
  model: string;
  image: string;
  kind: FurnaceKind;
};

type FurnaceDescriptionKey = FurnaceKind;

const furnaceProducts = [
  {
    id: 1,
    name: { zh: '箱式炉', en: 'Box Furnace' },
    model: 'BOX FURNACE',
    image: '/images/home/furnaces/box-furnace.svg',
    kind: 'box',
    slug: 'box-furnace',
  },
  {
    id: 2,
    name: { zh: '台车炉', en: 'Trolley Furnace' },
    model: 'TROLLEY FURNACE',
    image: '/images/home/furnaces/trolley-furnace.svg',
    kind: 'trolley',
    slug: 'trolley-furnace',
  },
  {
    id: 3,
    name: { zh: '井式炉', en: 'Pit Furnace' },
    model: 'PIT FURNACE',
    image: '/images/home/furnaces/pit-furnace.svg',
    kind: 'pit',
    slug: 'pit-furnace',
  },
  {
    id: 4,
    name: { zh: '罩式炉', en: 'Bell Furnace' },
    model: 'BELL FURNACE',
    image: '/images/home/furnaces/bell-furnace.svg',
    kind: 'bell',
    slug: 'bell-furnace',
  },
  {
    id: 5,
    name: { zh: '推杆炉', en: 'Pusher Furnace' },
    model: 'PUSHER FURNACE',
    image: '/images/home/furnaces/tempering-furnace.svg',
    kind: 'pusher',
    slug: 'pusher-furnace',
  },
  {
    id: 6,
    name: { zh: '网带炉', en: 'Mesh Belt Furnace' },
    model: 'MESH BELT FURNACE',
    image: '/images/home/furnaces/mesh-belt-furnace.svg',
    kind: 'mesh',
    slug: 'mesh-belt-furnace',
  },
  {
    id: 7,
    name: { zh: '辊底炉', en: 'Roller Hearth Furnace' },
    model: 'ROLLER HEARTH FURNACE',
    image: '/images/home/furnaces/roller-hearth-furnace.svg',
    kind: 'roller',
    slug: 'roller-hearth-furnace',
  },
  {
    id: 8,
    name: { zh: '转底炉', en: 'Rotary Hearth Furnace' },
    model: 'ROTARY HEARTH FURNACE',
    image: '/images/home/furnaces/roller-hearth-furnace.svg',
    kind: 'rotary',
    slug: 'rotary-hearth-furnace',
  },
] satisfies FurnaceProductCard[];

const animatedKinds: FurnaceKind[] = ['box', 'trolley', 'pit', 'bell', 'pusher', 'mesh', 'roller', 'rotary'];

const furnaceDescriptions: Record<FurnaceDescriptionKey, Record<Locale, string>> = {
  box: {
    zh: '箱式炉通过前门装料和出炉，结构直观，适合通用热处理和中小批量作业。',
    en: '',
  },
  trolley: {
    zh: '台车承载整批工件沿轨道进出，炉门关闭后进行保温加热。',
    en: '',
  },
  pit: {
    zh: '井式炉向下延伸，适合较长工件或成筐工件做均匀加热。',
    en: '',
  },
  bell: {
    zh: '钟罩从上方落下罩住工件进行加热，装卸方便，适合大件或成堆工件整体热处理。',
    en: '',
  },
  pusher: {
    zh: '工件装在料盘或料舟上，由推杆按节拍持续向前推送，依次通过各个温区完成连续热处理。',
    en: '',
  },
  mesh: {
    zh: '适合小件和标准件的连续生产，工件跟着网带依次经过不同温区。',
    en: '',
  },
  roller: {
    zh: '炉底由一排旋转辊子持续送料，适合板材、棒材等大件的连续热处理。',
    en: '',
  },
  rotary: {
    zh: '工件沿环形炉底缓慢旋转，依次经过预热、加热与保温工位，适合环形连续热处理工艺。',
    en: '',
  },
};

function ProductArtwork({ item, locale }: { item: FurnaceProductCard; locale: Locale }) {
  if (item.kind === 'box') {
    return <BoxScene />;
  }

  if (item.kind === 'trolley') {
    return <BogieScene />;
  }

  if (item.kind === 'pit') {
    return <PitScene />;
  }

  if (item.kind === 'mesh') {
    return <MeshScene />;
  }

  if (item.kind === 'bell') {
    return <BellScene />;
  }

  if (item.kind === 'pusher') {
    return <PusherScene />;
  }

  if (item.kind === 'roller') {
    return <RollerScene />;
  }

  if (item.kind === 'rotary') {
    return <RotaryScene />;
  }

  return (
    <Image
      src={item.image}
      alt={item.name[locale]}
      fill
      className="scale-[1.16] object-contain px-2 py-1.5 transition duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.2] group-hover:brightness-[1.04] lg:px-2 lg:py-1"
    />
  );
}

export function HotProducts({ locale }: HotProductsProps) {
  return (
    <section className="hot-products overflow-hidden bg-[#f5f7fa] pb-6 pt-8 lg:pb-9 lg:pt-10">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-5 lg:px-5 xl:px-4">
        <SectionTitle
          eyebrow="furnace showcase"
          title={locale === 'en' ? 'Furnace Showcase' : '炉型展示'}
          align="center"
        />

        <div className="mt-8 lg:mt-10">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3.5">
            {furnaceProducts.map((item) => {
              const isAnimatedCard = animatedKinds.includes(item.kind);
              const description = furnaceDescriptions[item.kind][locale];

              return (
              <Link
                key={item.id}
                href={`/${locale}/products/detail/${item.slug}`}
                className="group flex h-[258px] flex-col overflow-hidden rounded-[2px] border border-[#dbe4ec] bg-[#f8fbfd] transition-[transform,background-color,border-color,box-shadow] duration-300 hover:-translate-y-[4px] hover:border-[#c9d6e3] hover:bg-white hover:shadow-[0_14px_28px_rgba(18,47,84,0.08)] lg:h-[344px]"
              >
                <div
                  className={`relative h-[176px] overflow-hidden lg:h-[230px] ${
                    isAnimatedCard ? 'bg-[#0d1625]' : 'bg-[#eef3f7]'
                  }`}
                >
                  {!isAnimatedCard ? (
                    <>
                      <div className="absolute inset-x-3 top-3 h-px bg-[#d8e2ea] lg:inset-x-4 lg:top-4" />
                      <div className="absolute inset-x-3 bottom-3 h-px bg-[#dfe7ee] lg:inset-x-4 lg:bottom-4" />
                    </>
                  ) : null}
                  <div className="relative h-full w-full">
                    <ProductArtwork item={item} locale={locale} />
                  </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col justify-start overflow-hidden px-3.5 pb-2.5 pt-2.5 text-left lg:px-4 lg:pb-3 lg:pt-3">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-[#97a5b1] transition-colors duration-300 group-hover:text-brand-primary/72 lg:text-[10px]">
                    {item.model}
                  </p>
                  <h3 className="mt-0.5 text-[16px] font-semibold leading-[1.22] text-text-primary transition-colors duration-300 group-hover:text-brand-primary lg:text-[18px]">
                    {item.name[locale]}
                  </h3>
                  {description ? (
                    <p className="mt-2 line-clamp-2 min-h-[36px] text-[12px] leading-[1.5] text-[#7f8b98] lg:min-h-[40px] lg:text-[13px]">
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
