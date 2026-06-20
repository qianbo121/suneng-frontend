import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ProductLeadForm } from '@/components/products/ProductLeadForm';
import { getFaqJsonLd } from '@/lib/seo/jsonld';
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
const casePath = '/zh/case/anonymous-tsingshan-1250-renovation';
const heroImage = '/images/service/after-sales-hero.png';
const trolleyFurnacePath = '/zh/products/detail/trolley-furnace';
const meshBeltFurnacePath = '/zh/products/detail/mesh-belt-furnace';
const quoteParamsPath = '/zh/articles/gongye-lu-baojia-canshu';
const decisionPath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';
const continuousLinePath = '/zh/solutions/continuous-heat-treatment-line';
const contactPath = '/zh/contact';

export const dynamicParams = false;

const serviceScope = [
  {
    title: '工业炉节能改造',
    eyebrow: '主关键词服务',
    items: [
      '围绕老旧工业炉能耗高、升温慢、温度不稳、炉衬老化、燃烧效率低等问题做系统诊断。',
      '燃烧系统升级：根据能源条件评估烧嘴、阀组、空燃比控制、燃料结构等改造方向。',
      '烟气余热回收：可根据项目工况配置钢带预热、助燃空气预热、蒸汽利用等配套方案。',
      '控制系统改造：从传统继电器控制升级为 PLC 或 DCS 控制系统，优化温控与数据记录。',
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
];

const preRenovationMaterials = [
  {
    label: '炉型',
    text: '台车炉、箱式炉、井式炉、网带炉、辊底炉等。',
  },
  {
    label: '设备照片',
    text: '炉体、炉门、炉衬、燃烧系统、电控柜等关键部位照片。',
  },
  {
    label: '炉膛尺寸',
    text: '长、宽、高或有效工作区尺寸，含装料方式和通道尺寸。',
  },
  {
    label: '最高温度',
    text: '设计温度和实际使用温度，最好附常用工艺温区。',
  },
  {
    label: '工件信息',
    text: '材质、尺寸、重量、装炉量、装夹方式和批次节拍。',
  },
  {
    label: '工艺要求',
    text: '升温、保温、降温曲线，温度均匀性和气氛要求。',
  },
  {
    label: '当前问题',
    text: '能耗高、温度不稳、升温慢、炉衬损坏、炉门漏热、燃烧效率低等。',
  },
  {
    label: '能源类型',
    text: '电、天然气、液化气、柴油或钢厂副产气等。',
  },
  {
    label: '现场条件',
    text: '车间空间、停产周期、吊装条件、供电供气条件和安全限制。',
  },
];

const renovationDecisionRows = [
  {
    situation: '炉体结构完好，只是炉衬老化',
    suggestion: '优先考虑炉衬翻新与保温优化',
  },
  {
    situation: '温控系统落后，但炉体和加热系统可继续使用',
    suggestion: '优先考虑控制系统升级',
  },
  {
    situation: '燃气消耗高，燃烧不充分',
    suggestion: '优先考虑燃烧系统和空燃比控制改造',
  },
  {
    situation: '炉门漏热、台车缝隙大、密封效果差',
    suggestion: '优先做炉门密封、台车密封和局部结构优化',
  },
  {
    situation: '炉体变形严重，存在安全风险',
    suggestion: '不建议简单改造，应评估大修或重新采购',
  },
  {
    situation: '改造费用接近新炉成本',
    suggestion: '重新采购新炉可能更合理',
  },
  {
    situation: '工艺需求变化很大，原炉型不再适配',
    suggestion: '重新设计整炉方案',
  },
  {
    situation: '缺少图纸、运行记录和关键部件资料',
    suggestion: '先做现场勘查和设备状态评估',
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
      '节能潜力与投资回收周期初步测算。',
      '改造期间停产周期估算。',
    ],
  },
  {
    title: '第 5 步：方案评审与确认',
    items: [
      '技术方案细节。',
      '商务条款，包括费用、付款方式、质保期。',
      '改造施工排程。',
      '根据项目类型确定工厂验收、现场验收或联动调试验收标准。',
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
      '烟气余热回收：钢带预热 400-450℃、助燃空气预热 500-650℃、蒸汽利用 0.3-1.0 MPa 蒸汽 3-5 t/h。',
      '控温系统：13 区控温优化为多加热室多控温区，西门子 S7-1500 与 ET200SP 分布式控制。',
      '风机变频：30kW 至 75kW 变频，按工况调整。',
    ],
    effects: [
      '在合适的工况条件下，吨钢能耗成本具备显著下降空间。',
      '可按相关排放要求进行方案设计，具体执行标准、测试条件和验收方式需结合项目所在地要求和合同约定确定。',
      '在部分连续生产线项目中，设备稳定性和月作业率具备提升空间，具体以改造范围和现场工况为准。',
      '节能收益需结合原燃料成本、产线负荷、运行制度和改造范围单独测算。',
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
      '控温稳定性和工艺曲线重复性具备提升空间，具体指标视加热元件配置与炉膛结构确定。',
      '工艺曲线可重复性和废品率改善空间，需结合原设备状态和工艺纪律评估。',
      '远程监控与故障预警能力可按控制系统配置进行完善。',
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
      '炉壁外表面温度和散热损失具备改善空间。',
      '吨产品能耗是否下降、下降幅度多少，需结合原始保温状态和实际生产负荷测算。',
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
      '常见项目可能需要 3-6 周，具体以设备状态、改造范围、现场条件和停产窗口为准。',
      '性能恢复目标需结合设备状态、工艺要求和最终验收标准确认。',
    ],
  },
];

const relatedLinks = [
  {
    title: '查看报价需要哪些参数',
    href: quoteParamsPath,
    text: '查看工业炉询价前建议提供的炉型、尺寸、温度、装炉量、工艺和现场条件。',
  },
  {
    title: '老旧工业炉该修还是换？',
    href: decisionPath,
    text: '旧炉项目可先判断适合大修、局部改造还是重新采购。',
  },
  {
    title: '台车炉改造适配',
    href: trolleyFurnacePath,
    text: '了解台车式热处理炉的炉膛尺寸、承重、温度范围和大件热处理适用场景。',
  },
  {
    title: '网带炉改造适配',
    href: meshBeltFurnacePath,
    text: '了解网带式热处理炉在标准件、小型零件和连续热处理生产中的工艺特点。',
  },
  {
    title: '连续热处理生产线解决方案',
    href: continuousLinePath,
    text: '连续线改造、大修或产线评估项目可先查看系统级方案入口。',
  },
  {
    title: '联系苏能工业炉',
    href: contactPath,
    text: '整理旧炉照片、参数和当前问题，进入人工联系页沟通。',
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
      '该数据仅适用于该项目特定测算条件，不代表所有工业炉节能改造项目均可达到同等效果。其他项目需结合现场诊断和方案测算单独评估。',
    link: casePath,
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
      '如双方确认可量化指标，可在合同附件中明确控温精度、温度均匀性、能耗统计口径或其他验收指标。',
      '根据项目类型确定工厂验收、现场验收或联动调试验收标准。',
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
      '按项目约定执行温控、机械传动、安全保护和联动调试检查。',
      '性能测试报告作为验收依据。',
    ],
  },
  {
    title: '4. 质保与售后',
    items: [
      '质保期 1 年，自验收合格之日起，具体以合同为准。',
      '易损件和非标配件保障方式按设备类型、合同约定和备件供应条件确定。',
      '客户服务热线 +86-130-5298-6814。',
      '现场上门服务依据合同约定、设备状态、现场工况和服务距离安排。',
    ],
  },
];

