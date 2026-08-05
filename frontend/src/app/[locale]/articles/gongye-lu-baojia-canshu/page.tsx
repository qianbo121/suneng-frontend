import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import {
  GeoBulletList as BulletList,
  GeoFaqGrid,
  GeoReviewNote,
  GeoSection as Section,
} from '@/components/geo-pages/GeoPageBlocks';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ProductLeadForm } from '@/components/products/ProductLeadForm';
import { getStaticProductBySlug } from '@/constants/static-products';
import { getArticleJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO } from '@/lib/seo/page-data';
import { siteSettings } from '@/mock/siteSettings';

import { CopyQuoteChecklistButton } from './CopyQuoteChecklistButton';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type RelatedLink = {
  title: string;
  href: string;
  text: string;
};

const pagePath = '/zh/articles/gongye-lu-baojia-canshu';
const heroImage = '/images/service/after-sales-hero.png';
const servicePath = '/zh/service';
const decisionPath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';
const jiangsuManufacturerPath = '/zh/solutions/jiangsu-gongye-lu-changjia';
const contactPath = '/zh/contact';
const trolleyFurnacePath = '/zh/products/detail/trolley-furnace';
const meshBeltFurnacePath = '/zh/products/detail/mesh-belt-furnace';
const boxFurnacePath = '/zh/products/detail/box-furnace';
const pitFurnacePath = '/zh/products/detail/pit-furnace';
const continuousLinePath = '/zh/solutions/continuous-heat-treatment-line';
const temperatureRemediationPath = '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai';
const renovationRiskPath = '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi';
const furnaceLiningRenovationPath = '/zh/solutions/rechuli-lu-luchen-fanxin';
const energyConversionPath = '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou';
const controlSystemUpgradePath = '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji';
const restartRelocationPath = '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan';

export const dynamicParams = false;

const heroTags = ['炉型选择', '炉膛尺寸', '最高温度', '装炉量', '工艺曲线', '控制系统'];

const noFixedPriceReasons = [
  {
    title: '炉膛尺寸不同',
    text: '有效工作区越大，炉体钢结构、炉衬材料、加热功率和制造工时都会变化，不能只按炉型名称估算。',
  },
  {
    title: '温度等级不同',
    text: '650℃、950℃、1200℃ 等温度等级对应的耐材、加热元件、测温和控制配置不同。',
  },
  {
    title: '装炉量不同',
    text: '单炉装料重量、台车承重、料筐或输送结构会影响炉体强度、传动方式和安全余量。',
  },
  {
    title: '工艺要求不同',
    text: '退火、回火、正火、固溶等工艺对温区、风循环、升温曲线和保温控制的要求不同。',
  },
  {
    title: '能源类型不同',
    text: '电加热、天然气、液化气、柴油或钢厂副产气涉及不同的热源系统、管路和安全联锁配置。',
  },
  {
    title: '自动化程度不同',
    text: '普通温控、PLC、触摸屏、记录仪、数据追溯和产线联动会带来不同的电控系统成本。',
  },
];

const coreParams = [
  {
    field: '炉型需求',
    description: '台车炉、箱式炉、井式炉、网带炉、辊底炉、推杆炉等；如果不确定，可描述工件和工艺，由苏能协助判断。',
  },
  {
    field: '炉膛尺寸',
    description: '长、宽、高或有效工作区尺寸，决定炉体结构和装料空间。',
  },
  {
    field: '最高温度',
    description: '设计最高温度和常用工作温度，例如 650℃、950℃、1200℃ 等。',
  },
  {
    field: '工件信息',
    description: '材质、单件尺寸、单件重量、装夹方式、最大外形尺寸。',
  },
  {
    field: '装炉量 / 产能',
    description: '每炉装多少、每天处理多少、连续炉每小时产能或线速度。',
  },
  {
    field: '工艺要求',
    description: '退火、固溶、时效、回火、淬火、正火等；最好提供升温、保温、降温曲线。',
  },
  {
    field: '温度均匀性',
    description: '是否要求 ±5℃、±10℃、±15℃ 等，具体需结合炉型和工艺判断。',
  },
  {
    field: '能源类型',
    description: '电、天然气、液化气、柴油、钢厂副产气等。',
  },
  {
    field: '控制系统要求',
    description: '普通温控、PLC、触摸屏、记录仪、数据追溯、MES/SCADA 对接等。',
  },
  {
    field: '现场条件',
    description: '车间空间、电源、气源、吊装条件、基础条件、进出料方式。',
  },
  {
    field: '交付要求',
    description: '交期、安装调试、是否需要改造旧炉、是否涉及搬迁复产。',
  },
];

