import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { Button, getButtonClass } from '@/components/ui/Button';

import { AboutHeroVideo } from './AboutHeroVideo';
import styles from './AboutCompanyHero.module.css';

export function AboutCompanyHero({ className }: { className?: string }) {
  return (
    <section
      id="manufacturer"
      className={`${styles.section} ${className ?? ''}`}
      aria-labelledby="manufacturer-title"
    >
      <div className={styles.container}>
        <Breadcrumb locale="zh" tone="dark" items={[{ label: '关于苏能' }]} />
        <div className={styles.hero} data-about-layout="hero">
          <div className={styles.intro}>
            <p className={styles.kicker}>ABOUT SUNENG</p>
            <h1 id="manufacturer-title">关于苏能工业炉</h1>
            <p className={styles.heroLead}>
              江苏苏能工业炉有限公司是工业炉设备制造商，生产基地位于江苏泰州，提供非标工业炉、热处理生产线及工业炉大修与改造服务。
            </p>
          </div>

          <div className={styles.actions} data-about-layout="hero-actions">
            <WechatContactButton
              label="加微信，工况初判"
              description="请发送工件照片、材质和处理要求，便于初步判断。"
              className={`${getButtonClass('primary', 'lg')} ${styles.button} ${styles.primary}`}
            />
            <Button
              href="/zh/products"
              variant="secondary"
              size="lg"
              className={`${styles.button} ${styles.secondary}`}
            >
              查看产品中心
            </Button>
          </div>

          <AboutHeroVideo className={styles.video} caption="" />

          <dl className={styles.services} aria-label="主营业务">
            <div>
              <dt>单机与配套</dt>
              <dd>电阻式、燃气式工业炉定制及配套系统</dd>
            </div>
            <div>
              <dt>整线交付</dt>
              <dd>热处理生产线方案设计、设备制造与配套集成</dd>
            </div>
            <div>
              <dt>改造与大修</dt>
              <dd>工业炉大修及炉衬、燃烧、控制系统改造</dd>
            </div>
          </dl>

          <div className={styles.facts} data-about-layout="facts" aria-label="企业信息">
            <div>
              <p className={styles.factValue}>2006 年</p>
              <p className={styles.factLabel}>公司成立</p>
            </div>
            <div>
              <p className={styles.factValue}>江苏泰州</p>
              <p className={styles.factLabel}>制造基地</p>
            </div>
            <div>
              <p className={styles.factValue}>高新技术企业</p>
              <p className={styles.factLabel}>2024 年获证</p>
            </div>
          </div>
          <div className={styles.lowerBackground} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
