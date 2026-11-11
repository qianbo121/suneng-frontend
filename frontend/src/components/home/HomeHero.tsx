import Image from 'next/image';

import type { Locale } from '@/types/site';

import styles from './HomeHero.module.css';
import HeroFacts from './HeroFacts';

const content = {
  zh: {
    eyebrow: 'Jiangsu Suneng Industrial Furnace Co Ltd',
    title: '江苏苏能工业炉有限公司',
    offering: '工业炉单机、配套件与整线设备一体化解决方案商',
    credential: '江苏泰州 · 国家高新技术企业',
    workshopAlt: '苏能厂区与配有黄色机械臂的工业炉生产线',
    caption: '苏能生产基地',
    facts: [
      { amount: 2006, unit: '年', label: '公司成立' },
      { amount: 5080, unit: '万元', label: '注册资本' },
      { amount: 1000, plus: true, unit: '项', label: '累计工业炉新建与改造项目' },
      { amount: 14700, unit: 'm²', label: '生产基地面积' },
    ],
  },
  en: {
    eyebrow: 'Taizhou, Jiangsu, China',
    title: 'Jiangsu Suneng Industrial Furnace Co., Ltd.',
    offering: 'Industrial furnaces, components and complete heat treatment lines.',
    credential: 'National High-tech Enterprise',
    workshopAlt: 'Suneng’s factory and an industrial furnace line with yellow robotic arms',
    caption: 'Suneng manufacturing site',
    facts: [
      { amount: 2006, label: 'Year founded' },
      { amount: 50.8, unit: 'million', label: 'Registered capital (RMB)' },
      { amount: 1000, grouped: true, plus: true, label: 'Furnace builds and retrofits' },
      { amount: 14700, grouped: true, unit: 'm²', label: 'Production site area', note: ' (company-reported)' },
    ],
  },
};

export default function HomeHero({ locale = 'zh' }: { locale?: Locale }) {
  const copy = content[locale];
  return (
    <section className={styles.hero} lang={locale} aria-labelledby="hero-title" data-sticky-contact-start>
      <div className={styles.intro}>
        <p className={styles.location}>{copy.eyebrow}</p>
        <h1 id="hero-title">{copy.title}</h1>
        <p className={styles.offering}>{copy.offering}</p>
        <p className={styles.credential}>{copy.credential}</p>
      </div>
      <div className={styles.scene}>
        <picture>
          <source media="(min-width: 701px)" srcSet="/images/home/suneng-manufacturing-panorama-scene.webp" />
          <Image
            src="/images/home/suneng-panorama-line-mobile-20261110.webp"
            alt={copy.workshopAlt}
            width={926}
            height={610}
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            quality={85}
          />
        </picture>
        <figure className={styles.sitePhoto}>
          <figcaption>{copy.caption}</figcaption>
        </figure>
      </div>
      <HeroFacts facts={copy.facts} locale={locale} />
    </section>
  );
}
