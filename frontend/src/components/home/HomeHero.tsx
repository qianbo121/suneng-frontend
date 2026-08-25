import Image from 'next/image';

import styles from './HomeHero.module.css';

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
    unit: '个',
    label: '项目案例',
  },
  {
    value: '14700',
    prefix: '约',
    unit: 'm²',
    label: '生产基地',
  },
] as const;

export default function HomeHero() {
  return (
    <section className={`${styles.hero} ${styles.chineseHero}`} aria-labelledby="hero-title">
      <Image
        src="/images/home/suneng-factory-hero-1600.webp"
        alt="江苏苏能工业炉有限公司厂区航拍"
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 899px) 1500px, 100vw"
        className={styles.heroImage}
      />
      <div className={styles.blueOverlay} aria-hidden="true" />
      <div className={styles.heroContainer}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>JIANGSU SUNENG INDUSTRIAL FURNACE CO LTD</p>
          <h1 id="hero-title" className={styles.title}>
            江苏苏能工业炉有限公司
          </h1>
          <p className={styles.description}>工业炉单机、配套件与整线设备一体化解决方案商</p>
          <p className={styles.certification}>江苏泰州 · 国家高新技术企业</p>
        </div>
      </div>
      <div className={styles.chineseStats} aria-label="企业实力">
        {companyStats.map((item) => (
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
    </section>
  );
}
