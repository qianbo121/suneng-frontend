import { EnglishSolutionPage, englishSolutionMetadata } from '@/components/engineering/EnglishSolutionsPage';
import { solutionAlternates } from '@/lib/english-solutions';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  HiCheckCircle,
  HiOutlineArchiveBox,
  HiOutlineChartBar,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineSquare3Stack3D,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';
import { JsonLd } from '@/components/JsonLd';
import {
  AnchorNav,
  FaqSection,
  Hero,
  InfoCards,
  InfoColumns,
  Resources,
  Section,
} from '@/components/engineering/EngineeringPage';
import { lineFaqs, processes, selectionRows } from '@/components/engineering/engineering-content';
import styles from '@/components/engineering/EngineeringPage.module.css';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { getBreadcrumbJsonLd, getFaqJsonLd, getWebPageJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

// Existing published project evidence, preserved with its original limits.
const publishedProjectEvidence = [
  {
    factId: 'SN-CASE-P0-008',
    title: '3 条 1250 mm 连续退洗线节能改造',
    text: '项目由天然气改为冷煤气：方案按 8500/1450 kcal/Nm³ 热值复算，冷煤气总设计量 17150 Nm³/h、接口压力 20±3 kPa，并采用双交叉限幅控制。以上只对应本项目燃料与设备边界。',
    href: '/zh/case/anonymous-tsingshan-1250-renovation',
  },
  {
    factId: 'SN-CASE-P0-007',
    title: '1250 mm 连续退洗线退火固溶段',
    text: '1250 mm 为名义规格及最大带宽，实际带宽 800–1250 mm、厚度 2.5–4.0 mm；额定工艺速度 40 m/min、最大 45 m/min，带钢温度约 1080–1180℃，加热/均热段约 105 m。',
  },
  {
    factId: 'SN-CASE-P0-006',
    title: '850 mm 连续退火钝化线退火固溶段',
    text: '850 mm 为名义机组规格，实际带宽 480–750 mm、厚度 1.6–4.0 mm；带钢退火温度 1050–1150℃，炉体约 130 m，设计 TV 约 190 m·mm/min。',
    href: '/zh/case/henan-annealing-solution-line',
  },
  {
    factId: 'SN-CASE-P0-002',
    title: '托辊网带正火回火连续线',
    text: '2017 方案为正火炉 800 mm、回火炉 1000 mm；2026 方案为正火炉 1000 mm、回火炉 1200 mm。额定温度分别为 950℃、650℃，多区 PID 与变频网带属于方案配置。',
  },
  {
    factId: 'SN-CASE-P0-003',
    title: 'RCWT 托辊网带淬火回火线',
    text: '2020 RCWT-360/220-9/6：宽度 850/1000 mm、速度 30–250 mm/min；2026 RCWT-250/200-9/6：宽度 800/1000 mm、速度 50–300 mm/min。950℃、650℃均为额定温度。',
  },
  {
    factId: 'SN-CASE-P0-004',
    title: 'RCWT-75/45-9/6 可控气氛网带线',
    text: '淬火段有效尺寸 400×3200 mm，回火段 400×5600 mm，网带速度 30–250 mm/min；最大设计能力约 150 kg/h，按 0.4 m×0.25 m/min×60×25 kg/㎡计算。',
  },
  {
    factId: 'SN-CASE-P0-005',
    title: '网带式渗碳气氛热处理生产线',
    text: '有效加热区 9300×1000×100 mm，炉段功率 300 kW，最高工作温度 950℃；典型设计能力约 5000 件/24 h，最大工况约 6000 件/24 h，均不是实际日产量。',
  },
  {
    factId: 'SN-CASE-P0-009',
    title: '热轧退火酸洗项目退火炉',
    text: '2021 年 850 mm 与 2024 年 1250 mm 为两个 HAPL 项目；炉体采用预热段 + 4 个加热段、约 8 区控制。700–1200℃为工艺覆盖范围，低于 80℃为冷却/干燥出口项目考核目标。',
  },
  {
    factId: 'SN-CASE-P0-010',
    title: '低氮燃气加热炉生产线',
    text: '同一生产线含 2 台炉，单台有效尺寸 2500×1600×800 mm；每台 4 套 250 kW 级低氮天然气烧嘴，燃烧装机能力约 1000 kW。助燃空气 200–300℃为设计预热目标，NOx 以现场检测为准。',
  },
  {
    factId: 'SN-CASE-P0-011',
    title: '750 t/d 不锈钢连续退火双带炉',
    text: '750 t/d 为单台炉合同设计能力，代表条件为 J3A、2.3×600 mm、双带、26.6 m/min；炉体约 110 m，含水冷、挤干和干燥段后约 125.4 m，不代表实际日产量。',
  },
  {
    factId: 'SN-CASE-P0-001',
    title: 'PC200–PC400 支重轮热处理生产线',
    text: '项目淬火炉额定温度 950℃、有效加热区 6400×300×300 mm，最大设计处理能力 500 kg/h，方案折算约 30 件/h；实际能力按工件和节拍确定。',
    href: '/zh/case/jining-support-roller-heat-treatment-line',
  },
];

const pagePath = '/zh/solutions/continuous-heat-treatment-line';
const description =
  '苏能根据工件材质、热处理要求与目标产量配置连续热处理生产线，介绍选型方向、工艺流程、济宁支重轮项目经验及供货验收范围。可先发工件照片、材质、产量和已知处理要求咨询。';
export const dynamicParams = false;
type PageProps = { params: Promise<{ locale: string }> };
export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale === 'en') return englishSolutionMetadata('continuous-heat-treatment-line');
  if (locale !== 'zh') notFound();
  const metadata = buildMetadata({
    title: '连续热处理生产线解决方案｜选型与项目经验',
    description,
    path: pagePath,
    image: '/images/products/annealing-solution-line/gallery/line-01.jpg',
    alternateLocales: solutionAlternates('continuous-heat-treatment-line'),
  });
  if (process.env.NODE_ENV === 'development' || process.env.SITE_NOINDEX === 'true') {
    metadata.robots = { index: false, follow: false };
  }
  return metadata;
}
export default async function ContinuousHeatTreatmentLinePage({ params }: PageProps) {
  const { locale } = await params;
  if (locale === 'en') return <EnglishSolutionPage slug="continuous-heat-treatment-line" />;
  if (locale !== 'zh') notFound();
  return (
    <div className={styles.page} data-engineering-page="line">
      <AnchorNav
        items={[
          ['fit', '方案选择'],
          ['process', '工艺流程'],
          ['experience', '项目案例'],
          ['faq', '常见问题'],
          ['inquiry', '提交需求'],
        ]}
      />
      <Hero
        eyebrow="苏能工业炉 · 热处理生产线"
        title="连续热处理生产线解决方案"
        text="苏能根据工件材质、热处理要求与目标产量，配置连续热处理生产线。先发工件照片、材质和产量，初步判断适合的生产线类型。"
        image="/images/products/annealing-solution-line/gallery/line-01.jpg"
        alt="带材连续退火固溶生产线参考设备，展示开卷、输送和连续加热炉结构"
      />
      <Section
        id="fit"
        title="你的项目适合连续线吗？"
        intro="以下用于初步判断，需结合工件、工艺和现场条件确定设备方向。"
      >
        <InfoColumns
          items={[
            {
              title: '较适合连续线',
              items: ['工件与产量相对稳定', '工艺路线相近，持续生产'],
              icon: HiCheckCircle,
            },
            {
              title: '需要进一步评估',
              items: ['品种变化较多，工艺差异较大', '装料方式或现场空间受限'],
              icon: HiOutlineArchiveBox,
            },
            {
              title: '也可考虑周期炉',
              items: ['多品种、小批量', '需要经常切换不同工艺'],
              icon: HiOutlineSquare3Stack3D,
            },
          ]}
        />
      </Section>
      <Section id="process" title="不同工艺，对应不同流程" soft>
        <div className={styles.processes}>
          {processes.map((process) => (
            <div className={styles.processRow} key={process.title}>
              <h3>{process.title}</h3>
              <ol className={styles.processSteps} aria-label={process.title}>
                {process.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className={styles.note}>
          清洗、干燥按介质与工艺配置；实际流程按材质、热处理要求和输送方式确定。
        </p>
        <div className={styles.numberStrip}>
          <h3>整线配置关注这5项</h3>
          {['上料输送', '加热与控温', '冷却及后处理', '自动化衔接', '安全保护'].map(
            (item, index) => (
              <span key={item}>
                <b className={styles.number}>{String(index + 1).padStart(2, '0')}</b>
                {item}
              </span>
            ),
          )}
        </div>
      </Section>
      <Section id="selection-table" title="从工件和工艺，找到设备方向">
        <div
          className={styles.tableWrap}
          role="region"
          aria-label="生产线选型表，可横向滚动"
          tabIndex={0}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                {['工件／材料', '热处理需求', '可了解的生产线', '进一步确认'].map((h) => (
                  <th scope="col" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectionRows.map(([material, process, name, conditions, slug]) => (
                <tr key={slug}>
                  <td>{material}</td>
                  <td>{process}</td>
                  <td>
                    <Link href={`/zh/products/detail/${slug}`}>{name}</Link>
                  </td>
                  <td>{conditions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          先确定可能适合的生产线，再根据材质、尺寸、质量要求和产量确定配置。
        </p>
        <div className={styles.preparation}>
          <h3>确定方案前，先准备这4类信息</h3>
          <InfoCards
            four
            items={[
              { title: '工件与装料', text: '照片、材质、尺寸、装料方式。', icon: HiOutlineCube },
              {
                title: '工艺与质量',
                text: '处理要求、硬度、表面要求。',
                icon: HiOutlineDocumentText,
              },
              { title: '产量与节拍', text: '每小时产量、班次安排。', icon: HiOutlineChartBar },
              { title: '现场与配套', text: '车间空间、电源、燃气及水。', icon: HiOutlineCog6Tooth },
            ]}
          />
        </div>
      </Section>
      <Section id="experience" title="连续热处理生产线项目经验">
        <article className={styles.case}>
          <figure className={styles.caseMedia}>
            <Image
              src="/images/about/cases/08-case-jining-support-roller.jpg"
              alt="连续加热炉与网带输送结构的相关设备参考图"
              fill
              sizes="(max-width: 767px) 100vw, 580px"
            />
            <figcaption>相关设备</figcaption>
          </figure>
          <div className={styles.caseCopy}>
            <h3>济宁支重轮热处理生产线</h3>
            <p>工程机械零部件 · 多规格支重轮</p>
            <dl>
              {[
                ['项目需求', '协调连续加热、自动淬火、回火与喷淋冷却。'],
                ['主要设备', '连续加热炉、自动淬火机床、回火炉、喷淋冷却及电气控制。'],
                ['苏能参与', '整线方案与节拍协调、设备配置，按合同范围提供制造及安装调试。'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <Link
              className={styles.button}
              href="/zh/case/jining-support-roller-heat-treatment-line"
            >
              查看项目资料
            </Link>
          </div>
        </article>
        <div className={styles.center}>
          <Link className={styles.textLink} href="/zh/case">
            查看更多项目案例
          </Link>
        </div>
      </Section>
      <Section id="checkpoints" title="设备包括什么，交付时怎么检查？" soft>
        <InfoCards
          items={[
            {
              title: '供货范围',
              text: '明确炉体、输送、冷却与控制系统；列清现场配套与双方分工。',
              icon: HiOutlineWrenchScrewdriver,
            },
            {
              title: '质量与产能',
              text: '按约定工件、工艺和装料条件，确认质量要求与生产能力。',
              icon: HiOutlineShieldCheck,
            },
            {
              title: '验收与资料',
              text: '明确测温、试运行及适用验收项目，交付约定图纸与操作资料。',
              icon: HiOutlineClipboardDocumentList,
            },
          ]}
        />
        <p className="mt-5 text-sm leading-7 text-[#526277]" data-delivery-boundary>苏能通常作为热处理工业炉设备供应商、生产线设备供应商或设备分包方参与项目，按合同范围提供设计、制造、供货、安装指导、调试配合和售后支持。涉及土建、压力容器、特种设备、环保总包或工程总承包的部分，由具备相应资质的单位承担或配合实施。</p>
      </Section>
      <Section id="project-evidence" title="已公开的项目方案参数与适用边界" soft>
        <p className={styles.note}>
          以下为已公开项目技术方案中的参数和口径，用于说明方案经验，不代表当前设备的统一规格或实际验收结果；具体按项目条件确认。
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {publishedProjectEvidence.map((item) => (
            <article key={item.factId} className="rounded-[8px] border border-[#e1e7f0] bg-white p-6">
              <h3 className="text-[18px] font-semibold leading-[1.5] text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{item.text}</p>
              {item.href ? (
                <Link href={item.href} className="mt-4 inline-block text-[14px] font-semibold text-[#145ca8] underline underline-offset-4 focus-visible:outline focus-visible:outline-2">
                  查看对应项目资料与条件
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </Section>
      <FaqSection title="连续热处理生产线常见问题" faqs={lineFaqs} defaultOpenIndex={2} />
      <Resources
        title="选型与采购资料"
        items={[
          {
            title: '生产线产能怎么估算',
            description: '从目标合格产出，回算装料、工艺时间与上下游配套能力。',
            href: '/zh/news/shuju-news-36',
            label: '阅读整线产能回算方法',
          },
          {
            title: '哪些配置影响设备报价',
            description: '先准备工件与工艺资料，再明确供货和报价范围。',
            href: '/zh/articles/gongye-lu-baojia-canshu',
            label: '阅读报价参数清单',
          },
          {
            title: '生产线验收检查哪些项目',
            description: '分清单机、接口、联动与现场验证，写清测试条件和记录。',
            href: '/zh/news/heat-treatment-line-fat-single-machine-acceptance',
            label: '阅读生产线验收范围',
          },
        ]}
      />
      <HomepageLeadForm
        sectionId="inquiry"
        pageType="连续热处理生产线解决方案页"
        productTag="热处理生产线"
        successProductTag="连续热处理生产线项目情况"
        sourceModule="continuous_heat_treatment_line_form"
      />
      <JsonLd
        id="continuous-line-page-jsonld"
        data={getWebPageJsonLd({ path: pagePath, name: '连续热处理生产线解决方案', description })}
      />
      <JsonLd
        id="continuous-line-breadcrumb-jsonld"
        data={getBreadcrumbJsonLd([
          { name: '首页', url: '/zh' },
          { name: '解决方案', url: '/zh/solutions' },
          { name: '连续热处理生产线解决方案', url: pagePath },
        ])}
      />
      <JsonLd id="continuous-line-faq-jsonld" data={getFaqJsonLd(lineFaqs)} />
    </div>
  );
}
