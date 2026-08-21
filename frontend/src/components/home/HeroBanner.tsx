'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { Locale } from '@/types/site';

import EnglishHomeHero from './EnglishHomeHero';
import HomeHero from './HomeHero';

type HeroBannerProps = {
  locale: Locale;
};

type HeroPartnerLogo = {
  name: string;
  image: string;
};

const heroMotionEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
const heroPartnerLogoBasePath = '/images/partner/logos/home-marquee-normalized';
const heroPartnerMarqueeCardClass =
  'relative flex h-[96px] w-[228px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-[#e6ebf2] bg-white px-[10px] py-[10px] transition-all duration-250 hover:-translate-y-[3px] hover:scale-[1.01] hover:border-[#d5deee] hover:bg-[#fbfdff] hover:shadow-[0_12px_32px_rgba(15,23,42,0.16)] md:h-[100px] md:w-[246px] md:rounded-[15px]';
const heroPartnerMarqueeImageFrameClass =
  'flex h-[70px] w-[187px] items-center justify-center md:h-[76px] md:w-[203px]';
const heroPartnerMarqueeImageClass = 'h-full w-full object-contain';
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

function HeroPartners({ locale }: HeroBannerProps) {
  const marqueeLogos = [...heroPartnerLogos, ...heroPartnerLogos];
  const panelClass = [
    'relative z-30 mx-auto w-[calc(100%-28px)] max-w-[1520px] overflow-hidden rounded-[18px] border border-[#ebedf1] bg-white shadow-[0_20px_46px_rgba(15,23,42,0.11)] md:w-[calc(100%-40px)] lg:w-[calc(100%-192px)]',
    'mt-[28px]',
  ].join(' ');

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.72, ease: heroMotionEase, delay: 0.52 }}
      className={panelClass}
    >
      <div className="flex min-h-[112px] items-center overflow-x-auto px-[14px] py-[12px] md:overflow-visible md:px-[24px]">
        <div className="flex min-w-[156px] shrink-0 items-center border-r border-[#e2e8f3] pr-[15px]">
          <span className="mr-[16px] h-[70px] w-[3px] rounded-full bg-[var(--color-interactive)]" />
          <span>
            <span className="block text-[18px] font-semibold leading-none tracking-[0.06em] text-[#202020]">
              {locale === 'en' ? 'Partners' : '合作伙伴'}
            </span>
            {locale === 'zh' ? (
              <span className="mt-[8px] block text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-[#9b9b9b]">
                Partners
              </span>
            ) : null}
          </span>
        </div>
        <div className="group relative min-w-0 flex-1 overflow-hidden">
          <div
            className={heroPartnerMarqueeTrackClass}
            style={{ animationDuration: heroPartnerMarqueeTrackDuration }}
          >
            {marqueeLogos.map((partner, index) => (
              <div key={`${partner.name}-${index}`} className={heroPartnerMarqueeCardClass}>
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
  );
}

export function HeroBanner({ locale }: HeroBannerProps) {
  return (
    <section className="hero-banner relative bg-white">
      {locale === 'zh' ? <HomeHero /> : <EnglishHomeHero />}
      <HeroPartners locale={locale} />
    </section>
  );
}
