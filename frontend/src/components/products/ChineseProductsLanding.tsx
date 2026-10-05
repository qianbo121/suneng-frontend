import Image from 'next/image';
import type { Locale } from '@/types/site';
import { translateLineValue } from '@/lib/production-line-content-en';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';

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

const purchaseReferences = [
  ['连续生产线规划', '/zh/solutions/continuous-heat-treatment-line'],
  ['厂家能力核对', '/zh/solutions/rechuli-lu-changjia'],
  ['江苏及华东项目配套', '/zh/solutions/jiangsu-gongye-lu-changjia'],
  ['专项工业炉采购评估', '/zh/articles/special-industrial-furnace-procurement-assessment'],
] as const;

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

export function ChineseProductsLanding({ locale = 'zh' }: { locale?: Locale }) {
  const en = locale === 'en';
  const availablePurchaseReferences = en
    ? []
    : purchaseReferences.filter(([, href]) => !isWithdrawnTechnicalPath(href));
  const t = (zh: string, english: string) => en ? english : zh;
  return (
    <div className={`home-page-scope ${styles.page}`}>
      <section
        className={styles.hero}
        aria-labelledby="products-page-title"
        data-sticky-contact-start
      >
        <Image
          src={HERO_IMAGE}
          alt={t("苏能热处理生产线制造车间", "Suneng heat-treatment line manufacturing workshop")}
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
            <nav aria-label={t("面包屑", "Breadcrumb")} className={styles.breadcrumb}>
              <Link href={`/${locale}`}>{t("首页", "Home")}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{t("产品中心", "Product Center")}</span>
            </nav>
            <h1 id="products-page-title">{t("工业炉产品中心", "Industrial Furnace Product Center")}</h1>
            <p className={styles.heroDescription}>{t("按工件、装卸方式和生产节拍，选择热处理生产线或单台工业炉", "Select a heat-treatment line or individual furnace by workpiece, handling method and production cycle.")}</p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="production-line-title">
        <div className={styles.container}>
          <ProductCenterLineCarousel items={en ? translateLineValue(productCenterProductionLines) : productCenterProductionLines} locale={locale} />
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
            title={t("周期式工业炉", "Batch Furnaces")}
            description={t("按批次装炉与出炉", "Charge and discharge by batch")}
          />
          <FurnaceGrid cards={periodicFurnaceCards} locale={locale} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="continuous-furnace-title">
        <div className={styles.container}>
          <SectionHeading
            id="continuous-furnace-title"
            title={t("连续式工业炉", "Continuous Furnaces")}
            description={t("工件按节拍通过炉膛", "Workpieces pass through the furnace at a controlled production rate")}
          />
          <FurnaceGrid cards={continuousFurnaceCards} locale={locale} />
        </div>
      </section>

      {availablePurchaseReferences.length > 0 && (
        <section
          id="selection-purchase-reference"
          className={`${styles.section} ${styles.referenceSection}`}
          aria-labelledby="purchase-reference-title"
        >
          <div className={styles.container}>
            <SectionHeading
              id="purchase-reference-title"
              title="选型与采购参考"
              description="先明确设备选型方向，再核对厂家能力与项目所在地的配套条件。"
            />
            <div className={styles.referenceGrid}>
              {availablePurchaseReferences.map(([label, href]) => (
                <Link key={href} href={href} className={styles.referenceLink}>
                  <span>{label}</span>
                  <HiArrowRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={styles.supportSection} aria-labelledby="support-title">
        <div className={styles.container}>
          <div className={styles.supportStrip}>
            <h2 id="support-title">{t("现有设备需要维修、改造或增加配套？", "Need to repair, retrofit or add equipment?")}</h2>
            <Link href={en ? "/en/service" : "/zh/service/furnace-renovation-overhaul"} className={styles.supportLink}>
              {t("了解改造与配套", "Explore retrofit & support")}
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.inquirySection}>
        <HomepageLeadForm
          locale={locale}
          pageType="产品中心"
          productTag="热处理生产线与工业炉"
          successProductTag="产品中心项目情况"
          sourceModule="products_page_form"
        />
      </div>
    </div>
  );
}