const faqs = [
  {
    question: 'Q1：工业炉节能改造能省多少？',
    answer:
      '工业炉节能效果与原炉型结构、炉衬状态、燃料类型、燃烧系统、控制系统、生产节拍和运行制度有关，不能直接套用固定比例。苏能通常会先收集设备参数、能耗数据和现场照片，再判断节能潜力，必要时进行现场勘查和方案测算。',
  },
  {
    question: 'Q2：工业炉节能改造需要停产多久？',
    answer:
      '停产周期取决于改造范围。如果只是局部炉衬修复、控制系统升级，周期相对较短；如果涉及整炉大修、燃烧系统改造、机械传动检修或搬迁复产，周期会更长。具体停产窗口需结合设备状态、施工条件和生产计划评估。',
  },
  {
    question: 'Q3：热处理炉大修费用怎么算？',
    answer:
      '热处理炉大修费用主要受炉型、炉膛尺寸、温度等级、炉衬损坏程度、加热系统、控制系统、机械传动和现场施工条件影响。苏能通常会根据设备照片、图纸、当前故障和改造目标，先判断大修范围，再输出技术方案和报价。',
  },
  {
    question: 'Q4：老旧热处理炉是大修还是直接买新的？',
    answer:
      '如果炉体结构完整、基础可靠，只是炉衬老化、温控落后或局部系统效率低，可以优先考虑大修或局部改造。如果炉体变形严重、安全风险高、工艺需求变化很大，或改造费用接近新炉成本，则应评估重新采购新炉。最终应结合炉体状态、工艺要求、停产窗口和预算综合判断。',
  },
  {
    question: 'Q5：苏能能改造其他厂家或进口的工业炉吗？',
    answer:
      '苏能可对部分非苏能品牌工业炉提供评估、检修、大修、控制系统升级和节能改造建议。但是否适合改造，需要结合原设备图纸、备件条件、控制系统、现场状态和安全要求判断。进口设备还需确认关键部件和接口资料是否完整。',
  },
  {
    question: 'Q6：改造验收看哪些指标？',
    answer:
      '工业炉改造验收通常关注升温能力、温度稳定性、温度均匀性、控制系统运行状态、安全保护、机械传动、炉门密封和工艺曲线执行情况。若项目涉及节能目标，还需结合双方确认的能耗统计口径和测试条件进行验证。',
  },
  {
    question: 'Q7：工业炉改造前需要准备哪些资料？',
    answer:
      '建议准备炉型、炉膛尺寸、最高温度、工件材质与重量、装炉量、工艺曲线、能源类型、当前问题、现场照片和历史能耗数据。资料不完整也可以先沟通，苏能可根据现有信息做初步判断，再决定是否需要现场勘查。',
  },
  {
    question: 'Q8：改造后控温精度能做到多少？',
    answer:
      '控温精度与炉型结构、加热元件、热电偶布置、控制系统、炉膛尺寸和工艺要求有关，不能脱离设备状态直接承诺。苏能可根据项目要求配置 PLC、温控仪、记录仪和多区控温方案，具体指标应在技术方案和合同中明确。',
  },
  {
    question: 'Q9：工业炉节能改造有哪些风险？',
    answer:
      '主要风险包括原炉体状态判断不足、停产时间超出预期、节能效果不及预期、旧系统与新系统接口不匹配、现场施工条件受限等。改造前应充分评估炉体、炉衬、燃烧系统、控制系统和生产节拍，避免只做局部更换而忽略整体匹配。',
  },
  {
    question: 'Q10：江苏地区有售后服务网点吗？',
    answer:
      '苏能位于江苏，具备对江苏及华东区域工业炉项目提供现场勘查、安装调试、维修和技术支持的便利条件。具体服务方式、响应时间和现场安排，需要根据设备位置、故障情况、合同约定和工程排期确定。',
  },
];

