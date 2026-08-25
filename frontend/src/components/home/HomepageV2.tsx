import Image from 'next/image';
import Link from 'next/link';
import {
  HiArrowRight,
  HiOutlineCog6Tooth,
  HiOutlineCursorArrowRays,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';

import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';

import styles from './HomepageV2.module.css';

const taskPaths = [
  {
    id: 'heat-treatment-line',
    title: '我要上热处理线',
    description: '工件、工艺和产量，整线按需配置',
    label: '查看整线方案',
    href: '/zh/solutions/continuous-heat-treatment-line',
    image: '/images/home/scenario-01-heat-treatment-line.png',
    imageAlt: '完整热处理生产线工程手绘图',
    imageWidth: 1653,
    imageHeight: 729,
    imageClassName: styles.taskImageLine,
  },
  {
    id: 'furnace-selection',
    title: '我要选一台炉',
    description: '按工件、工艺温度和装炉量初选炉型',
    label: '从工件开始挑',
    href: '#selection-service',
    image: '/images/home/scenario-02-furnace-selection.png',
    imageAlt: '井式炉、箱式炉与罩式炉工程手绘图',
    imageWidth: 1380,
    imageHeight: 693,
    imageClassName: styles.taskImageSelection,
  },
  {
    id: 'old-furnace-diagnosis',
    title: '台车炉或旧炉出问题',
    description: '能耗高、温度不均等，修、改还是换',
    label: '判断大修还是买新',
    href: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
    image: '/images/home/scenario-03-old-furnace-diagnosis-20260825.png',
    imageAlt: '带炉门密封结构标注的旧台车式热处理炉工程手绘图',
    imageWidth: 1670,
    imageHeight: 941,
    imageClassName: styles.taskImageDiagnosis,
  },
] as const;

const engineeringSteps = [
  ['01', '先定工艺要求', '材料、温度、气氛、产能与质量要求。'],
  ['02', '再组织整线方案', '炉体、输送、控制、安全与辅助配置协同。'],
  ['03', '按项目范围推进', '制造、安装、调试、验收与投产支持。'],
] as const;

const selectionConditions = [
  ['01', '材料与工件', '材质、形态、尺寸与重量'],
  ['02', '热处理工艺', '温度、气氛与均匀性'],
  ['03', '装炉量与产能', '每炉装载、节拍与连续生产'],
  ['04', '现场与配套', '能源、场地、装炉与自动化'],
] as const;

const assessmentOutcomes = [
  ['A', '继续评估改造', '现有基础具备进一步判断条件'],
  ['B', '对比整炉换新', '改造边界或长期成本需要比较'],
  ['C', '先补资料或勘查', '现有条件不足以给出可靠答案'],
] as const;

const factoryEvidence = [
  {
    src: '/images/about/about-production-line.jpg',
    alt: '苏能工厂内连续式热处理设备总装现场',
    label: '连续式热处理设备总装｜工厂实拍',
  },
  {
    src: '/images/about/about-furnace-fabrication.jpg',
    alt: '苏能工厂内工业炉炉体制造现场',
    label: '工业炉炉体制造｜工厂实拍',
  },
  {
    src: '/images/about/about-furnace-delivery.jpg',
    alt: '苏能工业炉设备发运现场',
    label: '工业炉设备发运｜工厂实拍',
  },
] as const;

const caseCards = [
  {
    tag: '改造项目',
    title: '某不锈钢深加工企业连续退洗线改造',
    href: '/zh/case/anonymous-tsingshan-1250-renovation',
  },
  {
    tag: '生产线项目',
    title: '支重轮热处理生产线',
    href: '/zh/case/jining-support-roller-heat-treatment-line',
  },
  {
    tag: '生产线项目',
    title: '连续退火固溶生产线',
    href: '/zh/case/henan-annealing-solution-line',
  },
] as const;

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <h2>{title}</h2>
      </div>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function HomepageV2() {
  return (
    <div className={styles.page}>
      <section id="task-paths" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.entryHeading}>
            <div>
              <h2>您是哪种情况？</h2>
            </div>
            <p>
              <HiOutlineCursorArrowRays className={styles.entryPromptIcon} aria-hidden="true" />
              <span>选择最接近您的情况</span>
            </p>
          </div>
          <div className={styles.taskGrid}>
            {taskPaths.map((item) => (
              <Link key={item.id} href={item.href} className={styles.taskCard}>
                <div className={styles.taskCardHeader}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <div className={styles.taskIllustration}>
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    width={item.imageWidth}
                    height={item.imageHeight}
                    sizes="(max-width: 767px) calc(100vw - 72px), (max-width: 1023px) calc(50vw - 48px), 390px"
                    className={`${styles.taskImage} ${item.imageClassName}`}
                    draggable={false}
                  />
                </div>
                <span className={styles.taskAction}>
                  {item.label}
                  <span className={styles.taskArrow} aria-hidden="true">
                    <HiArrowRight />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.softSection} ${styles.productSection}`}>
        <div className={styles.container}>
          <SectionHeading
            title="热处理生产线整线交付，单台工业炉同样承接"
            description="单台工业炉的新建、改造和维修同样承接。"
          />
          <div className={styles.productLayout}>
            <article className={styles.productLead}>
              <figure className={styles.productLeadMedia}>
                <Image
                  src="/images/home/production-line-evidence-crop-20260825.jpg"
                  alt="苏能工厂内工业炉在制设备实拍"
                  fill
                  sizes="(max-width: 900px) 100vw, 34vw"
                  className={styles.coverImage}
                />
                <figcaption>工业炉在制设备｜工厂实拍</figcaption>
              </figure>
              <div className={styles.productLeadBody}>
                <span className={styles.eyebrow}>热处理生产线</span>
                <h3>
                  一条热处理线，<span className={styles.noWrap}>怎么</span>从方案做到投产
                </h3>
                <div className={styles.engineeringSteps}>
                  {engineeringSteps.map(([number, title, description]) => (
                    <div key={number}>
                      <span>{number}</span>
                      <div>
                        <h4>{title}</h4>
                        <p>{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/zh/solutions/continuous-heat-treatment-line"
                  className={styles.textLink}
                >
                  查看热处理生产线
                  <HiArrowRight aria-hidden="true" />
                </Link>
              </div>
            </article>

            <div className={styles.productRouteStack}>
              <article className={styles.productRouteCard}>
                <figure className={styles.productRouteImage}>
                  <Image
                    src="/images/home/trolley-furnace-evidence-20260825.png"
                    alt="台车式热处理炉"
                    fill
                    sizes="(max-width: 900px) 100vw, 28vw"
                    className={styles.containImage}
                  />
                </figure>
                <h3>台车式热处理炉</h3>
                <p>用途、结构方向、选型信息与适用边界集中查看。</p>
                <Link href="/zh/products/detail/trolley-furnace" className={styles.textLink}>
                  进入台车炉产品页
                  <HiArrowRight aria-hidden="true" />
                </Link>
              </article>
              <article className={`${styles.productRouteCard} ${styles.serviceRouteCard}`}>
                <HiOutlineWrenchScrewdriver className={styles.routeIcon} aria-hidden="true" />
                <span className={styles.eyebrow}>单台炉服务</span>
                <h3>新建、改造、维修</h3>
                <p>井式炉、箱式炉、罩式炉等其他炉型，新建、改造、维修都接。</p>
                <Link href="/zh/products" className={styles.textLink}>
                  查看全部炉型
                  <HiArrowRight aria-hidden="true" />
                </Link>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="selection-service" className={`${styles.section} ${styles.decisionSection}`}>
        <div className={styles.container}>
          <SectionHeading
            title="资料不全也可以先把方向判断清楚"
            description="四类条件放在首页；完整方法和具体实施范围进入对应服务页面。"
          />
          <div className={styles.decisionGrid}>
            <article className={styles.decisionPanel}>
              <HiOutlineCog6Tooth className={styles.routeIcon} aria-hidden="true" />
              <span className={styles.eyebrow}>从工况与现有问题判断</span>
              <h3>先看四类条件，再谈炉型</h3>
              <div className={styles.conditionGrid}>
                {selectionConditions.map(([number, title, description]) => (
                  <div key={number}>
                    <span>{number}</span>
                    <h4>{title}</h4>
                    <p>{description}</p>
                  </div>
                ))}
              </div>
              <Link href="/zh/service/furnace-renovation-overhaul" className={styles.textLink}>
                查看改造与工程服务
                <HiArrowRight aria-hidden="true" />
              </Link>
            </article>

            <article className={`${styles.decisionPanel} ${styles.assessmentPanel}`}>
              <span className={styles.eyebrow}>一页初步判断</span>
              <h3>提交后先获得可继续决策的一页</h3>
              <p className={styles.assessmentIntro}>
                把已知条件、判断依据、主要风险与建议下一步放在同一页。
              </p>
              <div className={styles.outcomeList}>
                {assessmentOutcomes.map(([number, title, description]) => (
                  <div key={number}>
                    <span>{number}</span>
                    <div>
                      <h4>{title}</h4>
                      <p>{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.panelFootnote}>
                资料不足时不替你拍板；炉型在提交后补充，或由工程人员内部归类。
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="case-evidence"
        className={`${styles.section} ${styles.softSection} ${styles.evidenceSection}`}
      >
        <div className={styles.container}>
          <SectionHeading
            title="先看真实制造现场，再进入完整案例"
            description="首页只展示可核验的实拍与正式案例，不使用空位，也不让其他设备案例冒充台车炉案例。"
          />
          <div className={styles.evidenceLayout}>
            <figure className={`${styles.evidenceFigure} ${styles.evidenceFigureLead}`}>
              <div className={styles.evidenceImage}>
                <Image
                  src={factoryEvidence[0].src}
                  alt={factoryEvidence[0].alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 66vw"
                  className={styles.coverImage}
                />
              </div>
              <figcaption>{factoryEvidence[0].label}</figcaption>
            </figure>
            <div className={styles.evidenceSide}>
              {factoryEvidence.slice(1).map((item) => (
                <figure key={item.src} className={styles.evidenceFigure}>
                  <div className={styles.evidenceImage}>
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 900px) 50vw, 28vw"
                      className={styles.coverImage}
                    />
                  </div>
                  <figcaption>{item.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <nav className={styles.caseLinks} aria-label="项目案例入口">
            {caseCards.map((item) => (
              <Link key={item.href} href={item.href}>
                <span>{item.tag}</span>
                <strong>{item.title}</strong>
                <HiArrowRight aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <HomepageLeadForm />
    </div>
  );
}
