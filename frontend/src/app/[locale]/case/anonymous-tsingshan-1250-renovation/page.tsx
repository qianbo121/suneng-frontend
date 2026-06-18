import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ProductLeadForm } from '@/components/products/ProductLeadForm';
import { buildMetadata } from '@/lib/seo/metadata';
import { TSINGSHAN_1250_CASE_SEO } from '@/lib/seo/page-data';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type FactItem = [string, ReactNode];

const pagePath = '/zh/case/anonymous-tsingshan-1250-renovation';
const aboutPath = '/zh/about';
const servicePath = '/zh/service/furnace-renovation-overhaul';
const heroImage = '/images/service/after-sales-hero.png';

export const dynamicParams = false;

const heroFacts: FactItem[] = [
  ['项目类型', '工业炉节能改造（A3 cluster 核心案例）'],
  ['改造规模', '3 条 1250mm 连续退洗线'],
  [
    '合作模式',
    '苏能作为节能改造的核心技术与设备供应方，与客户技术团队联合完成方案设计、设备制造、现场安装、调试与验收。',
  ],
  ['执行方', '江苏苏能工业炉有限公司（成立于 2006 年，国家高新技术企业，证书编号 GR202432008987）'],
];

const projectGoals = [
  '降低吨钢综合能耗成本',
  '达标 GB 28665-2012《轧钢工业大气污染物排放标准》',
  '提升设备稳定性',
  '建立可数字化追溯的工艺控制体系',
];

const matchingPoints = [
  '苏能在不锈钢宽带钢光亮退火生产线领域有较深的技术积累。',
  '多项已授权专利覆盖电阻炉、燃气热处理炉、固溶炉、网带淬火炉等产品方向。',
  '具备从单机到整线交付的工程能力，拥有 5,080 万元注册资本与 14,700 ㎡ 生产基地。',
  '与中国五矿恩菲等工程总承包公司有协作经验，对总包项目流程熟悉。',
];

const originalParameters: FactItem[] = [
  ['产线规格', '1250mm × 3 条'],
  ['工艺类型', '连续退火 + 酸洗（退洗一体）'],
  ['燃料', '天然气'],
  ['控制系统', '传统继电器 + 老式 PLC 混合'],
  ['烟气余热利用', '仅助燃空气预热（单级）'],
];

const bottlenecks = [
  {
    title: '瓶颈 1：燃料成本压力',
    text: '天然气作为主燃料，吨钢燃料成本居高不下。客户内部存在未充分利用的冷煤气、转炉煤气等副产气，理论上具备替代天然气的成本优势，但需要完整的燃烧系统改造与控温适配。',
  },
  {
    title: '瓶颈 2：烟气热能浪费',
    text: '原有烟气回收仅做单级助燃空气预热，烟气出炉温度仍偏高。通过多级回收，可将钢带预热、空气预热和蒸汽利用组合起来进一步利用烟气余热。',
  },
  {
    title: '瓶颈 3：控温精度与排放达标',
    text: '老式控制系统温度均匀性偏差较大，同时燃烧系统不具备低 NOx 分级燃烧能力，需围绕 GB 28665-2012《轧钢工业大气污染物排放标准》及所在地环保要求进行系统升级。',
  },
  {
    title: '瓶颈 4：风机变频空间',
    text: '原工频风机始终按固定状态运行，与实际工况下变化的负荷不匹配，存在按工况动态调节的节能空间。',
  },
];

