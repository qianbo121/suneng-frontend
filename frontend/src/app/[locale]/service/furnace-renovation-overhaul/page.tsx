import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { buildMetadata } from '@/lib/seo/metadata';
import { FURNACE_RENOVATION_OVERHAUL_SEO } from '@/lib/seo/page-data';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type TextBlock = {
  title: string;
  text?: ReactNode;
  items?: ReactNode[];
};

const pagePath = '/zh/service/furnace-renovation-overhaul';
const heroImage = '/images/service/after-sales-hero.png';

export const dynamicParams = false;

const serviceScope = [
  {
    title: '节能改造',
    eyebrow: 'A3 cluster 核心',
    items: [
      '燃烧系统改造：电改气、气改电、燃料结构升级，如天然气改冷煤气、转炉煤气等钢厂副产气。',
      '烟气余热回收：三级回收方案，包括钢带预热、助燃空气预热、余热锅炉产蒸汽。',
      '控温系统升级：从传统继电器控制升级为 PLC 或 DCS 控制系统。',
      '自动化改造：变频器、二级控制带燃烧空燃比自寻优查表式模型。',
    ],
  },
  {
    title: '整炉大修',
    eyebrow: '炉体、热源、机械与密封系统',
    items: [
      '炉衬翻新：耐火材料更换与保温优化，陶瓷纤维模块、浇注料、砖砌结构按工况选型。',
      '加热元件更换：电阻丝、辐射管、硅碳棒、硅钼棒等。',
      '机械系统大修：推杆、辊道、链条、传动系统检修与升级。',
      '炉门密封修复：水冷炉门、电动升降机构等。',
      '风机系统更换或变频改造。',
    ],
  },
  {
    title: '复产与搬迁服务',
    eyebrow: '停产设备与搬迁设备恢复',
    items: [
      '停产多年的工业炉重启评估：检测炉体完整性、电气系统、控制系统、机械传动等关键部件，给出复产可行性方案。',
      '工厂搬迁后设备恢复：拆解、标记、运输、重新安装、调试、投产。',
      '复产复线：根据新生产工艺需求调整炉型参数。',
    ],
  },
  {
    title: 'TUS / SAT 测试与整改',
    eyebrow: '温度与控制系统验证',
    items: [
      'TUS（温度均匀性测试）：按相关行业标准对工业炉有效工作区进行温度均匀性测试。',
      'SAT（系统准确度测试）：测试温度控制系统的整体精度。',
      '提供测试报告，针对不达标项目给出整改方案。',
    ],
  },
];

const evaluationSteps: TextBlock[] = [
  {
    title: '第 1 步：基础信息收集',
    items: [
      '炉型、生产年份、制造厂家。',
      '设计能耗，包括吨钢能耗、单位产能耗。',
      '设计产能与实际产能。',
      '燃料类型、烟气排放数据。',
      '工艺要求，包括温度、温度均匀性、气氛。',
    ],
  },
  {
    title: '第 2 步：现场勘查',
    items: [
      '炉体结构完整性、耐材状态、保温状态。',
      '加热系统、控温系统、烟气系统。',
      '生产节拍、操作制度、设备维护记录。',
      '配套水电气路与车间环境。',
    ],
  },
  {
    title: '第 3 步：能耗诊断与瓶颈分析',
    items: [
      '各能耗环节占比：加热、散热、烟气带走、物料带走。',
      '主要节能潜力点：保温优化、烟气回收、控温精度提升、燃料替代。',
      '改造方案的技术可行性与经济性测算。',
    ],
  },
  {
    title: '第 4 步：改造方案设计',
    items: [
      '技术方案，含 CAD 图纸、PID 控制图、设备清单。',
      '改造工程量与施工计划。',
      '预期节能效果与投资回报测算。',
      '改造期间停产周期估算。',
    ],
  },
  {
    title: '第 5 步：方案评审与确认',
    items: [
      '技术方案细节。',
      '商务条款，包括费用、付款方式、质保期。',
      '改造施工排程。',
      'F.A.T 工厂验收试验标准。',
    ],
  },
];

