import Image from 'next/image';
import Link from 'next/link';

import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import {
  continuousFurnaceCards,
  periodicFurnaceCards,
  productCenterProductionLines,
} from '@/lib/products-landing-data';

import styles from './ChineseProductsLanding.module.css';
import { ProductCenterLineCarousel } from './ProductCenterLineCarousel';
import { FurnaceCardGrid as FurnaceGrid } from './FurnaceCardGrid';

const HERO_IMAGE = '/images/home/heat-treatment-line-manufacturing-base-3840.webp';

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function ChineseProductsLanding() {
  return (
    <div className={`home-page-scope ${styles.page}`}>
      <section
        className={styles.hero}
        aria-labelledby="products-page-title"
        data-sticky-contact-start
      >
        <Image
          src={HERO_IMAGE}
          alt="苏能热处理生产线制造车间"
          fill
          priority
          fetchPriority="high"
          quality={85}
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroContainer}>
          <div className={styles.heroCopy}>
            <nav aria-label="面包屑" className={styles.breadcrumb}>
              <Link href="/zh">首页</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">产品中心</span>
            </nav>
            <h1 id="products-page-title">工业炉产品中心</h1>
            <p className={styles.heroDescription}>按工件、装卸方式和生产节拍，选择热处理生产线或单台工业炉</p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="production-line-title">
        <div className={styles.container}>
          <ProductCenterLineCarousel items={productCenterProductionLines} />
        </div>
      </section>

      <section
        id="single-furnaces"
        className={styles.section}
        aria-labelledby="periodic-furnace-title"
      >
        <div className={styles.container}>
          <SectionHeading
            id="periodic-furnace-title"
            title="周期式工业炉"
            description="按批次装炉与出炉"
          />
          <FurnaceGrid cards={periodicFurnaceCards} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="continuous-furnace-title">
        <div className={styles.container}>
          <SectionHeading
            id="continuous-furnace-title"
            title="连续式工业炉"
            description="工件按节拍通过炉膛"
          />
          <FurnaceGrid cards={continuousFurnaceCards} />
        </div>
      </section>

      <section className={styles.supportSection} aria-labelledby="support-title">
        <div className={styles.container}>
          <div className={styles.supportStrip}>
            <h2 id="support-title">现有设备需要维修、改造或增加配套？</h2>
            <Link href="/zh/service/furnace-renovation-overhaul" className={styles.supportLink}>
              了解改造与配套
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.inquirySection}>
        <HomepageLeadForm
          pageType="产品中心"
          productTag="热处理生产线与工业炉"
          successProductTag="产品中心项目情况"
          sourceModule="products_page_form"
        />
      </div>
    </div>
  );
}