const faqJsonLd = getFaqJsonLd(faqs);
const faqColumnSize = Math.ceil(faqs.length / 2);
const faqColumns = [faqs.slice(0, faqColumnSize), faqs.slice(faqColumnSize)];

const advantages = [
  {
    title: '1. 成立于 2006 年，累计 150+ 工业炉项目经验',
    text: '苏能成立于 2006 年，专注热处理工业炉研发制造，已形成累计 150+ 工业炉项目经验。客户覆盖钢铁、装备制造、汽车零部件、能源装备等多个行业。',
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
    text: '苏能为国家高新技术企业（证书编号 GR202432008987），同时具备国家级科技型中小企业（2025）认定、ISO 9001、ISO 14001、ISO 45001 三体系认证，并拥有 14 项已授权专利。',
  },
  {
    title: '6. 注册资本与生产基地支撑',
    text: '苏能拥有 5,080 万元注册资本、14,700 ㎡ 现代化生产基地，并以累计 150+ 工业炉项目经验支撑设备制造、改造评估与现场服务。',
  },
];

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://www.jssngyl.cn/zh/service/furnace-renovation-overhaul',
  name: '工业炉节能改造与热处理炉大修服务',
  alternateName: ['工业炉技改服务', '热处理炉改造服务', '工业炉节能改造'],
  description:
    '苏能工业炉提供工业炉节能改造、热处理炉大修、炉衬翻新、燃烧系统升级、控制系统升级、搬迁复产评估等服务。',
  provider: {
    '@type': 'Organization',
    name: '江苏苏能工业炉有限公司',
    url: 'https://www.jssngyl.cn',
    telephone: '+86-130-5298-6814',
    email: '997518512@qq.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '张甸蔡官工业区',
      addressLocality: '姜堰区',
      addressRegion: '江苏省泰州市',
      postalCode: '225536',
      addressCountry: 'CN',
    },
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: '国家高新技术企业',
        identifier: 'GR202432008987',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: '国家级科技型中小企业',
        credentialCategory: '国家级科技型中小企业（2025）',
      },
    ],
  },
  serviceType: ['工业炉节能改造', '热处理炉大修', '炉衬翻新', '燃烧系统升级', '控制系统改造', '搬迁复产评估'],
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
        <p className="text-[13px] font-semibold text-[#c51624]">{eyebrow}</p>
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
            <p className="text-[13px] font-semibold text-white/64 lg:text-[14px]">工业炉节能改造 / 热处理炉大修</p>
            <h1 className="mt-4 text-[36px] font-semibold leading-[1.16] tracking-[0.01em] lg:text-[58px]">
              工业炉节能改造与热处理炉大修服务
            </h1>
            <p className="mt-5 max-w-[900px] text-[18px] font-semibold leading-[1.72] text-white/92 lg:text-[24px]">
              针对老旧工业炉能耗高、升温慢、温度不稳、炉衬老化、燃烧效率低、控制系统落后等问题，苏能可提供炉体检查、炉衬翻新、燃烧系统升级、控制系统改造与整炉大修方案。
            </p>
            <p className="mt-7 max-w-[860px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
              该页面作为苏能“工业炉节能改造”的主落地页，重点说明改造评估、资料准备、炉衬与燃烧系统升级、控制系统改造和热处理炉大修的服务边界。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-[14px] font-semibold text-white">
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">国家高新技术企业（证书编号 GR202432008987）</span>
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">国家级科技型中小企业（2025）</span>
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">ISO 9001 / 14001 / 45001 三体系认证</span>
            </div>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#contact-form"
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
              >
                获取报价方案
              </a>
              <a
                href={quoteParamsPath}
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                查看报价需要哪些参数
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section id="scope" eyebrow="服务范围" title="一、服务范围">
        <p className="max-w-[920px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          苏能工业炉改造与大修服务覆盖工业炉全生命周期，围绕工业炉节能改造、整炉大修、复产搬迁三类主线需求展开。
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
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
          苏能不承接工程总承包业务，通常作为工业炉设备供应商或设备分包方，与具备相应资质的工程总包公司协作完成项目。如项目涉及压力容器或特种设备要求，应由具备相应资质的单位提供或配合实施。
        </div>
      </Section>

      <Section id="materials" eyebrow="资料清单" title="二、改造前资料清单">
        <p className="max-w-[940px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          提交以下资料后，苏能可更快判断工业炉节能改造方向、是否需要整炉大修，以及是否适合做炉衬翻新、燃烧系统升级或控制系统改造。
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {preRenovationMaterials.map((item) => (
            <article key={item.label} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
              <h3 className="text-[17px] font-semibold leading-[1.4] text-[#101828]">{item.label}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">{item.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-7 rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-5 text-[15px] leading-[1.9] text-[#344054]">
          资料不完整也可以先咨询。若缺少图纸、历史能耗或工艺曲线，苏能可在现场勘查阶段补充测量和记录，再判断改造可行性与停产窗口。
        </p>
      </Section>

      <Section id="daxiu-or-new" eyebrow="改造决策" title="三、老旧热处理炉是大修好，还是直接买新的？">
        <p className="max-w-[940px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          老旧工业炉不一定都适合改造。判断时应综合炉体结构、安全状态、工艺变化、改造费用、停产周期和后续使用年限，避免为了节省初期投入而带来更高的运行风险。
        </p>

        <div className="mt-8 grid gap-4 md:hidden">
          {renovationDecisionRows.map((row) => (
            <article key={row.situation} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5">
              <p className="text-[13px] font-semibold text-[#667085]">情况</p>
              <h3 className="mt-2 text-[17px] font-semibold leading-[1.5] text-[#101828]">{row.situation}</h3>
              <p className="mt-4 text-[13px] font-semibold text-[#667085]">建议</p>
              <p className="mt-2 text-[15px] leading-[1.8] text-[#344054]">{row.suggestion}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 hidden overflow-hidden rounded-[8px] border border-[#dfe6f0] md:block">
          <table className="w-full border-collapse bg-white text-left">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="w-1/2 border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">情况</th>
                <th className="border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">建议</th>
              </tr>
            </thead>
            <tbody>
              {renovationDecisionRows.map((row) => (
                <tr key={row.situation} className="border-b border-[#edf1f6] last:border-b-0">
                  <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#344054]">{row.situation}</td>
                  <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#253047]">{row.suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="process" eyebrow="评估流程" title="四、改造前评估流程">
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
          常见评估周期约为 7-15 个工作日，具体以资料完整度、现场复杂度和工艺要求为准。具体节能效果与改造方案、原炉状态、现场工况密切相关，需以现场诊断和方案测算为准。
        </p>
      </Section>

      <Section id="solutions" eyebrow="改造方案" title="五、典型改造方案">
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
        <div className="mt-8 rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-6">
          <h3 className="text-[21px] font-semibold leading-[1.35] text-[#101828]">相关设备与延伸阅读</h3>
          <p className="mt-3 text-[15px] leading-[1.9] text-[#344054]">
            工业炉节能改造通常需要结合炉型结构判断。以下链接使用官网现有页面，避免新增重复落地页与本页抢占关键词。
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {relatedLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-[8px] border border-[#e1e7f0] bg-white p-5 transition hover:border-[#c51624] hover:shadow-[0_10px_24px_rgba(15,35,75,0.06)]"
              >
                <span className="text-[16px] font-semibold leading-[1.5] text-[#c51624]">{item.title}</span>
                <span className="mt-2 block text-[14px] leading-[1.8] text-[#475467]">{item.text}</span>
              </a>
            ))}
          </div>
          <div className="mt-5 rounded-[8px] bg-white p-5 text-[14px] leading-[1.8] text-[#667085]">
            本文已在
            <a href="#daxiu-or-new" className="font-semibold text-[#c51624] underline underline-offset-4">
              “老旧热处理炉是大修好，还是直接买新的？”
            </a>
            模块中提供基础判断。如需进一步评估，可提交设备照片、炉型、炉膛尺寸、工件信息和当前问题，由苏能技术人员做初步判断。
          </div>
        </div>
      </Section>

      <Section id="cases" eyebrow="典型案例" title="六、典型案例">
        <div className="grid gap-6">
          {caseStudies.map((caseItem) => (
            <article key={caseItem.title} className="rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)] lg:p-7">
              <h3 className="text-[22px] font-semibold leading-[1.36] text-[#101828]">{caseItem.title}</h3>
              <div className="mt-5">
                <FactList items={caseItem.facts} />
              </div>
              {caseItem.note ? (
                <p className="mt-4 rounded-[8px] border border-[#fed7aa] bg-[#fff7ed] p-4 text-[14px] leading-[1.85] text-[#7c2d12]">
                  {caseItem.note}
                </p>
              ) : null}
              <p className="mt-5 text-[15px] leading-[1.9] text-[#344054]">{caseItem.content}</p>
              {caseItem.link ? (
                <a
                  href={caseItem.link}
                  className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]"
                >
                  查看完整案例 →
                </a>
              ) : null}
            </article>
          ))}
        </div>
        <p className="mt-7 rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-5 text-[15px] leading-[1.9] text-[#344054]">
          所有节能效果数据均基于具体项目实际测算。具体效果与原炉型结构、燃料类型、产线负荷、保温状态、控制系统、运行制度和现场工况密切相关，需以现场诊断和改造方案测算为准。本案例数据仅作为同类工程参考，不构成对所有项目的节能效果承诺。
        </p>
      </Section>

      <Section id="guarantee" eyebrow="效果保障" title="七、改造效果保障">
        <div className="grid gap-5 lg:grid-cols-2">
          {guaranteeStages.map((stage) => (
            <article key={stage.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">{stage.title}</h3>
              <BulletList items={stage.items} />
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-[8px] border border-[#d6e0ec] bg-white p-6">
          <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">温度与控制系统验证能力</h3>
          <p className="mt-3 text-[15px] leading-[1.9] text-[#344054]">
            如项目需要，苏能可配合进行 TUS（温度均匀性测试）、SAT（系统准确度测试）或相关温控记录检查。该能力作为改造验收与整改判断的辅助环节，具体测试标准和执行方式以项目要求、现场条件和合同约定为准。
          </p>
        </div>
        <p className="mt-7 rounded-[8px] bg-[#f7fafc] p-5 text-[15px] leading-[1.9] text-[#344054]">
          实际服务内容依据合同约定、设备状态、现场工况和服务距离提供维修、备件与技术支持，具体响应时效与服务标准以合同条款为准。
        </p>
      </Section>

      <Section id="faq" eyebrow="常见问题" title="八、改造服务常见问题">
        <div className="grid gap-3 md:grid-cols-2 md:items-start md:gap-5" itemScope itemType="https://schema.org/FAQPage">
          {faqColumns.map((column, columnIndex) => (
            <div key={`faq-column-${columnIndex}`} className="space-y-3">
              {column.map((faq, index) => {
                const faqIndex = columnIndex * faqColumnSize + index;

                return (
                  <details
                    key={faq.question}
                    className="group rounded-[8px] border border-[#dfe6f0] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,35,75,0.03)] [&>summary::-webkit-details-marker]:hidden"
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                    open={faqIndex === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] font-semibold leading-[1.6] text-[#101828]" itemProp="name">
                      <span>{faq.question}</span>
                      <span
                        aria-hidden="true"
                        className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#dfe6f0] group-open:hidden"
                      >
                        <span className="absolute h-[2px] w-3 rounded-full bg-[#c51624]" />
                        <span className="absolute h-3 w-[2px] rounded-full bg-[#c51624]" />
                      </span>
                      <span
                        aria-hidden="true"
                        className="relative mt-1 hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#dfe6f0] group-open:flex"
                      >
                        <span className="absolute h-[2px] w-3 rounded-full bg-[#c51624]" />
                      </span>
                    </summary>
                    <div className="mt-4 space-y-3 border-t border-[#edf1f6] pt-4" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <div className="text-[15px] leading-[1.9] text-[#344054]" itemProp="text">
                        {faq.answer}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          ))}
        </div>
      </Section>

      <Section id="advantages" eyebrow="选择苏能" title="九、为什么选择苏能改造服务">
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

      <Section id="contact" eyebrow="十、改造咨询" title="不确定老旧工业炉还能不能改？">
        <p className="max-w-[940px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          把炉型、炉膛尺寸、最高温度、工件信息、当前问题和现场照片发给苏能，技术人员可先做初步判断，帮助你评估适合大修、局部改造还是重新采购。
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6 lg:p-7">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">电话 / 微信咨询</h3>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
              如资料暂时不完整，可以先通过电话或邮件说明炉型、现有问题和停产窗口，再决定是否需要进一步现场勘查。
            </p>
            <address className="mt-6 space-y-3 text-[15px] leading-[1.8] text-[#344054] not-italic">
              <p>
                <strong className="font-semibold text-[#101828]">电话 / 微信：</strong>
                <a href="tel:+8613052986814" className="text-[#c51624]">+86-130-5298-6814</a>
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
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#contact-form"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[4px] border border-[#c51624] px-5 text-[14px] font-semibold text-[#c51624] transition hover:bg-[#fff5f5]"
              >
                获取报价方案
              </a>
              <a
                href={contactPath}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[4px] border border-[#c51624] px-5 text-[14px] font-semibold text-[#c51624] transition hover:bg-[#fff5f5]"
              >
                联系苏能工业炉
              </a>
            </div>
            <div className="mt-8 border-t border-[#e1e7f0] pt-5 text-[14px] leading-[1.8] text-[#667085]">
              <p>技术审核：苏能工业炉工程技术团队</p>
              <p>最后更新：2026-06-12</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[8px]">
            <ProductLeadForm
              anchorId="contact-form"
              title="提交旧炉参数，获取改造建议"
              description="把旧炉现状、炉型、问题、工艺温度和现场条件发给苏能，技术人员可先判断适合大修、局部改造还是整炉更新。"
              submitLabel="提交需求"
            />
          </div>
        </div>
      </Section>

      <JsonLd id="furnace-renovation-overhaul-service-jsonld" data={serviceJsonLd} />
      <JsonLd id="furnace-renovation-overhaul-faq-jsonld" data={faqJsonLd} />
    </div>
  );
}