const renovationPlans = [
  {
    title: '方案 A：不锈钢退火生产线节能改造',
    scenario: '适用 1000mm-1600mm 不锈钢带钢光亮退火生产线，如 1250mm 三线。',
    details: [
      '燃料结构升级：天然气改为转炉煤气、高炉煤气等钢厂副产气。',
      '燃烧系统：低 NOx 分级燃烧烧嘴与空燃比双交叉限幅控制。',
      '烟气余热回收：钢带预热 400-450℃、助燃空气预热 500-650℃、余热锅炉 0.3-1.0 MPa 蒸汽 3-5 t/h。',
      '控温系统：13 区控温优化为多加热室多控温区，西门子 S7-1500 与 ET200SP 分布式控制。',
      '风机变频：30kW 至 75kW 变频，按工况调整。',
    ],
    effects: [
      '在合适的工况条件下，吨钢能耗成本具备显著下降空间。',
      'NOx 排放可达标 GB 28665-2012 等相关行业标准。',
      '在部分连续生产线项目中，设备稳定性和月作业率具备提升空间，具体以改造范围和现场工况为准。',
      '单线年节能效益在合适工况下可达千万元级。',
    ],
  },
  {
    title: '方案 B：热处理炉控制系统升级',
    scenario: '适用使用 10 年以上、采用传统继电器或老式 PLC 控制的工业炉。',
    details: [
      '主控系统升级为西门子 S7-1500 系列 PLC 或同等级别 DCS。',
      '触摸屏人机界面实时显示炉温、工艺曲线、报警信息。',
      '温度记录从模拟纸质记录升级为数字化数据追溯。',
      '报警系统覆盖温度超限、加热元件断丝、热电偶故障等智能诊断。',
      '可对接客户 MES / SCADA 系统，按客户实际系统接口确定。',
    ],
    effects: [
      '控温精度可从 ±10℃ 提升到 ±3-5℃，视加热元件配置。',
      '工艺曲线可重复性提升，废品率下降。',
      '远程监控与故障预警能力提升。',
    ],
  },
  {
    title: '方案 C：炉衬翻新与保温优化',
    scenario: '适用使用 5-10 年、炉衬出现剥落、裂缝、保温效果下降的工业炉。',
    details: [
      '旧炉衬拆除与基础修复。',
      '新耐材选型：陶瓷纤维模块、浇注料、砖砌结构按温度等级和工艺要求配置。',
      '保温结构优化：分层保温设计，降低炉壁外表面温度。',
      '加热元件位置与功率重新匹配。',
    ],
    effects: [
      '炉壁外表面温度可下降 20-40℃。',
      '吨产品能耗可下降 5-15%，视原始保温状态。',
    ],
  },
  {
    title: '方案 D：复产 / 搬迁后炉子恢复',
    scenario: '适用停产 1 年以上的工业炉重启，或工厂搬迁后炉子重新投产。',
    details: [
      '炉体全面检查：耐材、加热元件、密封、传动机构。',
      '电气系统检查：控制柜、热电偶、变频器、传感器。',
      '机械系统检修：推杆、辊道、风机、传动链条。',
      '试运行：空载升温、负载试运行、工艺调试。',
      '操作培训：覆盖操作规范、日常维护、应急处理。',
    ],
    effects: [
      '复产时间通常 3-6 周，视设备状态和工艺复杂度。',
      '性能可恢复或接近原设计指标。',
    ],
  },
];

