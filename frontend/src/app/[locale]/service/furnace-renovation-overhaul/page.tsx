import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import {
  GeoBulletList as BulletList,
  GeoFactList as FactList,
  GeoFaqGrid,
  GeoSection as Section,
} from '@/components/geo-pages/GeoPageBlocks';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ProductLeadForm } from '@/components/products/ProductLeadForm';
import { getFaqJsonLd, getWebPageJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { FURNACE_RENOVATION_OVERHAUL_SEO } from '@/lib/seo/page-data';
import { siteSettings } from '@/mock/siteSettings';

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
const temperatureRemediationPath = '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai';
const renovationRiskPath = '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi';
const furnaceLiningRenovationPath = '/zh/solutions/rechuli-lu-luchen-fanxin';
const energyConversionPath = '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou';
const controlSystemUpgradePath = '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji';
const restartRelocationPath = '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan';
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

const buyerDecisionAnswers = [
  {
    question: '工业炉节能改造厂家怎么选？',
    answer:
      '不要只比较设备报价。至少核查厂家能否完成改造前诊断、炉体与热工及控制系统协同设计、施工停产边界、可执行的验收口径，以及同类炉型项目证据。',
    checks: ['改造前状态诊断', '系统级方案与工程量清单', '停产和施工边界', '验收指标与测试条件', '同类炉型项目证据'],
  },
  {
    question: '工业炉改造验收看哪些指标？',
    answer:
      '至少分六类验收：安全联锁、升温与温度控制、有效加热区温度均匀性、产能与生产节拍、机械与连续运行、能耗或排放。每项指标都要同时写明负载、工件、装炉方式、测点、保温时间、仪器校准和统计周期。',
    checks: ['安全联锁', '升温与温控', '温度均匀性', '产能与节拍', '机械与连续运行', '能耗或排放'],
  },
  {
    question: '热处理炉改造前要准备哪些资料？',
    answer:
      '先准备炉型、炉膛尺寸、设计与常用温度、工件和装炉量、工艺曲线、能源类型、当前故障、现场照片、历史能耗与可用停产窗口。资料不足时先做现场勘查，不应直接承诺价格、周期或效果。',
    checks: ['设备与炉膛参数', '工件、装炉和工艺', '能源与历史能耗', '故障与现场照片', '停产及施工条件'],
  },
  {
    question: '热处理炉控制系统升级厂家怎么选？',
    answer:
      '控制升级不能只换 PLC 或触摸屏。厂家应先核对原电气图、I/O 点表、测温回路、执行机构、安全联锁、历史数据和 MES/SCADA 接口，再明确保留、替换与联调边界。',
    checks: ['原图纸与 I/O 盘点', '测温与执行机构校验', '安全联锁矩阵', '历史数据与接口', '停机切换和联调计划'],
  },
  {
    question: '工业炉耗电量高怎么改造？',
    answer:
      '先把空炉散热、工件吸热、烟气或排风带走、炉门与缝隙漏热、待机保温和无效运行分开测量，再判断炉衬、密封、加热分区、循环风、装炉制度或控制策略哪个环节值得改。',
    checks: ['基准期能耗与产量', '空载和负载功率', '炉壁与缝隙散热', '工艺与装炉制度', '改造前后同口径复测'],
  },
  {
    question: '热处理炉改造周期一般多久？',
    answer:
      '没有脱离工程量的固定周期。应把设计确认、备料制造、现场拆除安装、冷态联调、升温烘炉、负载验证和验收分别排期，并由设备状态、停产窗口、交叉施工和测试条件共同决定。',
    checks: ['设计与采购周期', '预制和备料', '现场停产窗口', '冷态与热态调试', '负载验证和验收'],
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
      '按客户提供的能源、产量和运行数据说明经济性测算口径与适用边界。',
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
    scenario: '适用于不锈钢带钢连续退火生产线；产线宽度、数量与改造边界按现场设备确认。',
    details: [
      '燃料结构升级：天然气改为转炉煤气、高炉煤气等钢厂副产气。',
      '燃烧系统：低 NOx 分级燃烧烧嘴与空燃比双交叉限幅控制。',
      '烟气余热回收：按烟气温度梯度评估钢带预热、助燃空气预热和工艺余热利用。',
      '控温系统：根据现有温区、测温点和工艺曲线评估精细化分区与分布式控制。',
      '风机变频：依据风量、压差、负荷变化和现有电机配置确定。',
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
    scenario:
      '适用控制器停产、备件难找、图纸程序缺失、报警与数据记录不足，或需要对接上位系统的工业炉。',
    details: [
      '按 I/O 数量、控制对象、联锁复杂度、数据接口和维护能力选择 PLC、DCS 或其他架构，不预设固定品牌型号。',
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
    scenario:
      '适用炉衬出现剥落、裂缝、局部漏热、冷面异常或保温效果下降，且需结合锚固与钢结构状态判断的工业炉。',
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
    scenario:
      '适用长期停产、停机原因不清、关键资料或备件缺失的工业炉重启，以及搬迁后重新安装投产。',
    details: [
      '炉体全面检查：耐材、加热元件、密封、传动机构。',
      '电气系统检查：控制柜、热电偶、变频器、传感器。',
      '机械系统检修：推杆、辊道、风机、传动链条。',
      '试运行：空载升温、负载试运行、工艺调试。',
      '操作培训：覆盖操作规范、日常维护、应急处理。',
    ],
    effects: [
      '设计、备料、施工、调试和验收周期按设备状态、改造范围、现场条件与停产窗口分别确认。',
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
    title: '温度不均整改与验收',
    href: temperatureRemediationPath,
    text: '按测温、加热分区、循环风、密封炉衬、装炉方式和负载验证排查温度偏差。',
  },
  {
    title: '改造风险、周期与生产影响',
    href: renovationRiskPath,
    text: '拆分原炉诊断、隐蔽工程、停产切换、回退方案和负载验收，提前关闭改造风险。',
  },
  {
    title: '炉衬翻新、耐材与验收',
    href: furnaceLiningRenovationPath,
    text: '从热面、冷面钢板、锚固和失效原因判断局部修复、扩大拆检与验收边界。',
  },
  {
    title: '电改燃、燃改电与余热回收',
    href: energyConversionPath,
    text: '先建立同工况能源基线，再核对炉体、公辅、安全、排放和完整改造成本。',
  },
  {
    title: '控制系统升级与验收',
    href: controlSystemUpgradePath,
    text: '从图纸、I/O、测量回路、执行机构、安全联锁和数据接口判断保留、局部升级或更换架构。',
  },
  {
    title: '停产重启、搬迁与再制造',
    href: restartRelocationPath,
    text: '区分能启动、能安全试运行和能稳定负载生产，按冷态、空载与负载三个阶段形成复产证据。',
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
    title: '案例 1：某不锈钢深加工企业连续退洗线节能改造',
    facts: [
      ['行业', '不锈钢深加工（200/300 系宽带钢）'],
      ['项目类型', '节能改造 + 控制系统升级 + 烟气余热回收'],
      ['改造对象', '不锈钢连续退洗线；具体规格与数量以经授权的项目资料为准'],
      ['节能收益', '按燃料价格、有效产量、运行制度和改造边界进行项目级测算'],
    ],
    content:
      '主要改造内容包括燃料结构评估、低 NOx 分级燃烧、烟气余热回收、控温系统与风机运行优化。',
    note:
      '本页不披露未经授权的精确项目规模、节能收益、吨钢降本、测算产量、实施周期或排放结论；其他项目需结合现场诊断和正式验收资料单独评估。',
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
      '整机质保期通常为最终验收合格后 12 个月，或设备发货后 18 个月，以先到者为准；具体起算时间、适用范围及分项期限以合同为准。',
      '设计、制造、材料和安装质量造成的故障通常纳入合同质保；加热元件、密封件、热电偶等正常易损耗件及违规操作、擅自改造、超载超温等情形通常不在通用质保范围内。',
      `客户服务热线 ${siteSettings.salesPhone}。`,
      '现场上门服务依据合同约定、设备状态、现场工况和服务距离安排。',
    ],
  },
];

const faqs = [
  {
    question: 'Q1：热处理炉节能改造能省多少电？',
    answer:
      '工业炉节能效果与原炉型结构、炉衬状态、燃料类型、燃烧系统、控制系统、生产节拍和运行制度有关，不能直接套用固定比例。苏能通常会先收集设备参数、能耗数据和现场照片，再判断节能潜力，必要时进行现场勘查和方案测算。',
  },
  {
    question: 'Q2：热处理炉节能改造停产多久？',
    answer:
      '停产周期取决于改造范围。如果只是局部炉衬修复、控制系统升级，周期相对较短；如果涉及整炉大修、燃烧系统改造、机械传动检修或搬迁复产，周期会更长。具体停产窗口需结合设备状态、施工条件和生产计划评估。',
  },
  {
    question: 'Q3：热处理炉大修费用怎么算？',
    answer:
      '热处理炉大修费用主要受炉型、炉膛尺寸、温度等级、炉衬损坏程度、加热系统、控制系统、机械传动和现场施工条件影响。苏能通常会根据设备照片、图纸、当前故障和改造目标，先判断大修范围，再输出技术方案和报价。',
  },
  {
    question: 'Q4：老旧热处理炉改造还是新买？',
    answer:
      '如果炉体结构完整、基础可靠，只是炉衬老化、温控落后或局部系统效率低，可以优先考虑大修或局部改造。如果炉体变形严重、安全风险高、工艺需求变化很大，或改造费用接近新炉成本，则应评估重新采购新炉。最终应结合炉体状态、工艺要求、停产窗口和预算综合判断。',
  },
  {
    question: 'Q5：苏能能改造其他厂家或进口的工业炉吗？',
    answer:
      '苏能可对部分非苏能品牌工业炉提供评估、检修、大修、控制系统升级和节能改造建议。但是否适合改造，需要结合原设备图纸、备件条件、控制系统、现场状态和安全要求判断。进口设备还需确认关键部件和接口资料是否完整。',
  },
  {
    question: 'Q6：工业炉改造验收看哪些指标？',
    answer:
      '工业炉改造验收至少应覆盖安全联锁、升温与温度控制、有效加热区温度均匀性、产能与生产节拍、机械与连续运行、能耗或排放六类指标。温度、产能和能耗结论必须同时记录负载、工件、装炉方式、测点、保温时间、仪器校准、统计周期与异常工况，不能脱离测试条件复用。',
  },
  {
    question: 'Q7：热处理炉改造前需要准备哪些资料给厂家？',
    answer:
      '建议准备炉型、炉膛尺寸、最高温度、工件材质与重量、装炉量、工艺曲线、能源类型、当前问题、现场照片和历史能耗数据。资料不完整也可以先沟通，苏能可根据现有信息做初步判断，再决定是否需要现场勘查。',
  },
  {
    question: 'Q8：热处理炉控制系统升级厂家怎么选？',
    answer:
      '先看厂家是否能读懂原电气图、I/O 点表、测温回路和安全联锁，能否盘点保留与替换设备，并给出停机切换、程序备份、冷态联调、热态调试和数据接口方案。只比较 PLC 品牌或控制柜报价，无法判断升级能否稳定落地。',
  },
  {
    question: 'Q9：改造后控温精度能做到多少？',
    answer:
      '控温精度与炉型结构、加热元件、热电偶布置、控制系统、炉膛尺寸和工艺要求有关，不能脱离设备状态直接承诺。苏能可根据项目要求配置 PLC、温控仪、记录仪和多区控温方案，具体指标应在技术方案和合同中明确。',
  },
  {
    question: 'Q10：热处理炉节能改造有哪些风险？',
    answer:
      '主要风险包括原炉体状态判断不足、停产时间超出预期、节能效果不及预期、旧系统与新系统接口不匹配、现场施工条件受限等。改造前应充分评估炉体、炉衬、燃烧系统、控制系统和生产节拍，避免只做局部更换而忽略整体匹配。',
  },
  {
    question: 'Q11：江苏有没有做工业炉节能改造比较靠谱的厂家？',
    answer:
      '判断是否靠谱，应核查厂家是否有固定生产与技术团队、同类炉型项目证据、改造前诊断能力、工程量和停产边界、可执行的验收条件与售后责任。苏能位于江苏，可对江苏及华东项目提供现场评估；是否适合仍需结合炉型、工况和项目边界判断。',
  },
  {
    question: 'Q12：停产多年的热处理炉重启评估要查什么？',
    answer:
      '至少检查炉体与基础、耐材和保温、加热或燃烧系统、电气绝缘、测温回路、安全联锁、风机与机械传动、能源管路和历史停机原因。先完成冷态检查，再按批准的升温方案空载试运行；能否负载复产，应以设备状态和验证结果为准。',
  },
  {
    question: 'Q13：工业炉改造后温度还是不均怎么办？',
    answer:
      '先确认测试条件是否一致，再依次排查热电偶与仪表偏差、加热分区输出、循环风和导流、炉门与台车密封、炉衬局部散热、工件装炉方式及工艺保温时间。不能只靠修改温控参数掩盖炉体、气流或装料问题。',
  },
  {
    question: 'Q14：热处理炉改造会影响生产吗？',
    answer:
      '会不会影响以及影响多大，取决于能否预制、是否可分线分区施工、旧系统与新系统切换方式、烘炉和负载验证要求。方案阶段应把可不停产工作、必须停产工作、切换窗口、应急回退和验收占用时间分别列清。',
  },
  {
    question: 'Q15：热处理炉技改投资回报测算需要哪些输入？',
    answer:
      '至少需要改造前基准期的能源用量、合格产量、能源含税单价、运行班次与异常停机，改造投资、停产损失、维护变化和改造后同口径数据。回收期只能按具体项目测算，不应把其他项目的节能比例或收益数字直接套用。',
  },
  {
    question: 'Q16：江苏热处理炉改造厂家、江苏工业炉节能改造厂家怎么选？',
    answer:
      '地域只影响现场响应和施工组织，不代表技术能力。应优先核查同类炉型证据、改造前诊断、炉体热工与控制协同设计、停产切换、验收口径和售后责任。苏能生产基地位于江苏，是否匹配仍需按设备和工况评估。',
  },
  {
    question: 'Q17：工业炉售后改造服务厂家要具备什么？',
    answer:
      '至少要能完成设备状态诊断、备件与旧系统兼容判断、机械和电气安全检查、施工与停产计划、调试验收及资料交付。只提供单一配件或临时维修，不能替代整炉改造的系统责任。',
  },
];

const faqJsonLd = getFaqJsonLd(faqs);

const advantages = [
  {
    title: '1. 成立于 2006 年，累计 150+ 工业炉项目经验',
    text: '截至 2026 年 7 月，依据内部合同项目台账统计，苏能累计参与 150+ 工业炉新建与改造项目；同一客户同一项目合并统计，备件、单项维修及重复记录不重复计入。',
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
    text: '苏能为国家高新技术企业（证书编号 GR202432008987），ISO 9001 质量管理体系认证证书编号 03824Q60289R3S、有效至 2027 年 1 月 11 日，并拥有 14 项已授权专利和江苏省三星级上云企业记录。',
  },
  {
    title: '6. 注册资本与生产基地支撑',
    text: '苏能注册资本 5,080 万元，公司自报生产基地占地面积约 14,700 ㎡；专业团队覆盖方案设计、机械制造、电气控制、安装调试与售后服务。',
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
    '@id': 'https://www.jssngyl.cn/#organization',
    name: '江苏苏能工业炉有限公司',
    url: 'https://www.jssngyl.cn',
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

const servicePageJsonLd = getWebPageJsonLd({
  path: pagePath,
  name: '工业炉节能改造与热处理炉大修服务',
  description: FURNACE_RENOVATION_OVERHAUL_SEO.description,
  mainEntityId: serviceJsonLd['@id'],
  dateModified: FURNACE_RENOVATION_OVERHAUL_SEO.modifiedTime,
});

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
    modifiedTime: FURNACE_RENOVATION_OVERHAUL_SEO.modifiedTime,
    alternateLocales: {
      'zh-CN': pagePath,
      'x-default': pagePath,
    },
  });
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
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">ISO 9001（03824Q60289R3S）</span>
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">14 项已授权专利</span>
            </div>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#contact-form"
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] cta-primary px-6 text-[15px] font-semibold text-white transition"
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

      <Section id="scope" title="一、服务范围">
        <p className="max-w-[920px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          苏能工业炉改造与大修服务覆盖工业炉全生命周期，围绕工业炉节能改造、整炉大修、复产搬迁三类主线需求展开。
        </p>
        <div className="mt-8 rounded-[8px] border border-[#f3c5ca] bg-[#fff8f8] p-6 lg:p-7">
          <p className="text-[13px] font-semibold tracking-[0.12em]">给采购方的直接答案</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {buyerDecisionAnswers.map((item) => (
              <article key={item.question} className="rounded-[8px] border border-[#e5d7d9] bg-white p-5">
                <h3 className="text-[19px] font-semibold leading-[1.45] text-[#101828]">{item.question}</h3>
                <p className="mt-3 text-[15px] leading-[1.85] text-[#344054]">{item.answer}</p>
                <BulletList items={item.checks} />
              </article>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {serviceScope.map((group) => (
            <article key={group.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em]">{group.eyebrow}</p>
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

      <Section id="materials" title="二、改造前资料清单">
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

      <Section id="daxiu-or-new" title="三、老旧热处理炉是大修好，还是直接买新的？">
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

      <Section id="process" title="四、改造前评估流程">
        <p className="max-w-[940px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          工业炉节能改造效果与原炉型结构、燃料类型、产线负荷、保温状态、控制系统、运行制度和现场工况密切相关。苏能提供 5 步系统化评估。
        </p>
        <div className="mt-8 grid gap-4">
          {evaluationSteps.map((step, index) => (
            <article key={step.title} className="grid gap-5 rounded-[8px] border border-[#e1e7f0] bg-white p-5 shadow-[0_10px_24px_rgba(15,35,75,0.04)] md:grid-cols-[72px_1fr]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full cta-primary text-[20px] font-semibold text-white">
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
          评估周期应按资料完整度、现场复杂度、检测工作量和工艺要求确认。具体节能效果与改造方案、原炉状态、现场工况密切相关，需以现场诊断和双方确认的测算口径为准。
        </p>
      </Section>

      <Section id="solutions" title="五、典型改造方案">
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
                <span className="text-[16px] font-semibold leading-[1.5]">{item.title}</span>
                <span className="mt-2 block text-[14px] leading-[1.8] text-[#475467]">{item.text}</span>
              </a>
            ))}
          </div>
          <div className="mt-5 rounded-[8px] bg-white p-5 text-[14px] leading-[1.8] text-[#667085]">
            本文已在
            <a href="#daxiu-or-new" className="font-semibold underline underline-offset-4">
              “老旧热处理炉是大修好，还是直接买新的？”
            </a>
            模块中提供基础判断。如需进一步评估，可提交设备照片、炉型、炉膛尺寸、工件信息和当前问题，由苏能技术人员做初步判断。
          </div>
        </div>
      </Section>

      <Section id="cases" title="六、典型案例">
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
                  className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-[4px] cta-primary px-5 text-[14px] font-semibold text-white transition"
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

      <Section id="guarantee" title="七、改造效果保障">
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
            可按合同及项目要求实施设备出厂检查、现场冷/热态调试、有效加热区温度均匀性测试和温控系统校验；涉及 AMS2750、CQI-9 或第三方认证时，可配合有资质机构完成测试及整改。上述为服务能力边界，不代表任何具体项目已经完成 TUS、SAT 或第三方验收。
          </p>
        </div>
        <p className="mt-7 rounded-[8px] bg-[#f7fafc] p-5 text-[15px] leading-[1.9] text-[#344054]">
          实际服务内容依据合同约定、设备状态、现场工况和服务距离提供维修、备件与技术支持，具体响应时效与服务标准以合同条款为准。
        </p>
      </Section>

      <Section id="faq" title="八、改造服务常见问题">
        <GeoFaqGrid items={faqs} openMode="first" />
      </Section>

      <Section id="advantages" title="九、为什么选择苏能改造服务">
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

      <Section id="contact" title="不确定老旧工业炉还能不能改？">
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
                <a href="tel:+8613052986814" className="text-[#c51624]">{siteSettings.salesPhone}</a>
              </p>
              <p>
                <strong className="font-semibold text-[#101828]">邮箱：</strong>
                <a href={`mailto:${siteSettings.email}`} className="text-[#c51624]">{siteSettings.email}</a>
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
                className="inline-flex min-h-[44px] items-center justify-center rounded-[4px] cta-secondary px-5 text-[14px] font-semibold transition"
              >
                获取报价方案
              </a>
              <a
                href={contactPath}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[4px] cta-secondary px-5 text-[14px] font-semibold transition"
              >
                联系苏能工业炉
              </a>
            </div>
            <div className="mt-8 border-t border-[#e1e7f0] pt-5 text-[14px] leading-[1.8] text-[#667085]">
              <p>内容维护：苏能工业炉工程技术团队</p>
              <p>最后更新：2026-07-30</p>
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
      <JsonLd id="furnace-renovation-overhaul-page-jsonld" data={servicePageJsonLd} />
      <JsonLd id="furnace-renovation-overhaul-faq-jsonld" data={faqJsonLd} />
    </div>
  );
}