const furnaceQuoteCards = [
  {
    title: '台车炉报价重点',
    items: ['炉膛尺寸', '装炉重量', '台车承重', '炉门结构', '轨道和基础', '温度均匀性'],
  },
  {
    title: '箱式炉报价重点',
    items: ['有效工作区尺寸', '温度等级', '加热元件类型', '炉门开启方式', '控制精度'],
  },
  {
    title: '网带炉报价重点',
    items: ['网带宽度', '产能或线速度', '温区数量', '网带材质', '连续运行时间', '上下料方式'],
  },
  {
    title: '井式炉报价重点',
    items: ['有效直径和深度', '吊装方式', '工件长度', '炉盖结构', '气氛或风循环要求'],
  },
  {
    title: '改造项目报价重点',
    items: ['原炉照片', '炉衬状态', '控制系统状态', '当前问题', '改造范围', '停产窗口'],
  },
];

const priceFactors = [
  '炉膛尺寸越大，制造成本越高。',
  '温度越高，耐材和加热系统要求越高。',
  '装炉量越大，结构强度要求越高。',
  '温度均匀性要求越高，控制和风循环设计越复杂。',
  '自动化程度越高，电控成本越高。',
  '燃气炉比普通电阻炉多燃烧系统、管路和安全联锁。',
  '连续炉比周期炉更依赖输送、温区和节拍设计。',
  '改造项目需要结合旧炉状态判断，不能只按新炉价格估算。',
];

const quoteScopeRows = [
  {
    scope: '方案与工程',
    included: '诊断、方案设计、工程量清单、设备与系统配置、图纸及技术文件。',
    boundary: '现场测绘、第三方设计或专项认证是否包含，需在报价中单列。',
  },
  {
    scope: '设备与材料',
    included: '炉体、炉衬、热源或燃烧系统、机械传动、控制系统、安全联锁及约定附件。',
    boundary: '保留旧件、客户自备件、易损件和备品备件范围需逐项确认。',
  },
  {
    scope: '现场实施',
    included: '按约定范围拆除、制造、运输、安装、调试和操作培训。',
    boundary: '基础、吊装、水电气接入、脚手架、保温拆除恢复及停产配合由谁承担，必须写清。',
  },
  {
    scope: '测试与交付',
    included: '合同约定的出厂检查、现场调试、性能测试和资料交付。',
    boundary: '第三方检测、排放检测、认证测试及额外复测通常需按项目单独确认。',
  },
];

const authorizedProjectExamples = [
  {
    factId: 'SN-CASE-P1-014',
    title: '超大型燃气台车退火炉改造',
    parameters:
      '有效加热区约 13 × 7.4 × 4.3 m，额定/最高使用温度 700℃；方案按 14 个温控区、14 × 630 kW = 8820 kW 核对，采用 14 套 630 kW 级高速天然气烧嘴，助燃空气 250–300℃为设计目标。',
    quoteImpact: '需要同时核算炉体结构、炉衬、燃烧系统、管路、安全联锁、排烟与现场施工边界。',
  },
  {
    factId: 'SN-CASE-P0-006',
    title: '850 mm 连续退火钝化线退火固溶段',
    parameters: '项目退火温度约 1050–1150℃，炉温最高可至 1300℃，退火炉主体长度约 130 m。',
    quoteImpact: '除炉体外，还要确认带材规格、速度核算、温区、冷却、收放卷和自动化接口。',
  },
  {
    factId: 'SN-CASE-P0-004',
    title: 'RCWT-75/45-9/6 可控气氛网带线',
    parameters: '淬火炉工作尺寸约 400 × 3200 mm，回火炉约 400 × 5600 mm，额定温度 950℃，生产能力约 150 kg/h。',
    quoteImpact: '报价需覆盖连续输送、气氛、淬火、清洗、回火、速度和产能边界，不能按单台炉估算。',
  },
];

