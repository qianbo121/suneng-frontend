'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { HeroBannerItem, PartnerLogoItem } from '@/types/home';
import { Locale } from '@/types/site';

type HeroBannerProps = {
  locale: Locale;
  items: HeroBannerItem[];
  partners: PartnerLogoItem[];
};

const heroMotionEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
const heroStats = [
  { value: 2006, unit: '年', label: '公司成立' },
  { value: 5080, unit: '万元', label: '注册资本' },
  { value: 150, unit: '+', label: '公司员工' },
  { value: 14700, unit: '㎡', label: '厂房面积' },
] as const;
const heroDescription =
  '专注工业炉装备设计制造与热工系统定制化解决方案，为各行业提供稳定、高效、可靠的高温处理与热能优化支持';
const heroPartnerLogos = [
  { name: 'ENFI', image: '/images/partner/logos/enfi.png', imageClass: 'max-h-[100px] max-w-[206px]' },
  { name: 'CUEC', image: '/images/partner/logos/cuec.png', imageClass: 'max-h-[100px] max-w-[206px]' },
  { name: 'NHI', image: '/images/partner/logos/nhi.png', imageClass: 'max-h-[100px] max-w-[206px]' },
  {
    name: 'TSINGSHAN',
    image: '/images/partner/logos/tsingshan.png',
    imageClass: 'max-h-[78px] max-w-[200px]',
  },
  { name: 'Enric', image: '/images/partner/logos/enric.png', imageClass: 'max-h-[100px] max-w-[206px]' },
  { name: 'TG', image: '/images/partner/logos/tg.png', imageClass: 'max-h-[100px] max-w-[206px]' },
  { name: 'LIUHE', image: '/images/partner/logos/liuhe.png', imageClass: 'max-h-[100px] max-w-[206px]' },
] as const;

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, value]);

  return (
    <span
      className="inline-block text-right [font-variant-numeric:tabular-nums]"
      style={{ minWidth: `${String(value).length}ch` }}
    >
      {displayValue}
    </span>
  );
}

export function HeroBanner({ locale, items, partners }: HeroBannerProps) {
  const banner = items[0];
  void partners;

  if (!banner) {
    return null;
  }

  const displayEyebrow = 'JIANGSU SUNENG INDUSTRIAL FURNACE CO LTD';
  const displayTitle = locale === 'zh' ? '江苏苏能工业炉有限公司' : banner.title[locale];
  const displaySubtitle = locale === 'zh' ? heroDescription : banner.subtitle[locale];
  const marqueeLogos = [...heroPartnerLogos, ...heroPartnerLogos];

  return (
    <section className="hero-banner relative bg-white">
      <div className="hero-banner-slide relative h-[560px] overflow-hidden bg-black md:h-[540px] lg:h-[526px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home/banner-factory-building.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            quality={100}
            style={{ filter: 'brightness(0.58) contrast(1.08) saturate(0.86)' }}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.58),rgba(0,0,0,0.68)_48%,rgba(0,0,0,0.72))]" />
        <div className="absolute inset-0 z-[2] bg-black/18" />

        <div className="relative z-20 mx-auto flex h-full w-full max-w-[1440px] flex-col items-center px-6 pt-[82px] text-center text-white md:pt-[90px] lg:pt-[96px]">
          <motion.p
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.64, ease: heroMotionEase, delay: 0.08 }}
            className="mb-[18px] text-[13px] font-medium uppercase leading-none tracking-[0.2em] text-white/82 md:text-[15px]"
          >
            {displayEyebrow}
          </motion.p>
          <motion.h1
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.72, ease: heroMotionEase, delay: 0.16 }}
            className="text-[40px] font-bold leading-[1.12] tracking-[0.06em] text-white md:text-[58px] lg:text-[64px]"
          >
            {displayTitle}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.68, ease: heroMotionEase, delay: 0.26 }}
            className="mx-auto mt-[18px] max-w-[1040px] text-[15px] font-normal leading-[1.75] text-white/82 md:text-[17px]"
          >
            {displaySubtitle}
          </motion.p>

          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: heroMotionEase, delay: 0.34 }}
            className="mx-auto mt-[36px] grid w-full max-w-[1120px] grid-cols-2 gap-y-7 md:grid-cols-4 md:gap-y-0"
          >
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="relative flex min-h-[92px] flex-col items-center justify-center px-0 md:min-h-[118px]"
              >
                <div className="flex items-start justify-center gap-[5px] leading-none">
                  <span className="inline-flex justify-end text-[54px] font-bold leading-none tracking-tight text-[#E30613] md:text-[72px] lg:text-[78px]">
                    <AnimatedNumber value={item.value} />
                  </span>
                  <span className="mt-[13px] inline-block min-w-[34px] text-left text-[22px] font-normal leading-none text-white/58 md:mt-[15px] md:text-[25px]">
                    {item.unit}
                  </span>
                </div>
                <span className="mt-[10px] text-[15px] font-normal leading-[1.5] tracking-[0.04em] text-white/58">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.72, ease: heroMotionEase, delay: 0.52 }}
        className="relative z-30 mx-auto -mt-[64px] w-[calc(100%-32px)] max-w-[1320px] overflow-hidden rounded-[22px] bg-white shadow-[0_22px_50px_rgba(15,23,42,0.14)] md:-mt-[78px]"
      >
        <div className="flex min-h-[106px] items-center overflow-x-auto px-[8px] py-0 md:overflow-visible md:px-[24px]">
          <div className="flex min-w-[152px] shrink-0 items-center border-r border-[#dedede] pr-[16px]">
            <span className="mr-[18px] h-[76px] w-[3px] rounded-full bg-[#E30613]" />
            <span>
              <span className="block text-[18px] font-semibold leading-none tracking-[0.06em] text-[#202020]">
                合作伙伴
              </span>
              <span className="mt-[8px] block text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-[#9b9b9b]">
                Partners
              </span>
            </span>
          </div>
          <div className="group relative min-w-0 flex-1 overflow-hidden">
            <div
              className="flex w-max items-center animate-marquee group-hover:[animation-play-state:paused]"
              style={{ animationDuration: '34s' }}
            >
              {marqueeLogos.map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="relative flex h-[106px] w-[216px] shrink-0 items-center justify-center overflow-hidden px-0 after:absolute after:right-0 after:top-1/2 after:h-[76px] after:w-px after:-translate-y-1/2 after:bg-[#dedede]"
                >
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    width={420}
                    height={210}
                    className={`${partner.imageClass} h-auto w-auto object-contain`}
                    sizes="236px"
                    priority={index < 2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