const caseStudies = [
  {
    title: '案例 1：某青山系不锈钢企业 1250mm 三线连续退洗线节能改造',
    facts: [
      ['行业', '不锈钢深加工（200/300 系宽带钢）'],
      ['项目类型', '节能改造 + 控制系统升级 + 烟气余热回收'],
      ['改造规模', '3 条 1250mm 连续退洗线'],
      ['年节能效益', '7,644 万元/年（按吨钢降本 63.7 元 × 120 万吨/年）'],
    ],
    content:
      '主要改造内容包括天然气改为冷煤气、低 NOx 分级燃烧、三级烟气回收、13 区控温优化、风机变频改造。',
    note:
      '上述数据来源于该改造项目的实际测算结果。具体节能效益与原炉型结构、燃料类型、产线负荷、保温状态、控制系统、运行制度和现场工况密切相关，需以现场诊断和改造方案测算为准。本案例数据仅作为同类工程参考，不构成对所有项目的节能效果承诺。',
  },
  {
    title: '案例 2：某不锈钢压延企业罩式炉生产线技改',
    facts: [
      ['行业', '不锈钢深加工'],
      ['项目类型', '罩式炉气氛系统升级 + 控制系统改造'],
      ['合作时长', '累计 5 次合作'],
    ],
    content: '主要改造内容包括氢气保护气氛系统升级、控温精度优化、工艺数据数字化追溯。',
  },
  {
    title: '案例 3：某工程总包项目设备分包',
    facts: [
      ['行业', '海外工程项目（一带一路项目）'],
      ['项目类型', '不锈钢热处理装备分包供应'],
      ['合作伙伴', '中国五矿恩菲等工程总包单位、武汉乾冶等工程公司'],
    ],
    content: '苏能作为设备分包方，与工程总包公司协作完成项目设备制造、现场安装、调试与售后。',
  },
];

const guaranteeStages = [
  {
    title: '1. 方案设计阶段',
    items: [
      '改造方案经苏能技术团队内部评审与客户技术评审双重确认。',
      '关键技术参数写入合同附件，包括节能率、控温精度、温度均匀性。',
      '提供 F.A.T 工厂验收试验标准与方法。',
    ],
  },
  {
    title: '2. 制造与安装阶段',
    items: [
      '设备制造严格执行 ISO 9001:2015 质量管理体系。',
      '关键工序质检记录可追溯。',
      '现场安装由苏能工程师指导或主导。',
      '安装完成后进行单机试运行与联动调试。',
    ],
  },
  {
    title: '3. 调试与验收阶段',
    items: [
      '空载升温曲线测试。',
      '按合同约定的工艺要求进行工艺曲线验证。',
      'TUS（温度均匀性测试）与 SAT（系统准确度测试）。',
      '性能测试报告作为验收依据。',
    ],
  },
  {
    title: '4. 质保与售后',
    items: [
      '质保期 1 年，自验收合格之日起，具体以合同为准。',
      '易损件库存保障不少于 6 个月。',
      '非标设备配件保障期不少于 5 年，核心部件可协商延长。',
      '客户服务热线 +86-139-1444-2520。',
      '现场上门服务依据合同约定、设备状态、现场工况和服务距离安排。',
    ],
  },
];