const quoteTemplateItems = [
  '设备类型：',
  '工件材质：',
  '工件尺寸：',
  '单件重量：',
  '每炉装炉量 / 每小时产能：',
  '最高温度：',
  '常用工作温度：',
  '热处理工艺：',
  '升温 / 保温 / 降温要求：',
  '温度均匀性要求：',
  '加热方式：',
  '控制系统要求：',
  '车间现场条件：',
  '期望交期：',
  '是否为新炉 / 改造 / 大修：',
  '当前问题描述：',
  '是否有照片或图纸：',
];
const quoteTemplateIntro = '以下为工业炉报价参数清单，请填写后通过官网表单、电话/微信或邮箱发送给苏能。';
const quoteTemplateText = [quoteTemplateIntro, '', ...quoteTemplateItems.map((item) => `- ${item}`)].join('\n');

const quoteSteps = [
  {
    title: '客户提交基础参数',
    text: '先提供炉型、工件、温度、产能、工艺和现场条件等基础信息。',
  },
  {
    title: '苏能初步判断炉型和方案方向',
    text: '技术人员根据参数判断适合新炉定制、旧炉改造还是大修升级。',
  },
  {
    title: '技术人员确认关键参数',
    text: '对炉膛尺寸、装炉量、控温要求、能源条件和交付边界做二次确认。',
  },
  {
    title: '输出初步技术方案和报价范围',
    text: '在资料清楚的前提下，给出方案方向、主要配置和报价范围。',
  },
  {
    title: '形成正式报价和技术方案',
    text: '双方确认细节后，再输出正式报价、技术方案和交付范围。',
  },
];

const selectionReferenceLinks = [
  getStaticProductBySlug('trolley-furnace') && {
    title: '工件材质',
    href: trolleyFurnacePath,
    text: '大型铸锻件、模具和焊接结构件可先参考台车炉。',
  },
  getStaticProductBySlug('box-furnace') && {
    title: '炉型选择',
    href: boxFurnacePath,
    text: '中小型零件、小批量和试制任务可先参考箱式炉。',
  },
  getStaticProductBySlug('mesh-belt-furnace') && {
    title: '产能需求',
    href: meshBeltFurnacePath,
    text: '小件批量、连续生产和节拍稳定场景可先参考网带炉。',
  },
  getStaticProductBySlug('pit-furnace') && {
    title: '装炉方式',
    href: pitFurnacePath,
    text: '轴类、杆件和竖直装炉工件可先参考井式炉。',
  },
  {
    title: '温度等级 / 产线系统',
    href: continuousLinePath,
    text: '涉及连续上料、输送、加热、冷却和联动控制时，可先参考连续热处理生产线解决方案。',
  },
].filter(Boolean) as RelatedLink[];