const solutionModules = [
  {
    title: '模块 A：燃料结构升级 + 燃烧系统改造',
    intro: '从天然气切换为钢厂副产气，并围绕低 NOx 分级燃烧与空燃比双交叉限幅控制重构燃烧系统。',
    items: [
      '燃料切换：以冷煤气为主、转炉煤气为辅，利用客户内部已有但未充分使用的副产气资源。',
      '低 NOx 分级燃烧烧嘴：替换原燃烧器，降低 NOx 生成。',
      '空燃比双交叉限幅控制：通过高精度燃烧控制策略，保障不同负荷下的燃烧效率稳定。',
      'NOx 排放：按项目验收检测结果满足 GB 28665-2012《轧钢工业大气污染物排放标准》及项目所在地环保要求。',
    ],
  },
  {
    title: '模块 B：三级烟气余热回收',
    intro: '由单级助燃空气预热升级为钢带预热、助燃空气预热、蒸汽利用的三级递进式回收。',
    items: [
      '第 1 级：利用高温段烟气对入炉钢带预热，降低退火加热段负荷。',
      '第 2 级：利用中温段烟气对助燃空气预热，提升燃烧效率。',
      '第 3 级：利用低温段烟气通过烟气余热回收配套系统产生工艺蒸汽，供应至客户酸洗工序。',
      '该路径形成“烟气余热 → 酸洗用蒸汽”的能源闭环。',
    ],
  },
  {
    title: '模块 C：控温系统升级 + 风机变频',
    intro: '将控制系统升级为西门子 S7-1500 系列 PLC + ET200SP 分布式 I/O，并按工况负荷动态调整风机运行状态。',
    items: [
      '控温分区：从 13 区控温优化为多加热室多控温区精细化分区。',
      'HMI 人机界面：实时显示炉温、工艺曲线、报警信息。',
      '数据追溯：所有工艺参数数字化记录，支持历史曲线查询与导出。',
      '客户系统对接：根据客户实际 MES / SCADA 系统接口完成对接。',
    ],
  },
];

const lineDeployment = [
  '产线 1：燃料切换 + 低 NOx 燃烧 + 三级烟气回收 + 13 区控温优化 + 风机变频',
  '产线 2：同产线 1 的改造模块组合',
  '产线 3：同产线 1 的改造模块组合',
];

const implementationStages = [
  {
    title: '阶段 1：现场勘查与方案设计（约 30-45 个工作日）',
    items: [
      '现场勘查 3 条产线的实际工况、燃烧系统、控温系统、烟气路径、机械传动等。',
      '收集最近 12 个月历史能耗数据、产量数据和工艺质量数据。',
      '基于现场数据建立能耗诊断模型，量化各能耗环节占比。',
      '输出三大模块的完整技术方案、CAD 图纸、PID 控制图和设备清单。',
    ],
  },
  {
    title: '阶段 2：设备制造（约 4-6 个月）',
    items: [
      '烧嘴、控制柜、变频柜、烟气余热回收配套设备等核心设备在苏能 14,700 ㎡ 生产基地制造。',
      '关键工序按 ISO 9001:2015 质量管理体系执行，质检记录可追溯。',
      '主要部件出厂前完成单机调试。',
      '邀请客户技术代表参与 F.A.T 工厂验收试验。',
    ],
  },
  {
    title: '阶段 3：现场安装与调试（每条线约 30-60 天）',
    items: [
      '按合同约定的停产窗口分线施工，避免 3 条线同时停产。',
      '苏能工程师现场指导耐材拆除、新设备安装、电气接线。',
      '按单机试运行、联动调试、工艺曲线测试的顺序推进。',
      '对客户操作团队开展操作规范、日常维护、应急处理培训。',
    ],
  },
  {
    title: '阶段 4：性能测试与验收',
    items: [
      '空载升温曲线测试。',
      '按合同约定的工艺要求进行工艺曲线验证。',
      '开展 TUS 温度均匀性测试与 SAT 系统准确度测试。',
      '完成 NOx 排放检测与节能效益核算，节能效益按改造前后 6 个月对比。',
    ],
  },
  {
    title: '阶段 5：质保期内服务',
    items: [
      '客户服务热线 +86-130-5298-6814。',
      '现场上门服务依据合同约定、设备状态、现场工况和服务距离安排。',
      '配件供应：易损件库存保障不少于 6 个月，核心非标部件保障期不少于 5 年。',
      '根据客户实际运行数据提供工艺优化建议。',
    ],
  },
];

const effectRows: FactItem[] = [
  ['年节能效益', '约 7,644 万元/年（3 条线合计）'],
  ['拆解公式', '7,644 万元/年 = 63.7 元/吨 × 120 万吨/年'],
  ['吨钢降本构成', '燃料结构升级为主要贡献项，三级烟气回收、控温精度提升与风机变频共同形成补充贡献。'],
  ['年产量说明', '120 万吨为该项目年度节能效益测算的基础参数，不构成对客户实际产能、产能利用率或经营数据的披露。'],
];

