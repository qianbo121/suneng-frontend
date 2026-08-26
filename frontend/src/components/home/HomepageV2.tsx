import Image from 'next/image';
import Link from 'next/link';
import { HiArrowRight, HiOutlineCursorArrowRays } from 'react-icons/hi2';

import { HomepageBottomLeadBar } from '@/components/home/HomepageBottomLeadBar';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';

import styles from './HomepageV2.module.css';

const taskPaths = [
  {
    id: 'heat-treatment-line',
    title: '我要上热处理线',
    description: '工件、工艺和产量，整线按需配置',
    label: '查看整线方案',
    href: '/zh/solutions/continuous-heat-treatment-line',
    image: '/images/home/scenario-01-heat-treatment-line-780.webp',
    imageAlt: '完整热处理生产线工程手绘图',
    imageWidth: 1653,
    imageHeight: 729,
    imageClassName: styles.taskImageLine,
  },
  {
    id: 'furnace-selection',
    title: '我要选一台炉',
    description: '按工件、工艺温度和装炉量初选炉型',
    label: '看炉型和适用工件',
    href: '#product-types',
    image: '/images/home/scenario-02-furnace-selection-780.webp',
    imageAlt: '井式炉、箱式炉与罩式炉工程手绘图',
    imageWidth: 1380,
    imageHeight: 693,
    imageClassName: styles.taskImageSelection,
  },
  {
    id: 'old-furnace-diagnosis',
    title: '台车炉或旧炉出问题',
    description: '能耗高、温度不均这类老毛病——维修、改造还是换新？',
    label: '判断大修还是买新',
    href: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
    image: '/images/home/scenario-03-old-furnace-diagnosis-20260825-780.webp',
    imageAlt: '带炉门密封结构标注的旧台车式热处理炉工程手绘图',
    imageWidth: 1670,
    imageHeight: 941,
    imageClassName: styles.taskImageDiagnosis,
  },
] as const;

const workpieceCases = [
  {
    industry: '不锈钢深加工',
    workpiece: '不锈钢带材',
    process: '连续退火、酸洗',
    image: '/images/about/about-furnace-fabrication.jpg',
    imageAlt: '苏能工厂内工业炉炉体制造现场',
    imageNote: '炉体制造现场｜工厂实拍',
    title: '某不锈钢深加工企业连续退洗线改造',
    href: '/zh/case/anonymous-tsingshan-1250-renovation',
  },
  {
    industry: '工程机械零部件',
    workpiece: 'PC200~PC400 支重轮',
    process: '连续加热、自动淬火、回火冷却',
    image: '/images/about/about-production-line.jpg',
    imageAlt: '苏能工厂内连续式热处理设备总装现场',
    imageNote: '连续设备总装｜工厂实拍',
    title: '济宁支重轮热处理生产线',
    href: '/zh/case/jining-support-roller-heat-treatment-line',
  },
  {
    industry: '不锈钢带材加工',
    workpiece: '480~750 mm 不锈钢带材',
    process: '连续退火、固溶、分段冷却',
    image: '/images/about/about-furnace-delivery.jpg',
    imageAlt: '苏能工业炉设备发运现场',
    imageNote: '工业炉设备发运｜工厂实拍',
    title: '河南连续退火固溶生产线',
    href: '/zh/case/henan-annealing-solution-line',
  },
] as const;