const faqs = [
  {
    question: 'Q1：只知道工件尺寸，不知道选什么炉型，可以报价吗？',
    answer:
      '可以先做初步判断。客户可以提供工件材质、尺寸、重量、处理工艺、产能要求和最高温度，苏能技术人员可根据这些信息判断更适合台车炉、箱式炉、井式炉、网带炉或其他炉型。',
  },
  {
    question: 'Q2：为什么同样是台车炉，价格差别很大？',
    answer:
      '台车炉价格受炉膛尺寸、装炉重量、温度等级、炉衬结构、台车承重、炉门结构、加热方式和控制系统影响。同样叫台车炉，实际配置不同，成本差异会很大。',
  },
  {
    question: 'Q3：工业炉报价一般多久能出来？',
    answer:
      '如果参数较完整，苏能可先做炉型方向和报价范围判断；如果涉及复杂工艺、连续生产线、旧炉改造或现场条件不清楚，通常需要进一步技术确认或现场勘查。正式报价应以确认后的技术方案、配置清单和交付边界为准。',
  },
  {
    question: 'Q4：没有图纸可以报价吗？',
    answer:
      '可以先根据照片、尺寸、工件和工艺要求做初步判断。若项目复杂，后续仍需补充现场测量、图纸确认或技术沟通，避免因基础信息不足导致方案偏差。',
  },
  {
    question: 'Q5：工业炉改造报价和新炉报价有什么区别？',
    answer:
      '新炉报价主要根据设计参数和配置计算；改造报价还要考虑原炉状态、拆除难度、炉衬损坏程度、旧控制系统接口、现场施工条件和停产周期，因此需要更多现场资料。',
  },
  {
    question: 'Q6：报价时能不能只给一个大概价格？',
    answer:
      '可以给出初步价格区间，但正式报价需要明确炉型、尺寸、温度、装炉量、工艺要求、控制系统和交付范围。参数越完整，报价越接近真实项目成本。',
  },
  {
    question: 'Q7：工业炉节能改造报价包括哪些？',
    answer:
      '通常需要分开列明诊断与方案、炉体和炉衬、热源或燃烧系统、机械传动、控制与安全联锁、拆除运输、安装调试、性能测试和资料交付。基础、吊装、水电气接入、第三方检测、客户自备件及停产配合是否包含，必须在报价边界中逐项写清。',
  },
  {
    question: 'Q8：热处理炉节能改造多少钱？',
    answer:
      '没有脱离工况的通用固定价。只有确认原炉状态、改造范围、炉膛和温度、工件与产能、热源、控制要求、现场施工条件和停产窗口后，才适合给出价格区间；正式价格以技术方案、工程量清单和交付边界为准。',
  },
  {
    question: 'Q9：老旧工业炉改造预算怎么估算？',
    answer:
      '先把诊断与设计、拆除清运、炉体炉衬、加热或燃烧系统、机械传动、控制与安全联锁、安装调试、性能测试、第三方工作和停产配合分别列项。原炉隐蔽损伤和现场条件不清时，应保留待检查项，不能用一个固定总价掩盖未知工程量。',
  },
];

const faqJsonLd = getFaqJsonLd(faqs);
const breadcrumbJsonLd = getBreadcrumbJsonLd([
  { name: '首页', url: '/zh' },
  { name: '服务支持', url: servicePath },
  { name: '工业炉报价需要哪些参数', url: pagePath },
]);
const articleJsonLd = getArticleJsonLd({
  slug: 'gongye-lu-baojia-canshu',
  path: pagePath,
  headline: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.title,
  description: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.description,
  image: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.ogImage,
  datePublished: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.publishedTime,
  dateModified: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime,
});

