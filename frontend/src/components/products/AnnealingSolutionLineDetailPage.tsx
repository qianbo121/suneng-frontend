import Image from 'next/image';
import { HiArrowRight } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ProductQuoteScrollButton } from '@/components/products/ProductLeadForm';
import { getBreadcrumbJsonLd, getFaqJsonLd, getProductDetailJsonLd } from '@/lib/seo/jsonld';
import { ANNEALING_LINE_FAQS } from '@/lib/annealing-line-inquiry';
import { getLineParameterSheet } from '@/lib/heat-treatment-lines';
import { siteSettings } from '@/mock/siteSettings';

import { AnnealingLineFaq } from './AnnealingLineFaq';
import { AnnealingLineInquiryForm } from './AnnealingLineInquiryForm';
import styles from './AnnealingSolutionLineDetailPage.module.css';

const PAGE_PATH = '/zh/products/detail/annealing-solution-line';
const PAGE_TITLE = '金属带材连续退火与固溶热处理生产线';
const PAGE_DESCRIPTION =
  '金属带材连续退火与固溶热处理生产线，按材料牌号、带宽厚度、运行速度、温度路径、冷却方式、表面要求和现场接口进行非标设计，并展示适用判断、项目经验、供货边界与验收条件。';

const sectionNav = [
  ['fit', '适用判断'],
  ['routes', '工艺路线'],
  ['selection', '选型与产能'],
  ['acceptance', '验收与提交工况'],
] as const;

const differenceRows = [
  {
    dimension: '主要目标',
    annealing: '恢复、再结晶、软化或去应力，具体目标随材料体系与来料状态确认。',
    solution: '使相关相充分固溶并配合快速冷却，组织、耐蚀性等性能目标按牌号与标准确认。',
  },
  {
    dimension: '关键工艺量',
    annealing: '升温路径、退火温度、有效保温时间、带速及受控冷却。',
    solution: '固溶温度、有效保温时间、敏感温区通过速度、转移与冷却能力。',
  },
  {
    dimension: '不能混同的指标',
    annealing: '控制精度、炉温均匀性与带材实际温度偏差需要分别约定。',
    solution: '设备最高设计温度不等于带材目标固溶温度，也不代表产品性能结果。',
  },
  {
    dimension: '表面与气氛',
    annealing: '根据氧化容许度、后续酸洗或光亮要求决定是否采用保护气氛。',
    solution: '除表面要求外，还需核对材料清洁度、气氛、露点或氧含量及冷却条件。',
  },
] as const;

const fitRows = [
  {
    dimension: '订单与节拍',
    good: '批量稳定，连续生产时间充足，目标产能明确。',
    review: '多规格切换，但生产计划能够合批并预留换卷停机。',
    other: '小批、多品种、订单波动大且换产频繁。',
  },
  {
    dimension: '材料形态',
    good: '卷带连续来料，带宽、厚度和卷重范围清楚。',
    review: '接头、焊缝、边部状态或卷径差异需要专项核对。',
    other: '短板、散件或无法稳定连续输送的材料形态。',
  },
  {
    dimension: '工艺基础',
    good: '牌号、产品标准和温度—时间—冷却路径基本明确。',
    review: '已有目标性能，但还需试样或小批工艺验证。',
    other: '材料牌号、目标性能和验收方法尚未确定。',
  },
  {
    dimension: '现场与接口',
    good: '厂房长度、公辅条件及前后道接口可以协同规划。',
    review: '需要保留旧设备、局部改造或与总包单位分工。',
    other: '空间、公辅或上下游能力无法满足连续运行条件。',
  },
] as const;

const decisionSteps = [
  ['STEP 01', '材料与来料状态', '牌号、热轧或冷轧、前处理和边部状态'],
  ['STEP 02', '目标组织与性能', '退火、固溶、去应力及执行标准'],
  ['STEP 03', '表面与气氛要求', '氧化、色差、光亮度、露点与氧含量'],
  ['STEP 04', '加热与冷却制度', '升温、保温、带速、分段或快速冷却'],
  ['STEP 05', '机组与验收边界', '炉段、冷却段、联控、接口和验证条件'],
] as const;

