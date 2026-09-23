'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import styles from './HomeHero.module.css';

const heroSlides = [
  {
    id: 'company',
    image: '/images/home/reviewed-20260909/factory-enhanced-v1.webp',
    imageClassName: '',
    eyebrow: 'JIANGSU SUNENG INDUSTRIAL FURNACE CO LTD',
    title: '江苏苏能工业炉有限公司',
    description: '工业炉单机、配套件与整线设备一体化解决方案商',
    certification: '江苏泰州 · 国家高新技术企业',
    showStats: true,
  },
  {
    id: 'manufacturing-base',
    image: '/images/home/reviewed-20260909/manufacturing-enhanced-v1.webp',
    imageClassName: styles.manufacturingImage,
    eyebrow: 'SELF-OWNED MANUFACTURING BASE',
    title: '自主制造基地',
    description: '炉体制造、管路配套与电控集成一体化生产基地',
    certification: '江苏泰州 · 生产基地',
    showStats: false,
  },
] as const;

const companyStats = [
  {
    value: '2006',
    prefix: '',
    unit: '年',
    label: '公司成立',
  },
  {
    value: '5080',
    prefix: '',
    unit: '万元',
    label: '注册资本',
  },
  {
    value: '1000+',
    prefix: '',
    unit: '项',
    label: '工业炉新建与改造项目',
  },
  {
    value: '14700',
    prefix: '',
    unit: 'm²',
    label: '生产基地',
  },
] as const;

export default function HomeHero({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const english = locale === 'en';
  const slides = heroSlides.map((slide, index) => english ? {
    ...slide,
    title: index === 0 ? 'Jiangsu Suneng Industrial Furnace Co., Ltd.' : 'Our Manufacturing Base',
    description: index === 0 ? 'Industrial furnaces, components and complete heat-treatment lines.' : 'Furnace fabrication, piping and electrical control integration under one roof.',
    certification: index === 0 ? 'Taizhou, Jiangsu · National High-tech Enterprise' : 'Taizhou, Jiangsu · Manufacturing facility',
  } : slide);
  const stats = english ? [
    { value: '2006', prefix: '', unit: '', label: 'Founded' },
    { value: '50.8', prefix: '', unit: 'M CNY', label: 'Registered capital' },
    { value: '1000+', prefix: '', unit: '', label: 'New-build & retrofit projects' },
    { value: '14700', prefix: '≈', unit: 'm²', label: 'Production site (company-reported)' },
  ] : companyStats;
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener('change', syncMotionPreference);

    return () => mediaQuery.removeEventListener('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    if (isPointerOver || isFocusWithin || prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [activeSlide, isFocusWithin, isPointerOver, prefersReducedMotion]);

  const selectSlide = (index: number) => {
    setActiveSlide(index);
  };

  return (
    <section
      className={`${styles.hero} ${styles.chineseHero} ${english ? styles.localizedHero : ''}`}
      aria-labelledby="hero-title"
      aria-roledescription={english ? 'carousel' : '轮播图'}
      data-sticky-contact-start
      onMouseEnter={() => setIsPointerOver(true)}
      onMouseLeave={() => setIsPointerOver(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={() => setIsFocusWithin(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.heroMedia} ${index === activeSlide ? styles.heroMediaActive : ''}`}
          aria-hidden="true"
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            quality={85}
            sizes="100vw"
            className={`${styles.heroImage} ${slide.imageClassName}`}
          />
        </div>
      ))}
      <div className={styles.blueOverlay} aria-hidden="true" />

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.heroContainer} ${styles.heroCopyLayer} ${
            index === activeSlide ? styles.heroCopyLayerActive : ''
          }`}
          aria-hidden={index === activeSlide ? undefined : 'true'}
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow} translate="no">
              {slide.eyebrow}
            </p>
            {index === activeSlide ? (
              <h1 id="hero-title" className={styles.title}>
                {slide.title}
              </h1>
            ) : (
              <div className={styles.title}>{slide.title}</div>
            )}
            <p className={styles.description}>{slide.description}</p>
            <p className={styles.certification}>{slide.certification}</p>
          </div>
        </div>
      ))}

      <div
        className={`${styles.chineseStats} ${
          heroSlides[activeSlide].showStats ? '' : styles.chineseStatsHidden
        }`}
        role={heroSlides[activeSlide].showStats ? 'group' : undefined}
        aria-label={heroSlides[activeSlide].showStats ? (english ? 'Company profile' : '企业实力') : undefined}
        aria-hidden={heroSlides[activeSlide].showStats ? undefined : 'true'}
      >
        {stats.map((item) => (
          <div className={styles.chineseStatItem} key={item.label}>
            <div className={styles.statContent}>
              <p className={styles.statValue}>
                {item.prefix ? <span className={styles.statPrefix}>{item.prefix}</span> : null}
                <span className={styles.statNumber}>{item.value}</span>
                {item.unit ? <span className={styles.statUnit}>{item.unit}</span> : null}
              </p>
              <p className={styles.statLabel}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.carouselControls} role="group" aria-label={english ? 'Homepage slides' : '首页主视觉轮播控制'}>
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`${styles.carouselDotButton} ${
              index === activeSlide ? styles.carouselDotButtonActive : ''
            }`}
            aria-label={english ? `Slide ${index + 1}: ${slide.title}` : `查看第 ${index + 1} 张：${slide.title}`}
            aria-current={index === activeSlide ? 'true' : undefined}
            onClick={() => selectSlide(index)}
          >
            <span className={styles.carouselDot} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