const productTypes = [
  {
    name: '台车炉',
    range: '大型铸件、模具、焊接结构件等周期式热处理',
    image: '/images/home/product-center/trolley-furnace-real.jpg',
    href: '/zh/products/detail/trolley-furnace',
  },
  {
    name: '箱式炉',
    range: '中小型零件、试制件与小批量工件热处理',
    image: '/images/home/product-center/box-furnace-real.jpg',
    href: '/zh/products/detail/box-furnace',
  },
  {
    name: '井式炉',
    range: '轴类、杆类、长件与竖向装炉工件热处理',
    image: '/images/home/product-center/pit-furnace-real.jpg',
    href: '/zh/products/detail/pit-furnace',
  },
  {
    name: '罩式炉',
    range: '卷材、线材及批量装框工件的整体热处理',
    image: '/images/home/product-center/bell-furnace-real.jpg',
    href: '/zh/products/detail/bell-furnace',
  },
  {
    name: '网带炉',
    range: '标准件、紧固件与小型零件的连续热处理',
    image: '/images/home/product-center/mesh-belt-furnace-real.jpg',
    href: '/zh/products/detail/mesh-belt-furnace',
  },
  {
    name: '推杆炉',
    range: '批量稳定、节拍明确的工件连续热处理',
    image: '/images/home/product-center/pusher-furnace-real.jpg',
    href: '/zh/products/detail/pusher-furnace',
  },
  {
    name: '辊底炉',
    range: '板材、棒材、管材等规整工件的连续热处理',
    image: '/images/home/product-center/roller-hearth-furnace-real.jpg',
    href: '/zh/products/detail/roller-hearth-furnace',
  },
  {
    name: '转底炉',
    range: '锻件、盘类件与环形工件的节拍式加热',
    image: '/images/home/product-center/rotary-hearth-furnace-real.jpg',
    href: '/zh/products/detail/rotary-hearth-furnace',
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
      <section id="task-paths" className={styles.section} data-sticky-contact-start>
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

      <section
        id="workpiece-experience"
        className={`${styles.section} ${styles.softSection} ${styles.workpieceSection}`}
      >
        <div className={styles.container}>
          <SectionHeading
            title="这些工件，我们有过项目经验"
            description="行业、工件与工艺均来自已公开项目，图片为苏能工厂实拍。"
          />
          <div className={styles.workpieceLayout}>
            <figure className={styles.factoryLead}>
              <div className={styles.factoryLeadImage}>
                <Image
                  src="/images/home/production-line-evidence-crop-20260825.jpg"
                  alt="苏能工厂内在制热处理设备"
                  fill
                  sizes="(max-width: 900px) 100vw, 31vw"
                  className={styles.coverImage}
                />
              </div>
              <figcaption>
                <span className={styles.eyebrow}>工厂实拍</span>
                <strong>从制造现场看交付能力</strong>
                <p>炉体、输送与配套机构在厂内完成制造和总装。</p>
              </figcaption>
            </figure>

            <div className={styles.workpieceCaseGrid}>
              {workpieceCases.map((item) => (
                <Link key={item.href} href={item.href} className={styles.workpieceCard}>
                  <figure className={styles.workpieceCardMedia}>
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 900px) 50vw, 23vw"
                      className={styles.coverImage}
                    />
                    <figcaption>{item.imageNote}</figcaption>
                  </figure>
                  <div className={styles.workpieceCardBody}>
                    <h3>{item.title}</h3>
                    <dl>
                      <div>
                        <dt>行业</dt>
                        <dd>{item.industry}</dd>
                      </div>
                      <div>
                        <dt>工件</dt>
                        <dd>{item.workpiece}</dd>
                      </div>
                      <div>
                        <dt>工艺</dt>
                        <dd>{item.process}</dd>
                      </div>
                    </dl>
                    <span className={styles.cardAction}>
                      查看项目案例
                      <HiArrowRight aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="product-types" className={`${styles.section} ${styles.productSection}`}>
        <div className={styles.container}>
          <SectionHeading
            title="我们有哪些产品类型？"
            description="具体炉膛尺寸、温度和装炉量，按您的项目确认。"
          />
          <Link
            href="/zh/solutions/continuous-heat-treatment-line"
            className={styles.productionLineLead}
          >
            <figure className={styles.productionLineMedia}>
              <Image
                src="/images/about/about-production-line.jpg"
                alt="苏能工厂内连续式热处理设备总装现场"
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
                className={styles.coverImage}
              />
              <figcaption>连续式热处理设备总装｜工厂实拍</figcaption>
            </figure>
            <div className={styles.productionLineBody}>
              <span className={styles.eyebrow}>热处理生产线</span>
              <h3>按工件、工艺和产量配置整线</h3>
              <p>适用于需要连续加热、冷却、输送、上下料与控制系统协同的项目。</p>
              <ul className={styles.productionLineTags} aria-label="热处理生产线适用范围">
                <li>带材</li>
                <li>工程机械零部件</li>
                <li>连续退火、固溶、淬火与回火</li>
              </ul>
              <span className={styles.cardAction}>
                查看热处理生产线
                <HiArrowRight aria-hidden="true" />
              </span>
            </div>
          </Link>

          <div className={styles.productGrid}>
            {productTypes.map((item) => (
              <Link key={item.href} href={item.href} className={styles.productCard}>
                <figure className={styles.productCardMedia}>
                  <Image
                    src={item.image}
                    alt={`${item.name}设备实拍`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw"
                    className={styles.containImage}
                  />
                </figure>
                <h3>{item.name}</h3>
                <p>{item.range}</p>
                <span className={styles.productCardAction}>
                  查看产品
                  <HiArrowRight aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomepageLeadForm />

      <HomepageBottomLeadBar />
    </div>
  );
}