const faqs = [
  {
    question: 'Q1：工业炉节能改造能省多少？',
    answer: (
      <>
        <p>
          不同项目节能空间差异较大，需结合炉型结构、燃料类型、保温状态、控制系统和运行制度测算。炉衬翻新与保温优化、控温系统升级、烟气余热回收、燃料结构调整，都会对应不同的节能空间。
        </p>
        <p>
          苏能改造过的某青山系不锈钢企业 1250mm 三线，年节能效益达 7,644 万元/年（吨钢降本 63.7 元）。具体效果与原炉型结构、燃料类型、产线负荷、保温状态、控制系统、运行制度和现场工况密切相关，需以现场诊断和方案测算为准。该案例数据仅作为同类工程参考，不构成对所有项目的节能效果承诺。
        </p>
      </>
    ),
  },
  {
    question: 'Q2：工业炉节能改造需要停产多久？',
    answer:
      '通常分两种情况：部分外围系统升级可在生产间隙进行，停产时间 1-7 天；整炉大修叠加节能改造通常 30-90 天，复杂的跨工艺改造可能需要 4-6 个月。苏能会在方案设计阶段给出明确的停产周期估算，并与客户协商最佳改造窗口。',
  },
  {
    question: 'Q3：热处理炉大修费用怎么算？',
    answer:
      '费用主要由设备制造费、耐材费、施工费、运输辅料、TUS/SAT 测试等构成。具体费用与改造范围、设备规格、耐材选型、现场工况密切相关，需以现场勘查和最终方案为准。',
  },
  {
    question: 'Q4：老旧热处理炉是大修还是直接买新的？',
    answer:
      '需要综合评估设备主体结构、工艺需求、改造投入、新购费用、现场空间与搬迁条件。主体结构完整、工艺需求基本不变、现场空间受限时，可优先评估大修；设备超过设计寿命、主体腐蚀严重或工艺需求大幅变化时，可同步评估新购方案。',
  },
  {
    question: 'Q5：苏能能改造其他厂家或进口的工业炉吗？',
    answer:
      '可以评估。苏能改造服务可对苏能自制设备及部分非苏能品牌工业炉提供大修、技改、搬迁复产和节能改造评估。进口炉需结合设备资料、控制系统、备件条件和现场状态综合判断。具体设备品牌与改造方案可在现场勘查阶段进一步沟通确认。',
  },
  {
    question: 'Q6：改造验收看哪些指标？',
    answer:
      '主要指标包括温度精度、温度均匀性、控制精度、设计产能、实际产能、月作业率、吨产品能耗、单位产能能耗、NOx / SO2 / 颗粒物排放、试运行稳定性与报警次数。具体验收标准由合同约定，参考相关行业标准。',
  },
  {
    question: 'Q7：工业炉改造前需要准备哪些资料？',
    answer:
      '建议准备原工业炉设计图纸、技术参数表、最近 6-12 个月历史能耗数据、实际产能与生产节拍数据、工艺要求、现场布局图、当前问题清单。如果原始资料不齐全，苏能可在现场勘查阶段补全所需数据。',
  },
  {
    question: 'Q8：改造后控温精度能做到多少？',
    answer:
      '控温精度取决于加热元件配置、控制系统、热电偶布置与数量、炉膛结构。常见范围包括一般工业炉 ±5℃ 至 ±10℃，高精度热处理炉 ±3℃ 至 ±5℃，实验或精密工艺 ±1℃ 至 ±3℃，具体精度以工艺要求和最终技术方案为准。',
  },
  {
    question: 'Q9：工业炉节能改造有哪些风险？',
    answer:
      '主要风险包括方案设计风险、施工风险、技术风险、运行风险。苏能通过现场勘查、能耗建模、F.A.T 测试、现场调试和操作培训降低风险。苏能成立于 2006 年，积累了改造项目经验，对各类风险有成熟的应对方案。',
  },
  {
    question: 'Q10：江苏地区有售后服务网点吗？',
    answer:
      '苏能总部位于江苏泰州，江苏全境均为售后服务密集覆盖区域。华东其他地区，包括上海、浙江、安徽、山东，也是苏能售后服务的高密度覆盖区。',
  },
];

const advantages = [
  {
    title: '1. 成立于 2006 年，150+ 项目积累',
    text: '苏能成立于 2006 年，专注热处理工业炉研发制造，累计交付 150+ 工业炉项目。客户覆盖钢铁、装备制造、汽车零部件、能源装备等多个行业。',
  },
  {
    title: '2. 自制设备 + 部分非苏能品牌工业炉评估改造',
    text: '工业炉改造通常需要结合原设备图纸、控制系统、备件条件和现场状态综合判断。苏能可对自制设备及部分非苏能品牌工业炉提供大修、技改、搬迁复产和节能改造评估服务。',
  },
  {
    title: '3. 不锈钢退火生产线深度专长',
    text: '苏能在不锈钢宽带钢光亮退火生产线领域有持续积累，尤其关注 1000mm-1600mm 连续退洗线节能改造，多项自主专利覆盖相关方向。',
  },
  {
    title: '4. 与工程总包公司协作经验',
    text: '苏能作为设备分包方，与中国五矿恩菲、武汉乾冶等工程公司协作过多个项目，熟悉总包项目的交付流程与质量要求。',
  },
  {
    title: '5. 完整的资质与质量体系',
    text: '苏能为国家高新技术企业（证书编号 GR202432008987），具备 ISO 9001、ISO 14001、ISO 45001 三体系认证，并拥有 11 项已授权实用新型专利。',
  },
  {
    title: '6. 注册资本与生产基地支撑',
    text: '苏能拥有 5,080 万元注册资本、14,700 ㎡ 现代化生产基地、150+ 专业团队，具备整线交付的工程能力。',
  },
];