const designInputs = [
  ['01 / MATERIAL', '材料牌号与来料状态', '材料体系、热轧或冷轧、原始组织、表面状态及前处理。'],
  ['02 / STRIP', '带材规格与卷料条件', '宽度、厚度、波动范围、最大卷重、内外卷径和边部状态。'],
  ['03 / TARGET', '目标组织、性能与标准', '退火或固溶目的、产品标准、检测项目和代表规格。'],
  ['04 / CAPACITY', '产能、线速度与换产', '小时或年产能、有效运行时间、入口出口速度及换规格频率。'],
  ['05 / ATMOSPHERE', '表面与气氛要求', '氧化、色差、光亮度、气体组成、露点或氧含量和安全边界。'],
  [
    '06 / INTERFACE',
    '冷却与前后道接口',
    '风冷、水雾或水冷、张力纠偏、活套、公辅、基础和总包分工。',
  ],
] as const;


const supplyRows = [
  [
    '加热炉段',
    '预热、快速加热、均热/固溶炉段及配套工程经验',
    '炉长、温区、加热方式、炉衬和检修边界',
    '前处理、入口活套及整线节拍协调',
  ],
  [
    '冷却与后处理',
    '空气、水雾、水冷、挤干与烘干等接口经验',
    '冷却能力、板形、表面状态和防残留处理',
    '酸洗、清洗、废水及下游工序接口',
  ],
  [
    '燃烧与控制',
    '燃烧、温控、联锁、报警及运行控制系统',
    '品牌、数据记录、通讯和上位系统联接',
    '能源介质、电源、排烟和厂级系统',
  ],
  [
    '机械与整线接口',
    '托辊支撑、张力控制、纠偏及速度协同经验',
    '收放卷、焊接、活套和机械分工',
    '整线总包、厂房空间及基础条件',
  ],
  [
    '安装与调试',
    '设备供应范围内的安装指导和分阶段调试配合',
    '安装责任、现场管理、试运行和验证范围',
    '施工条件、安全管理及跨单位协调',
  ],
] as const;

const acceptanceLayers = [
  [
    'LEVEL 01',
    '设备功能验收',
    ['机械运行、速度与张力联动', '温控、记录、报警与安全联锁', '电气、公辅、冷却和接口功能'],
  ],
  [
    'LEVEL 02',
    '工艺性能验收',
    [
      '代表工况下的温度路径和停留时间',
      '炉温、带温及测试方法分别约定',
      '气氛组成、露点或氧含量和冷却位置',
    ],
  ],
  [
    'LEVEL 03',
    '产品质量验证',
    [
      '按约定牌号、规格和产品标准验证',
      '组织、性能、表面及板形按合同项目确认',
      '来料与前后道条件纳入责任边界',
    ],
  ],
] as const;

const timeline = [
  ['01', '需求与资料'],
  ['02', '边界冻结'],
  ['03', '方案与设计'],
  ['04', '制造与出厂检验'],
  ['05', '安装调试'],
  ['06', '负载验证'],
] as const;

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className={styles.sectionHeading}>
      <span className={styles.sectionIndex} aria-hidden="true">
        {index}
      </span>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

