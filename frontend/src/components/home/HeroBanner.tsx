'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { Locale } from '@/types/site';

import EnglishHomeHero from './EnglishHomeHero';
import HomeHero from './HomeHero';
import styles from './HeroPartnerMarquee.module.css';

type HeroBannerProps = {
  locale: Locale;
};

type HeroPartnerLogo = {
  name: string;
  nameEn: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

const heroMotionEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
const heroPartnerLogos: HeroPartnerLogo[] = [
  {
    name: '中国恩菲工程技术有限公司',
    nameEn: "China ENFI Engineering",
    src: '/images/partners/homepage/01-enfi.png',
    alt: '中国恩菲工程技术有限公司 ENFI',
    width: 316,
    height: 160,
  },
  {
    name: '湖南华菱涟源钢铁有限公司',
    nameEn: "Hunan Valin Lianyuan Steel",
    src: '/images/partners/homepage/02-lianyuan-steel.png',
    alt: '湖南华菱涟源钢铁有限公司 涟钢',
    width: 514,
    height: 160,
  },
  {
    name: '中国联合工程有限公司',
    nameEn: "China United Engineering",
    src: '/images/partners/homepage/03-cuec.png',
    alt: '中国联合工程有限公司 CUEC',
    width: 384,
    height: 160,
  },
  {
    name: '中集安瑞环科技股份有限公司',
    nameEn: "CIMC Safeway",
    src: '/images/partners/homepage/04-cimc-safeway.png',
    alt: '中集安瑞环科技股份有限公司 CIMC Safeway',
    width: 536,
    height: 160,
  },
  {
    name: '青拓集团',
    nameEn: "Tsingtuo Group",
    src: '/images/partners/homepage/05-tsingtuo-group.png',
    alt: '青拓集团',
    width: 559,
    height: 160,
  },
  {
    name: '内蒙古北方重工业集团有限公司',
    nameEn: "Inner Mongolia North Heavy Industries",
    src: '/images/partners/homepage/06-nhi.png',
    alt: '内蒙古北方重工业集团有限公司 NHI',
    width: 368,
    height: 160,
  },
  {
    name: '江苏天工科技股份有限公司',
    nameEn: "Jiangsu Tiangong Technology",
    src: '/images/partners/homepage/07-tiangong-technology.png',
    alt: '江苏天工科技股份有限公司 天工股份',
    width: 482,
    height: 160,
  },
  {
    name: '钢诺新材料股份有限公司',
    nameEn: "Gangnuo Coldpro",
    src: '/images/partners/homepage/08-gangnuo-coldpro.png',
    alt: '钢诺新材料股份有限公司 钢诺 Coldpro',
    width: 734,
    height: 160,
  },
  {
    name: '西安三角防务股份有限公司',
    nameEn: "Xi’an Triangle Defense",
    src: '/images/partners/homepage/09-triangle-defense.png',
    alt: '西安三角防务股份有限公司 三角防务',
    width: 487,
    height: 160,
  },
  {
    name: '中集氢能科技有限公司',
    nameEn: "CIMC Hydrogen",
    src: '/images/partners/homepage/10-cimc-hydrogen.png',
    alt: '中集氢能科技有限公司 CIMC Hydrogen',
    width: 448,
    height: 160,
  },
  {
    name: '六和轻合金（苏州）有限公司',
    nameEn: "Lioho Light Alloy (Suzhou)",
    src: '/images/partners/homepage/11-liuhe-light-alloy.png',
    alt: '六和轻合金（苏州）有限公司',
    width: 427,
    height: 160,
  },
  {
    name: '钢研海德',
    nameEn: "CISRI Harder",
    src: '/images/partners/homepage/12-cisri-harder.png',
    alt: '中国钢研 钢研海德',
    width: 474,
    height: 160,
  },
] as const;

function PartnerLogoGroup({ duplicate = false, locale }: { duplicate?: boolean; locale: Locale }) {
  return (
    <div className={styles.logoGroup} aria-hidden={duplicate ? 'true' : undefined}>
      {heroPartnerLogos.map((partner) => (
        <Image
          key={partner.src}
          src={partner.src}
          alt={duplicate ? '' : locale === 'en' ? partner.nameEn : partner.alt}
          title={duplicate ? undefined : locale === 'en' ? partner.nameEn : partner.name}
          width={partner.width}
          height={partner.height}
          className={styles.logo}
          sizes="(max-width: 767px) 34px, (max-width: 1024px) 38px, 40px"
        />
      ))}
    </div>
  );
}

function HeroPartners({ locale }: HeroBannerProps) {
  return (
    <motion.div
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.72, ease: heroMotionEase, delay: 0.52 }}
      className={`${styles.panel} mx-auto w-[calc(100%-28px)] max-w-[1550px] md:w-[calc(100%-40px)] lg:w-[calc(100%-162px)]`}
    >
      <div className={styles.heading}>
        <span className={styles.headingAccent} aria-hidden="true" />
        <span>
          <span className={styles.headingTitle}>{locale === 'en' ? 'Partners' : '合作伙伴'}</span>
          <span className={styles.headingEyebrow}>Partners</span>
        </span>
      </div>
      <div
        className={styles.viewport}
        role="region"
        tabIndex={0}
        aria-label={locale === 'en' ? 'Partner logo carousel' : '合作伙伴标志轮播'}
      >
        <div className={styles.track} data-testid="homepage-partner-track">
          <PartnerLogoGroup locale={locale} />
          <PartnerLogoGroup locale={locale} duplicate />
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
