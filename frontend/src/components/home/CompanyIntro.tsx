'use client';

const REGISTERED_CAPITAL = 5080;
const STAFF_COUNT = 150;
const FACTORY_AREA = 14700;
/**
 * 背景图片要求（4 张，factory-1.jpg ~ factory-4.jpg）：
 * - 推荐工厂 / 设备 / 车间题材，色调尽量接近
 * - 主体位于画面中央，方便切成平行四边形后仍然可辨识
 * - 避免大面积留白天空或地面
 */

import Image from 'next/image';
import Link from 'next/link';
import { LuArrowRight } from 'react-icons/lu';

import { HomeSectionFallback } from '@/components/home/HomeSectionFallback';
import { CompanyIntroContent, PartnerLogoItem } from '@/types/home';
import { Locale } from '@/types/site';

type CompanyIntroProps = {
  locale: Locale;
  content: CompanyIntroContent;
  partners: PartnerLogoItem[];
};

type IntroStat = {
  id: number;
  number: number;
  unit: string;
  label: string;
};

const sliceOffsets = [0, -15, 10, -8];
const sliceClipPath = 'polygon(12% 0, 100% 0, 88% 100%, 0 100%)';

function CountCard({ item }: { item: IntroStat }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-start gap-1 leading-none">
        <span className="text-6xl font-bold tracking-tight text-red-600 lg:text-7xl">{item.number}</span>
        <span className="mt-2 text-lg font-semibold text-red-600 lg:text-xl">{item.unit}</span>
      </div>
      <span className="mt-2 text-sm tracking-wide text-neutral-300">{item.label}</span>
    </div>
  );
}

export function CompanyIntro({ locale, content, partners }: CompanyIntroProps) {
  const companyName = 'Jiangsu Suneng Industrial Furnace Co., Ltd.';
  const stats: IntroStat[] = [
    { id: 1, number: 2006, unit: '年', label: locale === 'zh' ? '公司成立' : 'Founded' },
    { id: 2, number: REGISTERED_CAPITAL, unit: '万元', label: locale === 'zh' ? '注册资本' : 'Registered Capital' },
    { id: 3, number: STAFF_COUNT, unit: '+', label: locale === 'zh' ? '公司员工' : 'Staff' },
    { id: 4, number: FACTORY_AREA, unit: 'm²', label: locale === 'zh' ? '厂房面积' : 'Factory Area' },
  ];
  const marqueeItems = [...partners, ...partners];

  return (
    <section className="relative h-screen max-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 flex">
        {[1, 2, 3, 4].map((n, i) => (
          <div
            key={n}
            className={`relative overflow-hidden ${i === 0 || i === 3 ? 'flex-[1]' : 'flex-[1.3]'}`}
            style={{
              clipPath: sliceClipPath,
              marginLeft: i === 0 ? '0' : '-3%',
              transform: `translateY(${sliceOffsets[i]}px)`,
            }}
          >
            <Image
              src={`/images/source/factory-${n}.jpg`}
              alt=""
              fill
              priority={i === 0}
              sizes="25vw"
              className="absolute inset-0 h-full w-full scale-110 object-cover object-center"
              style={{ filter: 'brightness(0.75) contrast(1.1) saturate(0.85)' }}
            />
          </div>
        ))}
      </div>
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at center, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col pt-6 md:pt-8">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mx-auto max-w-6xl -translate-y-3 md:-translate-y-5">
            <p className="mb-4 text-sm font-normal tracking-[0.2em] text-neutral-400">{companyName.toUpperCase()}</p>
            <h2 className="mt-3 text-4xl font-bold tracking-wide text-white lg:text-5xl">
              {content.title[locale]}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-neutral-300 lg:text-base">
              {content.description[locale]}
            </p>
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-4">
              {stats.map((item) => (
                <CountCard key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-6 md:mt-7">
              <Link
                href={`/${locale}${content.buttonHref}`}
                className="group inline-flex items-center gap-5 rounded-full bg-red-600 py-1.5 pl-8 pr-1.5 shadow-[0_10px_30px_rgba(220,38,38,0.35)] transition-all duration-300 hover:bg-red-700 hover:shadow-[0_12px_36px_rgba(220,38,38,0.5)]"
              >
                <span className="text-base font-medium tracking-wide text-white">{content.buttonLabel[locale]}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-transform group-hover:translate-x-1">
                  <LuArrowRight size={18} className="text-red-600" strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-6 pb-10">
          <div className="mx-auto -mt-3 flex max-w-7xl items-center gap-5 md:-mt-5">
            {partners.length ? (
              <>
                <div className="shrink-0">
                  <div className="flex flex-col items-start border-l-[3px] border-red-600 py-1 pl-3">
                    <span className="text-xl font-bold leading-tight tracking-wider text-white">合作</span>
                    <span className="text-xl font-bold leading-tight tracking-wider text-white">企业</span>
                  </div>
                </div>

                <div className="group relative min-w-0 flex-1 overflow-hidden">
                  <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 bg-gradient-to-r from-black to-transparent" />
                  <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-black to-transparent" />

                  <div className="flex w-max gap-3 animate-marquee group-hover:[animation-play-state:paused]">
                    {marqueeItems.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="w-44 shrink-0 rounded border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-sm transition-colors hover:border-red-600/50"
                      >
                        <div className="truncate text-sm font-medium text-white">{item.shortName || item.name}</div>
                        <div className="mt-0.5 truncate text-xs text-neutral-400">{item.industry || '工业制造'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <HomeSectionFallback locale={locale} type="empty" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