function CompactFlow({ items }: { items: readonly string[] }) {
  return (
    <ol className={styles.compactFlow}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

export function AnnealingSolutionLineDetailPage() {
  const publicPhone = siteSettings.salesPhone.replace(/^\+86-?/, '');

  return (
    <div className={styles.page}>
      <JsonLd
        id="breadcrumb-jsonld-annealing-solution-line"
        data={getBreadcrumbJsonLd([
          { name: '首页', url: 'https://www.jssngyl.cn/zh' },
          { name: '产品中心', url: 'https://www.jssngyl.cn/zh/products' },
          { name: PAGE_TITLE, url: `https://www.jssngyl.cn${PAGE_PATH}` },
        ])}
      />
      <JsonLd
        id="product-jsonld-annealing-solution-line"
        data={getProductDetailJsonLd(
          {
            slug: 'annealing-solution-line',
            path: PAGE_PATH,
            name: PAGE_TITLE,
            alternateName: ['连续退火生产线', '固溶处理生产线', '不锈钢带材退火固溶线'],
            description: PAGE_DESCRIPTION,
            image: [
              '/images/products/annealing-solution-line/gallery/line-02.png',
              '/images/products/annealing-solution-line/gallery/line-01.jpg',
            ],
            keywords: ['金属带材连续退火生产线', '不锈钢固溶生产线', '退火固溶段设备'],
            dateModified: '2026-09-04',
          },
          'zh',
        )}
      />
      <JsonLd
        id="product-faq-jsonld-annealing-solution-line"
        data={getFaqJsonLd([...ANNEALING_LINE_FAQS])}
      />

      <div className={styles.breadcrumbBar}>
        <div className={styles.container}>
          <Breadcrumb
            locale="zh"
            tone="dark"
            className={styles.breadcrumb}
            items={[
              { label: '产品中心', href: '/zh/products' },
              { label: '连续式热处理生产线', href: '/zh/products#continuous-furnace-title' },
              { label: '退火固溶生产线' },
            ]}
          />
        </div>
      </div>

      <section
        className={`${styles.container} ${styles.hero}`}
        aria-labelledby="annealing-line-title"
      >
        <div className={styles.heroCopy}>
          <p className={styles.heroSeries}>连续式热处理生产线系列</p>
          <h1 id="annealing-line-title">{PAGE_TITLE}</h1>
          <p className={styles.heroLead}>
            面向不锈钢及其他金属带材的连续加热、保温与受控冷却。具体工艺路线和机组配置，按材料牌号、来料状态、目标性能、表面要求与产能节拍确定。
          </p>
          <p className={styles.heroConclusion}>
            <strong>先说结论</strong>
            退火与固溶都属于热处理。不锈钢中也常用“固溶退火”的称谓，应按材料牌号、目标组织和温度—时间—冷却制度确认路线，再确定是否共用设备。
          </p>
          <dl className={styles.heroInfo}>
            <div>
              <dt>适用对象</dt>
              <dd>卷带类金属材料</dd>
            </div>
            <div>
              <dt>核心输入</dt>
              <dd>牌号、规格、速度</dd>
            </div>
            <div>
              <dt>方案边界</dt>
              <dd>按项目非标确认</dd>
            </div>
          </dl>
          <div className={styles.heroActions}>
            <ProductQuoteScrollButton
              anchorId="evaluation"
              label="提交带材参数，获取初步判断"
              updateHash
              className={styles.primaryButton}
            />
            <a className={styles.secondaryButton} href="#fit">
              查看适用判断表
            </a>
          </div>
          <p className={styles.heroNote}>
            初步判断不等于最终选型；设备配置及性能指标以双方确认的技术方案为准。
          </p>
        </div>
        <figure className={styles.heroMedia}>
          <Image
            src="/images/products/annealing-solution-line/gallery/line-02.png"
            alt="金属带材连续热处理生产线设备示意"
            width={1672}
            height={941}
            priority
            sizes="(max-width: 767px) 100vw, 52vw"
          />
          <figcaption>
            <strong>连续带材热处理机组形态</strong>
            <span>
              设备示意
            </span>
          </figcaption>
        </figure>
      </section>

      <section className={styles.facts} aria-label="企业与项目经验信息">
        <dl className={styles.container}>
          <div>
            <dt>2006 年成立</dt>
            <dd>公司成立时间</dd>
          </div>
          <div>
            <dt>约 14700 m²</dt>
            <dd>公司自报生产基地</dd>
          </div>
          <div>
            <dt>河南项目</dt>
            <dd>退洗线设备经验经授权公开</dd>
          </div>
          <div>
            <dt>泰州・姜堰</dt>
            <dd>设计、制造与交付协同</dd>
          </div>
        </dl>
      </section>

      <nav className={styles.anchorNav} aria-label="本页导航">
        <div className={styles.container}>
          {sectionNav.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section id="fit" className={`${styles.section} ${styles.container}`}>
        <SectionHeading
          index="01"
          eyebrow="PROCESS DIFFERENCE"
          title="先区分连续退火与连续固溶，再讨论生产线配置"
          description="两类工艺可以共用部分连续机组，但不能仅凭“最高温度”或“表面效果”互相替代；材料牌号、目标组织性能和冷却制度是首要依据。"
        />
        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th scope="col">判断维度</th>
                <th scope="col">连续退火</th>
                <th scope="col">连续固溶</th>
              </tr>
            </thead>
            <tbody>
              {differenceRows.map((row) => (
                <tr key={row.dimension}>
                  <th scope="row">{row.dimension}</th>
                  <td>{row.annealing}</td>
                  <td>{row.solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.boundaryNote}>
          <strong>工程边界</strong>
          “退火”“固溶”“光亮处理”不能只作为营销标签使用；页面中的结论必须附材料、工况与验收条件。
        </p>
      </section>

      <section className={`${styles.section} ${styles.softSection}`}>
        <div className={styles.container}>
          <SectionHeading
            index="02"
            eyebrow="FIT CHECK"
            title="先判断是否适合连续式生产，再确定工艺路线与机组配置"
            description="连续线更适合规格和节拍相对稳定的卷带类材料；尺寸、重量已经填写，不代表设备已经兼容，仍需结合工艺、产能和前后道接口核算。"
          />
          <div className={styles.tableWrap}>
            <table className={`${styles.dataTable} ${styles.fitTable}`}>
              <thead>
                <tr>
                  <th scope="col">判断维度</th>
                  <th scope="col">较适合连续式</th>
                  <th scope="col">需要工程确认</th>
                  <th scope="col">优先评估其他方式</th>
                </tr>
              </thead>
              <tbody>
                {fitRows.map((row) => (
                  <tr key={row.dimension}>
                    <th scope="row">{row.dimension}</th>
                    <td>
                      <strong className={styles.good}>较适合连续式</strong>
                      <span>{row.good}</span>
                    </td>
                    <td>
                      <strong className={styles.review}>需要工程确认</strong>
                      <span>{row.review}</span>
                    </td>
                    <td>
                      <strong className={styles.other}>优先评估其他方式</strong>
                      <span>{row.other}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.decisionBar}>
            <p>判断原则：工艺由材料和标准决定，生产线由规格、节拍、输送方式与现场接口共同确定。</p>
            <ProductQuoteScrollButton
              anchorId="evaluation"
              label="把现有参数发给工程师"
              className={styles.smallButton}
            />
          </div>
        </div>
      </section>

      <section id="routes" className={`${styles.section} ${styles.container}`}>
        <SectionHeading
          index="03"
          eyebrow="ROUTE SELECTION"
          title="根据材料、目标性能与表面要求选择典型工艺路线"
          description="正确顺序是先确认材料与工艺目标，再确定气氛、温度路径、冷却组合和整线接口；不能在缺少材料条件时先套用公共炉段。"
        />
        <ol className={styles.decisionSteps}>
          {decisionSteps.map(([step, title, text]) => (
            <li key={step}>
              <span>{step}</span>
              <strong>{title}</strong>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className={styles.routeGrid}>
          <article className={styles.routeCard}>
            <div className={styles.routeTitle}>
              <div>
                <span>典型路线 A</span>
                <h3>退洗线退火固溶段</h3>
              </div>
              <small>已有公开项目经验</small>
            </div>
            <p>适用于需要高温退火或固溶、分段冷却并衔接后续退洗工序的项目。</p>
            <CompactFlow
              items={['整线接口', '预热', '快速加热', '均热/固溶', '分段冷却', '挤干/烘干']}
            />
            <dl className={styles.routeDetails}>
              <div>
                <dt>关键条件</dt>
                <dd>不锈钢牌号、带宽厚度、TV 值、温度路径、敏感温区通过速度。</dd>
              </div>
              <div>
                <dt>冷却组合</dt>
                <dd>空冷、水雾冷却、水冷围绕冷却速度、板形与后续酸洗条件组合。</dd>
              </div>
              <div>
                <dt>接口重点</dt>
                <dd>托辊、张力、纠偏、燃烧控制、公辅及总包责任边界。</dd>
              </div>
            </dl>
            <p className={styles.routeCaution}>
              路线为项目经验框架，不表示所有新项目都采用相同炉长、温度或冷却组合。
            </p>
          </article>
          <article className={styles.routeCard}>
            <div className={styles.routeTitle}>
              <div>
                <span>典型路线 B</span>
                <h3>保护气氛光亮处理</h3>
              </div>
              <small>需逐项目评估</small>
            </div>
            <p>适用于对氧化、色差和表面状态要求更高的连续处理场景。</p>
            <CompactFlow
              items={['带材清洁', '密封/置换', '分区加热', '有效保温', '保护冷却', '收卷衔接']}
            />
            <dl className={styles.routeDetails}>
              <div>
                <dt>关键条件</dt>
                <dd>材料体系、来料清洁度、气体组成、纯度、露点或氧含量及安全要求。</dd>
              </div>
              <div>
                <dt>冷却组合</dt>
                <dd>冷却速度、带温、气氛保护和出口表面状态需要联合验证。</dd>
              </div>
              <div>
                <dt>接口重点</dt>
                <dd>炉口密封、压力与流量、检测位置、排放以及张力联控。</dd>
              </div>
            </dl>
            <p className={styles.routeCaution}>
              “保护气氛”不等同于无条件光亮；结果取决于材料、清洁度、气氛、露点或氧含量和工艺制度。
            </p>
          </article>
        </div>
      </section>

      <section id="selection" className={`${styles.section} ${styles.softSection}`}>
        <div className={styles.container}>
          <SectionHeading
            index="04"
            eyebrow="DESIGN INPUTS"
            title="方案由六类基础条件共同确定"
            description="六类输入需要共同进入炉长、温区、速度、冷却、张力与控制系统的核算，不能用单一温度或带宽直接套用设备。"
          />
          <div className={styles.inputGrid}>
            {designInputs.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className={styles.boundaryNote}>
            <strong>避免误判</strong>
            已提供带宽、厚度或卷重，只代表输入更完整，并不自动等于设备兼容或方案已经确定。
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.container}`}>
        <SectionHeading
          index="05"
          eyebrow="CAPACITY CALCULATION"
          title="线速度、停留时间与年产能必须在同一工况下核算"
          description="页面只展示测算关系，不给脱离材料与运行制度的固定产量；实际设计值以代表规格、工艺曲线和双方确认的有效生产时间为准。"
        />
        <div className={styles.calcGrid}>
          <article className={styles.formulaPanel}>
            <h3>三项基础测算关系</h3>
            <ol>
              <li>
                <span>01　小时理论处理量</span>
                <strong>带宽（m）× 厚度（m）× 带速（m/min）× 密度（kg/m³）× 60</strong>
              </li>
              <li>
                <span>02　年合格产能</span>
                <strong>小时理论处理量 × 年有效运行小时 × 综合成材率</strong>
              </li>
              <li>
                <span>03　炉内停留时间</span>
                <strong>有效工艺段长度 ÷ 线速度，并结合实际温度路径校核</strong>
              </li>
            </ol>
            <p>
              结果为 kg/h；毫米尺寸先除以 1000
              换算为米。有效运行小时已扣除的停机和换卷时间不重复计算；均热保温从带材满足工艺温度条件后起算，不能把全炉停留时间当作有效保温时间。
            </p>
          </article>
          <article className={styles.basisPanel}>
            <h3>页面显示任何产能数字时，必须同时标注</h3>
            <dl>
              <div>
                <dt>代表材料</dt>
                <dd>材料牌号、密度及来料状态</dd>
              </div>
              <div>
                <dt>代表规格</dt>
                <dd>带宽、厚度、卷重及厚度波动</dd>
              </div>
              <div>
                <dt>工艺条件</dt>
                <dd>温度路径、有效保温与冷却方式</dd>
              </div>
              <div>
                <dt>运行制度</dt>
                <dd>线速度、换卷换产、年有效生产小时</dd>
              </div>
              <div>
                <dt>结果口径</dt>
                <dd>理论处理量或合格产能，以及采用的成材率</dd>
              </div>
            </dl>
          </article>
        </div>
        <div className={styles.capacityCta}>
          <div>
            <strong>已有材料、规格或速度参数？</strong>
            <span>提交现有资料，先判断工艺段组合与仍需补充的关键条件。</span>
          </div>
          <ProductQuoteScrollButton
            anchorId="evaluation"
            label="提交参数，获取初步路线判断"
            className={styles.capacityButton}
          />
        </div>
      </section>

      <section className={`${styles.section} ${styles.softSection}`}>
        <div className={styles.container}>
          <SectionHeading
            index="07"
            eyebrow="SYSTEM SCOPE"
            title="“生产线”必须说明苏能供什么、配合什么、由谁完成"
            description="报价前冻结设备段、公辅、土建、安装、总包及上下游接口；“生产线”名称不代表默认包含开卷、酸洗、废水处理、公辅或整线总包。"
          />
          <div className={styles.tableWrap}>
            <table className={`${styles.dataTable} ${styles.scopeTable}`}>
              <thead>
                <tr>
                  <th scope="col">系统</th>
                  <th scope="col">苏能已有经验范围</th>
                  <th scope="col">新项目需逐项确认</th>
                  <th scope="col">业主 / 总包接口</th>
                </tr>
              </thead>
              <tbody>
                {supplyRows.map((row) => (
                  <tr key={row[0]}>
                    <th scope="row">{row[0]}</th>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="acceptance" className={`${styles.section} ${styles.container}`}>
        <SectionHeading
          index="08"
          eyebrow="ACCEPTANCE"
          title="设备功能验收、工艺性能验收与产品质量验证"
          description="设备指标与产品结果分层约定；产品验证必须绑定代表材料、规格、工艺制度、检测方法和双方责任，不能把材料波动转化为无条件设备责任。"
        />
        <div className={styles.acceptanceGrid}>
          {acceptanceLayers.map(([level, title, items]) => (
            <article key={level}>
              <span>{level}</span>
              <h3>{title}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className={styles.boundaryNote}>
          <strong>温度指标</strong>
          如约定温度精度或“±”指标，必须同时说明测试温度、代表工况、测点、测温方式与验收方法。
        </p>
        <ol className={styles.timeline} aria-label="项目交付与验收过程">
          {timeline.map(([number, title]) => (
            <li key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className={`${styles.section} ${styles.softSection}`}>
        <div className={styles.container}>
          <SectionHeading
            index="09"
            eyebrow="BUYER QUESTIONS"
            title="连续退火与固溶生产线选型常见问题"
            description="先回答采购与技术人员最常问的决策问题；完整参数仍需在具体项目中确认。"
          />
          <div className={styles.faqGrid}>
            <AnnealingLineFaq items={ANNEALING_LINE_FAQS} styles={styles} />
            <aside className={styles.faqAside}>
              <h3>询价前先准备这 6 项</h3>
              <ul>
                <li>材料牌号与来料状态</li>
                <li>带宽、厚度、卷重与卷径</li>
                <li>退火或固溶目标及执行标准</li>
                <li>目标产能或线速度</li>
                <li>冷却、表面与气氛要求</li>
                <li>现场布局及上下游接口</li>
              </ul>
              <ProductQuoteScrollButton
                anchorId="evaluation"
                label="提交现有工况"
                className={styles.primaryButton}
              />
              <a
                className={styles.caseLink}
                href={getLineParameterSheet('annealing-solution-line')}
                download
              >
                下载带材询价参数清单 <HiArrowRight aria-hidden="true" />
              </a>
            </aside>
          </div>
          <nav className={styles.relatedLinks} aria-label="相关资料">
          </nav>
        </div>
      </section>

      <section id="evaluation" className={styles.formSection}>
        <div className={styles.container}>
          <AnnealingLineInquiryForm styles={styles} phone={publicPhone} />
        </div>
      </section>
    </div>
  );
}
