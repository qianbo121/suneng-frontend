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

type HeroPartnerLogo = {
  name: string;
  image: string;
};

const heroMotionEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
const heroStats = [
  { value: 2006, unit: '年', label: '公司成立' },
  { value: 5080, unit: '万元', label: '注册资本' },
  { value: 150, unit: '+人', label: '公司员工' },
  { value: 14700, unit: '㎡', label: '厂房面积' },
] as const;
const heroDescription = '工业炉单机、配套件与整线交钥匙工程一体化解决方案商';
const heroCredentials = '国家高新技术企业';
const heroPartnerLogoBasePath = '/images/partner/logos/home-marquee-normalized';
const heroPartnerMarqueeCardClass =
  'relative flex h-[96px] w-[228px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-[#e6ebf2] bg-white px-[10px] py-[10px] transition-all duration-250 hover:-translate-y-[3px] hover:scale-[1.01] hover:border-[#d5deee] hover:bg-[#fbfdff] hover:shadow-[0_12px_32px_rgba(15,23,42,0.16)] md:h-[100px] md:w-[246px] md:rounded-[15px]';
const heroPartnerMarqueeImageFrameClass =
  'flex h-[70px] w-[187px] items-center justify-center md:h-[76px] md:w-[203px]';
const heroPartnerMarqueeImageClass =
  'h-full w-full object-contain';
const heroPartnerMarqueeTrackClass =
  'flex w-max items-center gap-x-[12px] py-[4px] md:gap-x-[16px] animate-marquee will-change-transform group-hover:[animation-play-state:paused]';
const heroPartnerMarqueeTrackDuration = '72s';
const heroPartnerLogos: HeroPartnerLogo[] = [
  {
    name: '内蒙古北方重工业集团有限公司',
    image: `${heroPartnerLogoBasePath}/beifang-heavy.png`,
  },
  {
    name: '中国恩菲工程技术有限公司',
    image: `${heroPartnerLogoBasePath}/enfi.png`,
  },
  {
    name: '中国联合工程有限公司',
    image: `${heroPartnerLogoBasePath}/cuec.png`,
  },
  {
    name: '中集安瑞环科技股份有限公司',
    image: `${heroPartnerLogoBasePath}/cimctank.png`,
  },
  {
    name: '江苏天工科技股份有限公司',
    image: `${heroPartnerLogoBasePath}/tiangong-tech.png`,
  },
  {
    name: '中集氢能源科技（南通）有限公司',
    image: `${heroPartnerLogoBasePath}/cimc-hydrogen.png`,
  },
  {
    name: '福建青拓实业股份有限公司',
    image: `${heroPartnerLogoBasePath}/tsingtuo.png`,
  },
  {
    name: '海隆石油钻具（无锡）有限公司',
    image: `${heroPartnerLogoBasePath}/hilong.png`,
  },
  {
    name: '吉林省致远新能源氢能科技有限公司',
    image: `${heroPartnerLogoBasePath}/zhiyuan.png`,
  },
  {
    name: '南通中集能源装备有限公司',
    image: `${heroPartnerLogoBasePath}/cimc-energy.png`,
  },
  { name: '六和轻合金（苏州）有限公司', image: `${heroPartnerLogoBasePath}/liuhe.png` },
] as const;

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);

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

    setDisplayValue(0);
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
      <div className="hero-banner-slide relative h-[660px] overflow-hidden bg-black md:h-[540px] lg:h-[526px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home/banner-factory-building.png"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
            quality={85}
            style={{ filter: 'brightness(0.58) contrast(1.08) saturate(0.86)' }}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.58),rgba(0,0,0,0.68)_48%,rgba(0,0,0,0.72))]" />
        <div className="absolute inset-0 z-[2] bg-black/18" />

        <div className="relative z-20 mx-auto flex h-full w-full max-w-[1440px] flex-col items-center px-6 pt-[72px] text-center text-white md:pt-[80px] lg:pt-[86px]">
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
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.68, ease: heroMotionEase, delay: 0.26 }}
            className="mx-auto mt-[18px] max-w-[1040px] text-center"
          >
            <p className="text-[15px] font-normal leading-[1.75] text-white/82 md:text-[17px]">
              {displaySubtitle}
            </p>
            {locale === 'zh' && (
              <p className="mt-[10px] text-[12px] font-normal leading-[1.6] text-white/70 md:text-[14px]">
                {heroCredentials}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: heroMotionEase, delay: 0.34 }}
            className="mx-auto mt-[32px] grid w-full max-w-[1120px] grid-cols-2 gap-y-5 md:mt-[36px] md:grid-cols-4 md:gap-y-0"
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
        className="relative z-30 mx-auto -mt-[60px] w-[calc(100%-28px)] max-w-[1295px] overflow-hidden rounded-[18px] border border-[#ebedf1] bg-white shadow-[0_20px_46px_rgba(15,23,42,0.11)] md:-mt-[74px] md:w-[calc(100%-40px)]"
      >
        <div className="flex min-h-[112px] items-center overflow-x-auto px-[14px] py-[12px] md:overflow-visible md:px-[24px]">
          <div className="flex min-w-[156px] shrink-0 items-center border-r border-[#e2e8f3] pr-[15px]">
            <span className="mr-[16px] h-[70px] w-[3px] rounded-full bg-[#E30613]" />
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
              className={heroPartnerMarqueeTrackClass}
              style={{ animationDuration: heroPartnerMarqueeTrackDuration }}
            >
              {marqueeLogos.map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className={heroPartnerMarqueeCardClass}
                >
                  <div className={heroPartnerMarqueeImageFrameClass}>
                    <Image
                      src={partner.image}
                      alt={`${partner.name} logo`}
                      width={960}
                      height={360}
                      unoptimized
                      className={heroPartnerMarqueeImageClass}
                      sizes="203px"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