const relatedLinks = [
  getStaticProductBySlug('trolley-furnace') && {
    title: '台车炉页面',
    href: trolleyFurnacePath,
    text: '了解台车炉的承重、炉膛尺寸和大型工件热处理适用场景。',
  },
  getStaticProductBySlug('box-furnace') && {
    title: '箱式炉页面',
    href: boxFurnacePath,
    text: '了解箱式炉有效工作区、温度等级和中小件热处理配置方向。',
  },
  getStaticProductBySlug('mesh-belt-furnace') && {
    title: '网带炉页面',
    href: meshBeltFurnacePath,
    text: '了解连续式网带炉在小件零件、标准件和批量热处理中的参数重点。',
  },
  getStaticProductBySlug('pit-furnace') && {
    title: '井式炉页面',
    href: pitFurnacePath,
    text: '了解井式炉有效深度、吊装方式和轴类杆件热处理参数。',
  },
  {
    title: '老旧工业炉该修还是换？',
    href: decisionPath,
    text: '如果是旧炉项目，先判断适合大修、局部改造还是重新采购。',
  },
  {
    title: '热处理炉温度不均怎么整改？',
    href: temperatureRemediationPath,
    text: '报价前先确认温度偏差的测试条件、排查路径与验收证据。',
  },
  {
    title: '热处理炉改造风险与停产周期',
    href: renovationRiskPath,
    text: '把未知工程量、旧新接口、停产切换和负载验收纳入报价边界。',
  },
  {
    title: '炉衬翻新报价前核对什么',
    href: furnaceLiningRenovationPath,
    text: '核对旧衬损坏、冷面钢板、锚固体系、材料接口、烘炉和验收资料。',
  },
  {
    title: '能源改造与余热回收如何立项',
    href: energyConversionPath,
    text: '报价前统一能源基线、公辅条件、安全排放、利用端和停产实施边界。',
  },
  {
    title: '控制系统升级报价前核对什么',
    href: controlSystemUpgradePath,
    text: '先拆分 I/O、柜体、仪表、执行机构、安全联锁、数据接口和停产切换范围。',
  },
  {
    title: '停产炉重启与搬迁复产',
    href: restartRelocationPath,
    text: '报价前确认停机原因、资料恢复、检查整改、重新安装、空载与负载验收边界。',
  },
  {
    title: '连续热处理生产线解决方案',
    href: continuousLinePath,
    text: '用于判断产线级项目的系统组成、节拍、交付边界和设备分包范围。',
  },
  {
    title: '江苏工业炉厂家能力页',
    href: jiangsuManufacturerPath,
    text: '如无法确定炉型，可先查看苏能江苏生产基地与工业炉厂家能力说明。',
  },
  {
    title: '联系我们',
    href: contactPath,
    text: '准备提交参数或需要人工沟通时，可直接进入联系页。',
  },
].filter(Boolean) as RelatedLink[];