const otherEffects = [
  {
    title: 'NOx 排放达标',
    text: '改造后 NOx 排放按项目验收检测结果满足 GB 28665-2012《轧钢工业大气污染物排放标准》及项目所在地环保要求。具体排放数据以第三方检测或验收报告为准。',
  },
  {
    title: '控温精度提升',
    text: '控温精度从改造前到改造后有显著改善，工艺曲线可重复性提升。具体精度数值受加热元件配置、热电偶布置、控制系统调试质量等因素影响。',
  },
  {
    title: '运行稳定性改善',
    text: '设备稳定性和运行连续性较改造前有所改善。具体运行数据受客户生产计划、维护制度和产线负荷影响，本页不单独披露具体数值。',
  },
  {
    title: '数字化追溯能力',
    text: '所有工艺参数实现数字化记录与历史曲线查询，为客户后续质量追溯、工艺优化、ESG 报告提供数据基础。',
  },
];

const dataFactors = [
  '原炉型结构与设计能耗水平',
  '原燃料类型与燃料结构升级空间',
  '产线实际负荷与年产量水平',
  '原保温状态与控制系统精度',
  '客户内部副产气资源与价格条件',
  '改造方案的设计深度与施工质量',
  '改造后的运行制度与维护水平',
];

const technicalDetails = [
  {
    title: '技术细节 1：燃烧系统改造的关键挑战',
    paragraphs: [
      '从天然气切换为副产气并非简单燃料替换。副产气热值通常低于天然气，单位时间内需要的体积流量增加，需要重新设计燃料管道、阀门和烧嘴尺寸。',
      '副产气热值随钢厂工况波动，需要通过空燃比双交叉限幅控制实时调整，保证燃烧稳定。副产气含 CO 等可燃且有毒气体，安全控制等级要求更高，需要完善吹扫程序、火检系统和紧急切断阀。',
    ],
  },
  {
    title: '技术细节 2：三级烟气回收的能量分布',
    paragraphs: [
      '炉膛出口烟气先用于钢带预热，再用于空气预热，最后通过烟气余热回收配套系统回收低温段热量。每一级回收都对应不同换热设备设计，包括高温辐射换热结构、管式或板式换热器和蒸汽利用接口。',
      '三级回收的目标不是单点追求极限温降，而是在工艺稳定、检修可达和安全边界内，把原先排走的热量转化为可用能源。',
    ],
  },
  {
    title: '技术细节 3：控制系统升级的关键设计',
    paragraphs: [
      '控制系统升级后，多控温区精细化分区、主控 PLC、分布式 I/O、HMI 触摸屏、历史数据库和报警分级共同构成新的过程控制基础。',
      '所有工艺参数按高频采样并存储，支持历史曲线导出；在客户授权后，苏能售后团队可通过远程接口辅助诊断。',
    ],
  },
  {
    title: '技术细节 4：分阶段施工的工程组织',
    paragraphs: [
      '3 条产线同时改造对客户产能影响过大，因此采用分线分阶段实施。每个阶段客户保留部分产线持续生产，将产能损失控制在合理范围。',
      '这种组织方式需要苏能与客户工程团队、生产团队、质量团队紧密协同，提前确认停产窗口、物资到场节奏和调试验收节点。',
    ],
  },
];

const feedbackItems = [
  '能耗成本下降符合方案测算预期。',
  'NOx 排放按验收检测结果满足相关国家标准。',
  '控制系统运行稳定性较改造前有所提升。',
  '工艺曲线数字化记录便于质量追溯与 ESG 报告编制。',
];

const consultationItems = [
  '现场勘查与能耗诊断：苏能工程师到现场实地评估，输出能耗瓶颈分析与可行性方案。',
  '改造方案设计：含技术方案、CAD 图纸、设备清单、改造工程量、投资回报测算。',
  '整线交付能力：从设备制造到现场安装、调试、培训、售后的全流程交付。',
  '多行业经验：覆盖不锈钢、钢铁、汽车零部件、能源装备等多个行业的工业炉改造经验。',
];

const caseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': 'https://www.jssngyl.cn/zh/case/anonymous-tsingshan-1250-renovation',
  headline: '某青山系不锈钢企业 1250mm 三线连续退洗线节能改造案例',
  alternativeHeadline: ['1250mm 不锈钢退洗线节能改造案例', '热处理炉节能改造案例：年节能约 7,644 万元', '三线连续退洗线节能技改案例'],
  description:
    '苏能工业炉为某青山系不锈钢深加工企业完成 1250mm 连续退洗线节能改造，通过燃烧系统、控温系统、烟气余热回收三大模块升级，实现年节能效益约 7,644 万元/年。',
  datePublished: '2026-05-27T10:00:00+08:00',
  dateModified: '2026-05-27T10:00:00+08:00',
  author: {
    '@type': 'Organization',
    name: '苏能工业炉工程技术团队',
    url: 'https://www.jssngyl.cn',
  },
  publisher: {
    '@type': 'Organization',
    name: '江苏苏能工业炉有限公司',
    url: 'https://www.jssngyl.cn',
    telephone: '+86-130-5298-6814',
    email: 'jssngyl@outlook.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '张甸蔡官工业区',
      addressLocality: '姜堰区',
      addressRegion: '江苏省泰州市',
      postalCode: '225536',
      addressCountry: 'CN',
    },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: '国家高新技术企业',
      identifier: 'GR202432008987',
    },
  },
  about: [
    {
      '@type': 'Thing',
      name: '工业炉节能改造',
    },
    {
      '@type': 'Thing',
      name: '不锈钢连续退火生产线',
    },
    {
      '@type': 'Thing',
      name: '烟气余热回收',
    },
  ],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.jssngyl.cn/zh/case/anonymous-tsingshan-1250-renovation',
  },
};