const formFields = [
  '姓名',
  '联系电话',
  '公司名称',
  '所属行业',
  '当前工业炉类型与规格',
  '预期改造内容',
  '改造预算范围',
  '改造时间窗口',
  '需求描述',
];

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://www.jssngyl.cn/zh/service/furnace-renovation-overhaul',
  name: '工业炉节能改造与热处理炉大修服务',
  alternateName: ['工业炉技改服务', '热处理炉改造服务', '工业炉节能改造'],
  description:
    '苏能工业炉提供工业炉节能改造、热处理炉大修、控制系统升级、炉衬翻新、烟气余热回收等服务。可对苏能自制设备及部分非苏能品牌工业炉提供评估改造。',
  provider: {
    '@type': 'Organization',
    name: '江苏苏能工业炉有限公司',
    url: 'https://www.jssngyl.cn',
    telephone: '+86-139-1444-2520',
    email: '997518512@qq.com',
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
  serviceType: ['工业炉节能改造', '热处理炉大修', '控制系统升级', '炉衬翻新', '烟气余热回收', '燃烧系统改造'],
  areaServed: {
    '@type': 'Country',
    name: '中国',
  },
  audience: {
    '@type': 'BusinessAudience',
    name: '钢铁、装备制造、汽车零部件、能源装备等行业的工业炉用户',
  },
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    priceCurrency: 'CNY',
    description: '具体报价依据项目实际工况、改造方案与技术要求确定，可联系苏能工业炉获取专项报价。',
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
    title: FURNACE_RENOVATION_OVERHAUL_SEO.title,
    description: FURNACE_RENOVATION_OVERHAUL_SEO.description,
    path: pagePath,
    pageKey: 'service',
    keywords: FURNACE_RENOVATION_OVERHAUL_SEO.keywords,
    image: FURNACE_RENOVATION_OVERHAUL_SEO.ogImage,
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

function FactList({ items }: { items: string[][] }) {
  return (
    <dl className="grid gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="grid gap-1 border-b border-[#e7edf5] pb-3 last:border-b-0 sm:grid-cols-[120px_1fr]">
          <dt className="text-[13px] font-semibold text-[#667085]">{label}</dt>
          <dd className="text-[15px] leading-[1.7] text-[#253047]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function FurnaceRenovationOverhaulPage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return (
    <div className="bg-white text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] text-white">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-36" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,36,0.94)_0%,rgba(12,38,74,0.82)_54%,rgba(12,38,74,0.52)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-20">
          <Breadcrumb
            locale="zh"
            currentLabel="工业炉节能改造与热处理炉大修服务"
            tone="light"
            className="text-[13px]"
            items={[
              { label: '服务支持', href: '/zh/service' },
            ]}
          />

          <div className="mt-10 max-w-[930px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/64">Renovation & Overhaul</p>
            <h1 className="mt-4 text-[36px] font-semibold leading-[1.16] tracking-[0.01em] lg:text-[58px]">
              工业炉节能改造与热处理炉大修服务
            </h1>
            <p className="mt-5 text-[18px] font-semibold leading-[1.7] text-white/92 lg:text-[24px]">
              自制设备 + 部分非苏能品牌工业炉评估改造
            </p>
            <p className="mt-7 max-w-[860px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
              苏能工业炉成立于 2006 年，专注热处理工业炉研发制造，累计交付 150+ 工业炉项目。我们提供工业炉节能改造、整炉大修、控制系统升级、炉衬翻新、烟气余热回收等服务，覆盖钢铁、装备制造、汽车零部件、能源装备等多个行业。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-[14px] font-semibold text-white">
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">国家高新技术企业（证书编号 GR202432008987）</span>
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">ISO 9001 / 14001 / 45001 三体系认证</span>
            </div>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
              >
                免费现场勘查咨询
              </a>
              <a
                href="#cases"
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                查看典型案例
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section id="scope" eyebrow="Scope" title="一、服务范围">
        <p className="max-w-[920px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          苏能工业炉改造与大修服务覆盖工业炉全生命周期，围绕节能改造、整炉大修、复产搬迁、温度与控制系统验证四类需求展开。
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {serviceScope.map((group) => (
            <article key={group.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#c51624]">{group.eyebrow}</p>
              <h3 className="mt-2 text-[21px] font-semibold leading-[1.36] text-[#101828]">{group.title}</h3>
              <BulletList items={group.items} />
            </article>
          ))}
        </div>
        <div className="mt-7 rounded-[8px] border border-[#d6e0ec] bg-[#f7fafc] p-5 text-[15px] leading-[1.9] text-[#344054]">
          <strong className="font-semibold text-[#101828]">服务边界说明：</strong>
          苏能不承接工程总承包业务，通常作为工业炉设备供应商或设备分包方，与具备相应资质的工程总包公司协作完成项目。
        </div>
      </Section>

      <Section id="process" eyebrow="Process" title="二、改造前评估流程">
        <p className="max-w-[940px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          工业炉节能改造效果与原炉型结构、燃料类型、产线负荷、保温状态、控制系统、运行制度和现场工况密切相关。苏能提供 5 步系统化评估。
        </p>
        <div className="mt-8 grid gap-4">
          {evaluationSteps.map((step, index) => (
            <article key={step.title} className="grid gap-5 rounded-[8px] border border-[#e1e7f0] bg-white p-5 shadow-[0_10px_24px_rgba(15,35,75,0.04)] md:grid-cols-[72px_1fr]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c51624] text-[20px] font-semibold text-white">
                {index + 1}
              </div>
              <div>
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">{step.title}</h3>
                {step.items ? <BulletList items={step.items} /> : null}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-7 rounded-[8px] bg-[#fff7ed] p-5 text-[15px] leading-[1.9] text-[#7c2d12]">
          完整评估周期通常为 7-15 个工作日，视现场复杂度和工艺要求而定。具体节能效果与改造方案、原炉状态、现场工况密切相关，需以现场诊断和方案测算为准。
        </p>
      </Section>

      <Section id="solutions" eyebrow="Solutions" title="三、典型改造方案">
        <div className="grid gap-6">
          {renovationPlans.map((plan) => (
            <article key={plan.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6 lg:p-7">
              <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">{plan.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#667085]">{plan.scenario}</p>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="text-[16px] font-semibold text-[#101828]">核心改造内容</h4>
                  <BulletList items={plan.details} />
                </div>
                <div>
                  <h4 className="text-[16px] font-semibold text-[#101828]">典型效果</h4>
                  <BulletList items={plan.effects} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="cases" eyebrow="Cases" title="四、典型案例">
        <div className="grid gap-6">
          {caseStudies.map((caseItem) => (
            <article key={caseItem.title} className="rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)] lg:p-7">
              <h3 className="text-[22px] font-semibold leading-[1.36] text-[#101828]">{caseItem.title}</h3>
              <div className="mt-5">
                <FactList items={caseItem.facts} />
              </div>
              <p className="mt-5 text-[15px] leading-[1.9] text-[#344054]">{caseItem.content}</p>
              {caseItem.note ? (
                <p className="mt-5 rounded-[8px] bg-[#f7fafc] p-5 text-[14px] leading-[1.85] text-[#475467]">
                  {caseItem.note}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        <p className="mt-7 rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-5 text-[15px] leading-[1.9] text-[#344054]">
          所有节能效果数据均基于具体项目实际测算。具体效果与原炉型结构、燃料类型、产线负荷、保温状态、控制系统、运行制度和现场工况密切相关，需以现场诊断和改造方案测算为准。本案例数据仅作为同类工程参考，不构成对所有项目的节能效果承诺。
        </p>
      </Section>

      <Section id="guarantee" eyebrow="Guarantee" title="五、改造效果保障">
        <div className="grid gap-5 lg:grid-cols-2">
          {guaranteeStages.map((stage) => (
            <article key={stage.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">{stage.title}</h3>
              <BulletList items={stage.items} />
            </article>
          ))}
        </div>
        <p className="mt-7 rounded-[8px] bg-[#f7fafc] p-5 text-[15px] leading-[1.9] text-[#344054]">
          实际服务内容依据合同约定、设备状态、现场工况和服务距离提供维修、备件与技术支持，具体响应时效与服务标准以合同条款为准。
        </p>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="六、改造服务常见问题">
        <div className="grid gap-3" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-[8px] border border-[#dfe6f0] bg-white px-5 py-4"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <summary className="cursor-pointer text-[16px] font-semibold leading-[1.6] text-[#101828]" itemProp="name">
                {faq.question}
              </summary>
              <div className="mt-4 space-y-3 border-t border-[#edf1f6] pt-4" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <div className="text-[15px] leading-[1.9] text-[#344054]" itemProp="text">
                  {faq.answer}
                </div>
              </div>
            </details>
          ))}
        </div>
      </Section>

      <Section id="advantages" eyebrow="Advantages" title="七、为什么选择苏能改造服务">
        <div className="grid gap-5 lg:grid-cols-2">
          {advantages.map((advantage) => (
            <article key={advantage.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">{advantage.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.9] text-[#344054]">{advantage.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-7 rounded-[8px] bg-[#f7fafc] p-5 text-[15px] leading-[1.9] text-[#344054]">
          苏能不宣称具备航空热处理等特殊行业认证，也不承接工程总承包业务；如客户项目涉及特殊行业认证或工程总包需求，苏能可作为设备分包方与具备相应资质的总包公司协作。
        </p>
      </Section>

      <Section id="contact" eyebrow="Contact" title="八、立即获取改造方案">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6 lg:p-7">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">现场勘查咨询</h3>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
              苏能工程师可赴现场实地勘查，结合您的实际工况给出改造方案与初步报价。
            </p>
            <address className="mt-6 space-y-3 text-[15px] leading-[1.8] text-[#344054] not-italic">
              <p>
                <strong className="font-semibold text-[#101828]">电话 / 微信：</strong>
                <a href="tel:+8613914442520" className="text-[#c51624]">+86-139-1444-2520</a>
              </p>
              <p>
                <strong className="font-semibold text-[#101828]">邮箱：</strong>
                <a href="mailto:997518512@qq.com" className="text-[#c51624]">997518512@qq.com</a>
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
            <div className="mt-8 border-t border-[#e1e7f0] pt-5 text-[14px] leading-[1.8] text-[#667085]">
              <p>技术审核：苏能工业炉工程技术团队</p>
              <p>最后更新：2026-05-26</p>
            </div>
          </div>

          <form className="rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)] lg:p-7">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">在线咨询表单</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {formFields.map((field, index) => {
                const isTextarea = field === '需求描述';
                const required = field === '联系电话';
                return (
                  <label key={field} className={isTextarea ? 'sm:col-span-2' : undefined}>
                    <span className="text-[14px] font-semibold text-[#344054]">
                      {required ? '*' : ''}
                      {field}
                    </span>
                    {isTextarea ? (
                      <textarea
                        name={`field-${index}`}
                        rows={4}
                        className="mt-2 w-full rounded-[6px] border border-[#d0d7e2] px-3 py-2 text-[15px] outline-none transition focus:border-[#c51624]"
                      />
                    ) : (
                      <input
                        name={`field-${index}`}
                        className="mt-2 h-11 w-full rounded-[6px] border border-[#d0d7e2] px-3 text-[15px] outline-none transition focus:border-[#c51624]"
                      />
                    )}
                  </label>
                );
              })}
            </div>
            <p className="mt-5 text-[13px] leading-[1.7] text-[#667085]">提交即表示同意《隐私政策》。</p>
            <button
              type="button"
              className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
            >
              提交需求
            </button>
          </form>
        </div>
      </Section>

      <JsonLd id="furnace-renovation-overhaul-service-jsonld" data={serviceJsonLd} />
    </div>
  );
}