export function generateStaticParams() {
  return [{ locale: 'zh' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return buildMetadata({
    title: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.title,
    description: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.description,
    path: pagePath,
    pageKey: 'article',
    keywords: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.keywords,
    image: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.ogImage,
    type: 'article',
    publishedTime: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.publishedTime,
    modifiedTime: INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime,
    alternateLocales: {
      'zh-CN': pagePath,
      'x-default': pagePath,
    },
  });
}

export default async function IndustrialFurnaceQuoteParamsPage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return (
    <main className="bg-white text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] text-white">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-34" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,36,0.95)_0%,rgba(12,38,74,0.82)_56%,rgba(12,38,74,0.46)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-20">
          <Breadcrumb
            locale="zh"
            tone="light"
            currentLabel="工业炉报价需要哪些参数？"
            className="text-[13px]"
            items={[{ label: '服务支持', href: servicePath }]}
          />

          <div className="mt-10 max-w-[930px]">
            <p className="mb-4 text-[13px] font-medium text-white/70 lg:text-[14px]">
              发布于{' '}
              <time dateTime={INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.publishedTime}>
                {INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.publishedTime.slice(0, 10)}
              </time>
            </p>
            <h1 className="text-[36px] font-semibold leading-[1.16] tracking-[0.01em] lg:text-[58px]">
              工业炉报价需要哪些参数？
            </h1>
            <p className="mt-5 max-w-[900px] text-[18px] font-semibold leading-[1.72] text-white/92 lg:text-[24px]">
              工业炉属于非标设备，报价不能只看炉型名称。炉膛尺寸、最高温度、工件重量、装炉量、工艺曲线、能源类型、控制要求和现场条件，都会影响方案设计和最终价格。
            </p>
            <p className="mt-4 max-w-[860px] text-[14px] leading-[1.85] text-white/70 lg:text-[16px]">
              填写或复制下方报价参数清单后，可通过表单、电话/微信或邮箱提交给苏能。工程技术人员会根据工件、温度、工艺、产能和现场条件，先判断炉型方向、配置边界和报价范围。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-[14px] font-semibold text-white">
              {heroTags.map((tag) => (
                <span key={tag} className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <a
                href="#quote-contact-form"
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-[4px] cta-primary px-6 text-[15px] font-semibold text-white transition sm:w-auto"
              >
                获取报价方案
              </a>
              <CopyQuoteChecklistButton
                text={quoteTemplateText}
                label="复制参数清单"
                wrapperClassName="contents"
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
                messageClassName="mt-1 block w-full flex-none rounded-[6px] border border-white/16 bg-white/10 px-4 py-3 text-[14px] leading-[1.7] text-white/82"
              />
            </div>
          </div>
        </div>
      </section>

      <GeoReviewNote
        modifiedDate={INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime.slice(0, 10)}
        sourceNote="苏能 GEO 事实台账中的项目参数（SN-CASE-P1-014、SN-CASE-P0-006、SN-CASE-P0-004）"
      />

      <Section id="why" eyebrow="报价逻辑" title="一、为什么工业炉不能直接报一个固定价格？">
        <p className="max-w-[980px] rounded-[8px] border border-[#f3c5ca] bg-[#fff8f8] p-5 text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          <strong className="font-semibold text-[#101828]">直接答案：</strong>
          工业炉和热处理炉改造没有脱离工况的通用固定价。同样叫“台车炉”或“退火炉”，工件、炉膛、温度、装炉量、热源、控制要求、现场施工和停产窗口不同，工程量与价格都会变化；参数不完整时只能给方案方向，不能把一个数字当成正式报价。
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {noFixedPriceReasons.map((reason) => (
            <article key={reason.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.35] text-[#101828]">{reason.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{reason.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <h3 className="text-[23px] font-semibold leading-[1.4] text-[#101828]">工业炉节能改造报价通常包括哪些？</h3>
          <p className="mt-3 max-w-[960px] text-[15px] leading-[1.9] text-[#344054] lg:text-[16px]">
            一份可比较的报价应同时写清“包含什么”和“不包含什么”。只给总价、没有工程量和交付边界，采购方无法判断两份报价是否在同一口径上。
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {quoteScopeRows.map((item) => (
              <article key={item.scope} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5">
                <h4 className="text-[18px] font-semibold leading-[1.4] text-[#101828]">{item.scope}</h4>
                <p className="mt-3 text-[15px] leading-[1.8] text-[#344054]">
                  <strong className="font-semibold text-[#101828]">通常包含：</strong>
                  {item.included}
                </p>
                <p className="mt-3 border-t border-[#edf1f6] pt-3 text-[14px] leading-[1.8] text-[#667085]">
                  <strong className="font-semibold text-[#344054]">必须确认：</strong>
                  {item.boundary}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="param-table" eyebrow="核心参数" title="二、工业炉报价前需要提供的核心参数">
        <div className="grid gap-4 md:hidden">
          {coreParams.map((item) => (
            <article key={item.field} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5">
              <h3 className="text-[17px] font-semibold leading-[1.4] text-[#101828]">{item.field}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-[8px] border border-[#dfe6f0] md:block">
          <table className="w-full border-collapse bg-white text-left">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="w-[210px] border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">字段</th>
                <th className="border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">说明</th>
              </tr>
            </thead>
            <tbody>
              {coreParams.map((item) => (
                <tr key={item.field} className="border-b border-[#edf1f6] last:border-b-0">
                  <td className="px-5 py-4 text-[15px] font-semibold leading-[1.8] text-[#253047]">{item.field}</td>
                  <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#475467]">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="furnace-types" eyebrow="炉型差异" title="三、不同类型工业炉，重点参数不一样">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {furnaceQuoteCards.map((card) => (
            <article key={card.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.35] text-[#101828]">{card.title}</h3>
              <BulletList items={card.items} />
            </article>
          ))}
        </div>
        <p className="mt-6 rounded-[8px] border border-[#dfe6f0] bg-white p-5 text-[15px] leading-[1.85] text-[#344054]">
          如无法确定炉型，可先查看
          <a href={jiangsuManufacturerPath} className="font-semibold underline underline-offset-4">
            江苏工业炉厂家能力页
          </a>
          ，再结合工件、温度、产能和现场条件判断方案方向。
        </p>
      </Section>

      <Section id="project-evidence" eyebrow="真实项目证据" title="四、三个已授权项目说明：同类炉型为什么不能套固定价">
        <p className="max-w-[980px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          以下参数来自已经授权公开的具体项目，用于说明报价变量如何改变设备结构与交付边界。它们不是标准型号参数，也不代表其他项目的固定价格、产能或配置。
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {authorizedProjectExamples.map((item) => (
            <article key={item.factId} className="rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-6">
              <p className="text-[12px] font-semibold tracking-[0.08em]">{item.factId}</p>
              <h3 className="mt-2 text-[20px] font-semibold leading-[1.4] text-[#101828]">{item.title}</h3>
              <p className="mt-4 text-[15px] leading-[1.85] text-[#344054]">
                <strong className="font-semibold text-[#101828]">项目参数：</strong>
                {item.parameters}
              </p>
              <p className="mt-4 border-t border-[#dfe6f0] pt-4 text-[15px] leading-[1.85] text-[#475467]">
                <strong className="font-semibold text-[#101828]">报价影响：</strong>
                {item.quoteImpact}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="selection-reference" eyebrow="选型参考" title="五、工业炉选型核心参考">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {selectionReferenceLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-[8px] border border-[#e1e7f0] bg-white p-5 transition hover:border-[#c51624] hover:shadow-[0_10px_24px_rgba(15,35,75,0.06)]"
            >
              <span className="text-[17px] font-semibold leading-[1.45]">{item.title}</span>
              <span className="mt-2 block text-[14px] leading-[1.8] text-[#475467]">{item.text}</span>
            </a>
          ))}
        </div>
      </Section>

      <Section id="price-factors" eyebrow="价格因素" title="六、哪些信息会明显影响价格？">
        <div className="grid gap-4 md:grid-cols-2">
          {priceFactors.map((factor, index) => (
            <article key={factor} className="flex gap-4 rounded-[8px] border border-[#e1e7f0] bg-white p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full cta-primary text-[15px] font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-[15px] leading-[1.85] text-[#344054] lg:text-[16px]">{factor}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="quote-template" eyebrow="提交闭环" title="七、如何把报价需求提交给苏能？">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[8px] border border-[#dfe6f0] bg-[#101828] p-6 text-white lg:p-7">
            <p className="text-[16px] font-semibold">请复制以下格式提交给苏能：</p>
            <pre className="mt-5 whitespace-pre-wrap break-words rounded-[6px] border border-white/14 bg-black/18 p-5 text-[14px] leading-[1.85] text-white/88">
              {quoteTemplateText}
            </pre>
            <CopyQuoteChecklistButton text={quoteTemplateText} />
          </div>
          <div className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6 lg:p-7">
            <h3 className="text-[22px] font-semibold leading-[1.35] text-[#101828]">资料不完整也可以先沟通</h3>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
              如果暂时无法确定炉型，可以先提供工件信息、热处理工艺、产能需求和现场照片。苏能会先判断大致方案方向，再提示需要补充哪些关键参数。
            </p>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">
              苏能将基于您提供的参数，结合工件尺寸、工艺温度与产能节拍，对工业炉选型与热处理方案进行初步判断。
            </p>
            <div className="mt-5 rounded-[8px] border border-[#dfe6f0] bg-white p-5">
              <p className="text-[15px] font-semibold text-[#101828]">判断范围包括：</p>
              <BulletList
                items={['单台工业炉方案', '多炉组合方案', '连续热处理生产线方案', '或旧炉改造方案']}
              />
            </div>
            <div className="mt-6 rounded-[8px] border border-[#fed7aa] bg-[#fff7ed] p-5 text-[14px] leading-[1.85] text-[#7c2d12]">
              报价范围仅用于前期沟通，正式报价应以双方确认后的技术方案、配置清单、交付边界和合同条款为准。
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[8px] border border-[#dfe6f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)] lg:p-7">
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full cta-primary text-[15px] font-semibold text-white">
                1
              </span>
              <h3 className="mt-4 text-[20px] font-semibold leading-[1.4] text-[#101828]">复制参数清单</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">
                把设备类型、工件、温度、工艺、产能、现场条件整理好。
              </p>
            </article>
            <article className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full cta-primary text-[15px] font-semibold text-white">
                2
              </span>
              <h3 className="mt-4 text-[20px] font-semibold leading-[1.4] text-[#101828]">发送给苏能</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">
                可通过在线表单、电话/微信
                <a href="tel:+8613052986814" className="mx-1 font-semibold underline underline-offset-4">
                  {siteSettings.salesPhone}
                </a>
                ，或邮箱
                <a href={`mailto:${siteSettings.email}`} className="mx-1 font-semibold underline underline-offset-4">
                  {siteSettings.email}
                </a>
                提交。
              </p>
              <a
                href="#quote-contact-form"
                className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-[4px] cta-primary px-5 text-[14px] font-semibold text-white transition"
              >
                在线表单
              </a>
            </article>
            <article className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full cta-primary text-[15px] font-semibold text-white">
                3
              </span>
              <h3 className="mt-4 text-[20px] font-semibold leading-[1.4] text-[#101828]">工程师初步判断</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">
                苏能根据参数判断炉型方向、工艺适配、配置边界和报价范围。
              </p>
              <BulletList items={['炉型选型建议', '加热系统方向（电 / 燃气）', '工艺适配判断', '初步方案范围说明']} />
            </article>
          </div>
          <p className="mt-5 rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5 text-[15px] leading-[1.85] text-[#344054]">
            通常 1 个工作日内进行初步判断；具体回复时间以项目复杂度和资料完整度为准。
          </p>
        </div>
      </Section>

      <Section id="process" eyebrow="报价流程" title="八、工业炉报价流程">
        <div className="grid gap-4">
          {quoteSteps.map((step, index) => (
            <article key={step.title} className="grid gap-5 rounded-[8px] border border-[#e1e7f0] bg-white p-5 shadow-[0_10px_24px_rgba(15,35,75,0.04)] md:grid-cols-[72px_1fr]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full cta-primary text-[20px] font-semibold text-white">
                {index + 1}
              </div>
              <div>
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="faq" eyebrow="常见问题" title="九、工业炉报价常见问题">
        <GeoFaqGrid items={faqs} openMode="first" />
      </Section>

      <Section id="related" eyebrow="相关页面" title="十、相关页面与延伸阅读">
        <div className="grid gap-4 md:grid-cols-2">
          {relatedLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5 transition hover:border-[#c51624] hover:shadow-[0_10px_24px_rgba(15,35,75,0.06)]"
            >
              <span className="text-[17px] font-semibold leading-[1.45]">{item.title}</span>
              <span className="mt-2 block text-[14px] leading-[1.8] text-[#475467]">{item.text}</span>
            </a>
          ))}
        </div>
      </Section>

      <section id="contact" className="border-t border-[#e2e8f0] bg-[#101828] py-12 text-white lg:py-16">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <h2 className="text-[28px] font-semibold leading-[1.28] lg:text-[42px]">
              准备询价？先把这些参数发给苏能
            </h2>
            <p className="mt-5 max-w-[820px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
              如果暂时无法确定炉型，也可以先通过下方表单提交工件信息、工艺要求、产能需求和现场照片。苏能技术人员可先判断适合新炉定制、旧炉改造还是大修升级。
            </p>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <a
              href="#quote-contact-form"
              className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] cta-primary px-6 text-[15px] font-semibold text-white transition"
            >
              获取报价方案
            </a>
            <a
              href={contactPath}
              className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              联系苏能工业炉
            </a>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-[1180px] px-5 lg:px-8">
          <ProductLeadForm
            anchorId="quote-contact-form"
            title="提交工业炉报价需求"
            description="请尽量填写工件材质、尺寸、温度、热处理工艺、产能需求和现场条件。资料不完整也可以先提交，苏能工程师会提示需要补充的关键参数。"
            submitLabel="提交报价需求"
          />
        </div>
      </section>

      <JsonLd id="industrial-furnace-quote-params-article-jsonld" data={articleJsonLd} />
      <JsonLd id="industrial-furnace-quote-params-breadcrumb-jsonld" data={breadcrumbJsonLd} />
      <JsonLd id="industrial-furnace-quote-params-faq-jsonld" data={faqJsonLd} />
    </main>
  );
}