export async function generateStaticParams() {
  return [{ locale: 'zh' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return buildMetadata({
    title: TSINGSHAN_1250_CASE_SEO.title,
    description: TSINGSHAN_1250_CASE_SEO.description,
    path: pagePath,
    pageKey: 'case',
    keywords: TSINGSHAN_1250_CASE_SEO.keywords,
    image: TSINGSHAN_1250_CASE_SEO.ogImage,
    type: 'article',
    publishedTime: TSINGSHAN_1250_CASE_SEO.publishedTime,
    modifiedTime: TSINGSHAN_1250_CASE_SEO.modifiedTime,
    alternateLocales: {
      'zh-CN': pagePath,
      'x-default': pagePath,
    },
  });
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-[#e2e8f0] py-12 scroll-mt-24 lg:py-16">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#c51624]">{eyebrow}</p>
        <h2 className="mt-3 text-[26px] font-semibold leading-[1.28] text-[#101828] lg:text-[38px]">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-[#3f4a5f] lg:text-[16px]">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="mt-[0.74em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c51624]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FactList({ items }: { items: FactItem[] }) {
  return (
    <dl className="grid gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="grid gap-1 border-b border-[#e7edf5] pb-3 last:border-b-0 sm:grid-cols-[150px_1fr]">
          <dt className="text-[13px] font-semibold text-[#667085]">{label}</dt>
          <dd className="text-[15px] leading-[1.75] text-[#253047]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function NumberBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c51624] text-[18px] font-semibold text-white">
      {children}
    </span>
  );
}

export default async function AnonymousTsingshanCasePage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return (
    <div className="bg-white text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] text-white">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-34" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,36,0.96)_0%,rgba(12,38,74,0.86)_55%,rgba(12,38,74,0.58)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-20">
          <Breadcrumb
            locale="zh"
            currentLabel="1250mm 三线连续退洗线节能改造案例"
            tone="light"
            className="text-[13px]"
            items={[
              { label: '关于苏能', href: aboutPath },
              { label: '项目案例' },
            ]}
          />

          <div className="mt-10 max-w-[980px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/64">A3 Case Study</p>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.18] tracking-[0.01em] lg:text-[56px]">
              某青山系不锈钢企业 1250mm 三线连续退洗线节能改造案例
            </h1>
            <p className="mt-5 text-[18px] font-semibold leading-[1.7] text-white/92 lg:text-[24px]">
              燃料结构升级 + 三级烟气余热回收 + 控温系统优化
            </p>

            <div className="mt-8 grid gap-4 rounded-[8px] border border-white/18 bg-white/10 p-5 backdrop-blur md:grid-cols-2">
              {heroFacts.map(([label, value]) => (
                <div key={label}>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/52">{label}</p>
                  <p className="mt-2 text-[15px] leading-[1.8] text-white/88">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-7 max-w-[940px] rounded-[8px] bg-white/10 p-5 text-[15px] leading-[1.9] text-white/78">
              <strong className="font-semibold text-white">数据声明：</strong>
              本案例所列数据均基于该项目实际测算结果。具体节能效益与原炉型结构、燃料类型、产线负荷、保温状态、控制系统、运行制度和现场工况密切相关，需以现场诊断和改造方案测算为准。本案例数据仅作为同类工程参考，不构成对其他项目的节能效果承诺。如项目涉及压力容器或特种设备要求，应由具备相应资质的单位提供或配合实施。
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
              >
                获取报价方案
              </a>
              <a
                href={servicePath}
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                查看相关解决方案
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section id="background" eyebrow="Background" title="一、客户与项目背景">
        <div className="grid gap-7 lg:grid-cols-[0.98fr_1.02fr]">
          <article className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">客户简述（C2 脱敏）</h3>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
              该客户为青山系不锈钢深加工企业，主营 200/300 系不锈钢宽带钢冷轧、退火、酸洗、精整加工。
            </p>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
              考虑客户商业信息保护，本案例对客户主体、合同金额、具体年份、合作周期、客户内部产能等敏感信息进行脱敏处理。
            </p>
          </article>

          <article className="rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)]">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">项目契机</h3>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
              随着行业能耗指标日益收紧，以及钢厂副产气资源的成本优势凸显，客户启动三条 1250mm 连续退洗线的整体节能改造项目。
            </p>
            <BulletList items={projectGoals} />
          </article>
        </div>

        <article className="mt-7 rounded-[8px] border border-[#d6e0ec] bg-[#f7fafc] p-6">
          <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">苏能切入</h3>
          <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
            该客户在前期对国内多家工业炉厂家进行技术比选后，最终选择苏能作为节能改造的核心技术与设备供应方。从项目匹配度看，苏能具备以下承接条件：
          </p>
          <BulletList items={matchingPoints} />
        </article>
      </Section>

      <Section id="before" eyebrow="Diagnosis" title="二、改造前现状与瓶颈分析">
        <div className="grid gap-7 lg:grid-cols-[0.86fr_1.14fr]">
          <article className="rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)]">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">原产线基础参数</h3>
            <div className="mt-5">
              <FactList items={originalParameters} />
            </div>
          </article>

          <div className="grid gap-4">
            {bottlenecks.map((item) => (
              <article key={item.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
                <h3 className="text-[19px] font-semibold leading-[1.4] text-[#101828]">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.85] text-[#344054]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="solution" eyebrow="Solution" title="三、改造方案设计">
        <p className="max-w-[920px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          苏能针对该项目设计 3 大模块改造方案，覆盖燃烧、控温、烟气回收、风机变频等关键节能维度。
        </p>
        <div className="mt-8 grid gap-6">
          {solutionModules.map((module) => (
            <article key={module.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6 lg:p-7">
              <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">{module.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{module.intro}</p>
              <BulletList items={module.items} />
            </article>
          ))}
        </div>

        <article className="mt-7 rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-6">
          <h3 className="text-[20px] font-semibold text-[#101828]">改造范围全景图（3 条产线一致部署）</h3>
          <BulletList items={lineDeployment} />
          <p className="mt-5 text-[15px] leading-[1.9] text-[#344054]">3 条线分阶段实施，避免一次性停产对客户产能造成过大影响。</p>
        </article>
      </Section>

      <Section id="implementation" eyebrow="Implementation" title="四、改造实施过程">
        <div className="grid gap-5">
          {implementationStages.map((stage, index) => (
            <article key={stage.title} className="grid gap-5 rounded-[8px] border border-[#e1e7f0] bg-white p-5 shadow-[0_10px_24px_rgba(15,35,75,0.04)] md:grid-cols-[64px_1fr]">
              <NumberBadge>{index + 1}</NumberBadge>
              <div>
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">{stage.title}</h3>
                <BulletList items={stage.items} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="results" eyebrow="Results" title="五、改造后效果与数据拆解">
        <div className="rounded-[8px] border border-[#c51624]/20 bg-[#fff7f7] p-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#c51624]">Core Result</p>
          <h3 className="mt-3 text-[30px] font-semibold leading-[1.25] text-[#101828] lg:text-[44px]">年节能效益约 7,644 万元/年</h3>
          <p className="mt-4 max-w-[900px] text-[15px] leading-[1.9] text-[#344054]">
            数据来源为改造完成后 6 个月与改造前 6 个月的能耗与产量数据对比测算。
          </p>
        </div>

        <div className="mt-7 rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)]">
          <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">数据拆解</h3>
          <div className="mt-5">
            <FactList items={effectRows} />
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {otherEffects.map((effect) => (
            <article key={effect.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">{effect.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.9] text-[#344054]">{effect.text}</p>
            </article>
          ))}
        </div>

        <article className="mt-7 rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-6">
          <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">数据使用说明</h3>
          <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
            本案例所列年节能效益 7,644 万元/年、吨钢降本 63.7 元/吨、年产量 120 万吨等数据，均基于该具体项目的实际测算结果。
          </p>
          <BulletList items={dataFactors} />
          <p className="mt-5 text-[15px] leading-[1.9] text-[#344054]">
            本案例数据仅作为同类工程参考，不构成对其他项目的节能效果承诺。任何节能改造项目的预期效益，需以现场诊断、能耗建模和方案测算的具体输出为准。
          </p>
        </article>
      </Section>

      <Section id="technology" eyebrow="Technology" title="六、技术细节深挖">
        <div className="grid gap-6">
          {technicalDetails.map((detail) => (
            <article key={detail.title} className="rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)] lg:p-7">
              <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">{detail.title}</h3>
              <div className="mt-4 space-y-4">
                {detail.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] leading-[1.9] text-[#344054]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="feedback" eyebrow="Feedback" title="七、客户反馈与后续合作">
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">项目交付后的客户使用情况</h3>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
              改造项目验收后，3 条产线进入正式运行阶段。客户对改造效果的反馈主要集中在以下几个方面：
            </p>
            <BulletList items={feedbackItems} />
          </article>

          <article className="rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)]">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">苏能在不锈钢深加工领域的累计交付</h3>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
              苏能在不锈钢深加工领域，含连续退洗线、罩式炉、光亮退火炉、固溶炉等热处理装备，累计交付项目数量已具备一定规模。具体客户名单与项目数据涉及商业保密，可在商务接洽中提供经客户授权的参考材料。
            </p>
          </article>
        </div>
      </Section>

      <Section id="case-contact-section" eyebrow="Contact" title="八、咨询同类改造方案">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6 lg:p-7">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">苏能可以提供</h3>
            <BulletList items={consultationItems} />

            <address className="mt-7 space-y-3 border-t border-[#e1e7f0] pt-6 text-[15px] leading-[1.8] text-[#344054] not-italic">
              <p>
                <strong className="font-semibold text-[#101828]">电话 / 微信：</strong>
                <a href="tel:+8613052986814" className="text-[#c51624]">+86-130-5298-6814</a>
              </p>
              <p>
                <strong className="font-semibold text-[#101828]">邮箱：</strong>
                <a href="mailto:jssngyl@outlook.com" className="text-[#c51624]">jssngyl@outlook.com</a>
              </p>
              <p>
                <strong className="font-semibold text-[#101828]">联系人：</strong>
                唐荔
              </p>
              <p>
                <strong className="font-semibold text-[#101828]">地址：</strong>
                江苏省泰州市姜堰区张甸蔡官工业区
              </p>
            </address>

            <div className="mt-7 border-t border-[#e1e7f0] pt-5 text-[14px] leading-[1.8] text-[#667085]">
              <p>相关页面：<a href={servicePath} className="font-semibold text-[#c51624]">工业炉节能改造与热处理炉大修服务</a></p>
              <p>技术审核：苏能工业炉工程技术团队</p>
              <p>发布日期：2026-05-27</p>
              <p>最后更新：2026-05-27</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[8px]">
            <ProductLeadForm
              anchorId="contact"
              title="提交类似项目需求"
              description="把工件、工艺、产能和现场条件发给苏能，技术人员可先判断适合的炉型方向与方案边界。"
              submitLabel="提交需求"
            />
          </div>
        </div>
      </Section>

      <JsonLd id="tsingshan-1250-case-jsonld" data={caseJsonLd} />
    </div>
  );
}
