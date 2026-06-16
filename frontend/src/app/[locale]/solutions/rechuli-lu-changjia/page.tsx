import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { getStaticProductBySlug } from '@/constants/static-products';
import { cleanObject, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO } from '@/lib/seo/page-data';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
};

type LinkCard = {
  title: string;
  href: string;
  text: string;
};

type CaseCard = {
  title: string;
  industry: string;
  furnaceType: string;
  process: string;
  projectType: string;
  scope: string;
  href?: string;
};

const pagePath = '/zh/solutions/rechuli-lu-changjia';
const heroImage = '/images/about/about_img_hero_factory_01.png';
const quoteParamsPath = '/zh/articles/gongye-lu-baojia-canshu';
const continuousLinePath = '/zh/solutions/continuous-heat-treatment-line';
const renovationServicePath = '/zh/service/furnace-renovation-overhaul';
const productsPath = '/zh/products';
const contactPath = '/zh/contact';
const casePath = '/zh/case/anonymous-tsingshan-1250-renovation';

export const dynamicParams = false;

const heroTags = [
  '成立于 2006 年',
  '14700㎡生产基地',
  '国家高新技术企业',
  'ISO 9001 / 14001 / 45001',
  '非标工业炉定制',
  '热处理炉大修与改造',
];

const productMatrixSeed = [
  {
    slug: 'trolley-furnace',
    title: '台车炉',
    text: '适合大型工件、铸件、焊接件、模具等周期式热处理。',
  },
  {
    slug: 'box-furnace',
    title: '箱式炉',
    text: '适合中小型工件退火、回火、淬火加热、正火等工艺。',
  },
  {
    slug: 'pit-furnace',
    title: '井式炉',
    text: '适合轴类、杆件、长件、竖直装炉热处理。',
  },
  {
    slug: 'mesh-belt-furnace',
    title: '网带炉',
    text: '适合小件、标准件、连续式批量热处理。',
  },
  {
    slug: 'roller-hearth-furnace',
    title: '辊底炉',
    text: '适合板材、棒材、连续式生产线热处理。',
  },
  {
    slug: 'pusher-furnace',
    title: '推杆炉',
    text: '适合连续化、节拍稳定的批量热处理生产。',
  },
  {
    slug: 'bell-furnace',
    title: '罩式炉',
    text: '适合卷材、带材、线材等保护气氛退火。',
  },
  {
    slug: 'annealing-solution-line',
    title: '热处理生产线',
    text: '适合连续退火、固溶、时效、回火等成套设备需求。',
  },
];

const productMatrix = productMatrixSeed
  .map((item) => {
    const product = getStaticProductBySlug(item.slug);

    if (!product) return null;

    return {
      ...item,
      href: `/zh/products/detail/${item.slug}`,
    };
  })
  .filter(Boolean) as LinkCard[];

const processCards = [
  {
    title: '退火',
    text: '适用于钢铁、有色金属、铸锻件等材料，常见炉型包括台车炉、箱式炉、罩式炉和连续退火线，报价需确认材质、温度曲线和装炉量。',
  },
  {
    title: '固溶',
    text: '常见于不锈钢、有色金属和合金材料，通常关注最高温度、冷却方式、带材宽度或工件尺寸，连续线项目还需确认产能节拍。',
  },
  {
    title: '时效',
    text: '适用于铝合金、铜合金和部分结构件，常见炉型包括箱式炉、台车炉和连续炉，需确认保温时间、温度均匀性和批次节拍。',
  },
  {
    title: '回火',
    text: '适用于淬火后的零件、模具和结构件，常见炉型包括台车炉、箱式炉、网带炉，报价需确认回火温度、装炉方式和处理批量。',
  },
  {
    title: '淬火加热',
    text: '适用于需要后续冷却介质配合的工件，加热炉型需结合工件尺寸、温度均匀性、转运方式和安全联锁条件综合设计。',
  },
  {
    title: '正火',
    text: '常见于铸件、锻件和机械结构件，台车炉、箱式炉、辊底炉均可能适配，需确认最高温度、升温速度和出炉方式。',
  },
  {
    title: '渗碳',
    text: '可根据项目要求评估炉型、气氛、温度和安全系统，不将其简单套入标准配置，需先确认工艺资料和现场条件。',
  },
  {
    title: '渗氮',
    text: '可根据工件材质、气氛要求、温度区间和控制系统进行可行性评估，具体方案应以技术沟通和合同边界为准。',
  },
  {
    title: '光亮退火',
    text: '适用于带材、线材和部分金属材料，需重点确认保护气氛、密封结构、露点要求、炉膛尺寸和连续生产节拍。',
  },
  {
    title: '连续热处理',
    text: '适用于批量稳定、节拍明确的生产任务，常见炉型包括网带炉、辊底炉、推杆炉和连续退火线，需确认产能与上下料方式。',
  },
];

const customParams = [
  '工件材质',
  '工件尺寸',
  '单件重量',
  '装炉量 / 产能',
  '最高温度',
  '常用工作温度',
  '热处理工艺',
  '温度均匀性要求',
  '加热方式',
  '控制系统要求',
  '现场条件',
  '交付周期',
];

const selectionRows = [
  {
    dimension: '是否具备真实制造能力',
    text: '是否有自有厂房、生产设备、装配能力和调试能力。',
  },
  {
    dimension: '是否理解热处理工艺',
    text: '不能只会做炉体，还要理解工件、温度、装炉量、工艺曲线和控温要求。',
  },
  {
    dimension: '是否能做非标方案',
    text: '热处理炉多为非标设备，需要按工件和现场条件设计。',
  },
  {
    dimension: '是否有案例经验',
    text: '重点看相近炉型、相近行业、相近工艺案例，而不是只看宣传图。',
  },
  {
    dimension: '是否有售后能力',
    text: '工业炉交付后还涉及调试、维护、配件、改造和大修。',
  },
  {
    dimension: '是否边界清楚',
    text: '厂家应明确能做什么、不能做什么，不应虚假承诺。',
  },
];

const deliveryCapabilities = [
  {
    title: '方案设计',
    text: '根据工件、工艺、温度、产能和现场条件进行炉型方案设计。',
  },
  {
    title: '炉体制造',
    text: '覆盖炉体钢结构、炉衬、加热系统、机械传动等制造环节。',
  },
  {
    title: '电气控制',
    text: '可配置 PLC、触摸屏、温控仪、记录仪、多区控温、报警保护等系统。',
  },
  {
    title: '安装调试',
    text: '根据项目现场条件进行安装、试炉、调试和验收配合。',
  },
  {
    title: '售后服务',
    text: '提供维修、备件、技术支持、旧炉改造和大修服务。',
  },
  {
    title: '项目协作',
    text: '可作为工业炉设备供应商或设备分包方，与工程总包公司协作。',
  },
];

const industryCards = [
  {
    title: '钢铁与不锈钢',
    text: '常见于带钢退火、固溶、热处理生产线及老旧工业炉节能改造项目。',
  },
  {
    title: '铜材与有色金属',
    text: '常见于铜材退火、铝合金时效、固溶处理等热处理场景。',
  },
  {
    title: '机械加工',
    text: '常见于铸件、锻件、焊接件、模具和结构件的退火、回火、正火处理。',
  },
  {
    title: '汽车零部件',
    text: '常见于标准件、小型零件、轴类件和批量零件的连续热处理或周期式热处理。',
  },
  {
    title: '能源装备',
    text: '常见于大型结构件、耐热部件和装备制造配套热处理项目。',
  },
  {
    title: '核工业配套',
    text: '适用于对设备质量、工艺稳定性、资料完整性要求较高的配套制造场景。',
  },
  {
    title: '工程总包配套项目',
    text: '苏能可作为工业炉设备供应商或设备分包方，配合总包单位完成设备制造、调试与售后支持。',
  },
];

const caseCards: CaseCard[] = [
  {
    title: '某青山系不锈钢企业 1250mm 三线连续退洗线节能改造',
    industry: '不锈钢深加工',
    furnaceType: '连续退洗线 / 热处理生产线',
    process: '连续退火、酸洗配套',
    projectType: '工业炉节能改造',
    scope: '燃料结构升级、燃烧系统改造、烟气余热回收、控温系统优化、现场调试配合。',
    href: casePath,
  },
  {
    title: '某不锈钢压延企业罩式炉生产线技改',
    industry: '不锈钢压延',
    furnaceType: '罩式炉生产线',
    process: '保护气氛退火',
    projectType: '气氛系统升级 + 控制系统改造',
    scope: '围绕罩式炉炉罩、密封、气氛、温控和运行稳定性进行技改评估与设备配套。',
  },
  {
    title: '某工程总包项目设备分包',
    industry: '工程总包配套',
    furnaceType: '不锈钢热处理装备',
    process: '按总包项目技术要求执行',
    projectType: '工业炉设备分包供应',
    scope: '作为工业炉设备供应商或设备分包方，配合工程总包单位完成设备制造、安装调试与售后支持。',
  },
];

const customSteps = [
  {
    title: '提交工件和工艺参数',
    text: '先提供工件材质、尺寸、重量、装炉量、温度和热处理工艺。',
  },
  {
    title: '初步判断炉型方案',
    text: '技术人员判断更适合台车炉、箱式炉、井式炉、网带炉或生产线方案。',
  },
  {
    title: '技术沟通与参数确认',
    text: '进一步确认炉膛尺寸、温度均匀性、加热方式、控制系统和现场条件。',
  },
  {
    title: '输出技术方案和报价',
    text: '在参数明确后输出初步方案、主要配置、报价范围和交付边界。',
  },
  {
    title: '生产制造与出厂检验',
    text: '按确认方案进行炉体制造、装配、电控配套和出厂前检查。',
  },
  {
    title: '安装调试与售后服务',
    text: '结合现场条件完成安装、试炉、调试、验收配合和后续服务。',
  },
];

const faqs = [
  {
    question: 'Q1：热处理炉厂家和工业炉厂家有什么区别？',
    answer:
      '热处理炉是工业炉中的一类，主要用于退火、回火、淬火、固溶、时效等热处理工艺。工业炉厂家范围更宽，可能覆盖加热炉、干燥炉、烧结炉等。采购时应重点看厂家是否理解具体热处理工艺和工件要求。',
  },
  {
    question: 'Q2：热处理炉可以直接按标准型号报价吗？',
    answer:
      '多数热处理炉属于非标设备，不能只按炉型名称报价。炉膛尺寸、最高温度、装炉量、工艺曲线、加热方式、温度均匀性和控制系统都会影响方案和价格。建议先提供工件、温度、产能和工艺要求，再由厂家判断炉型方向。',
  },
  {
    question: 'Q3：苏能主要生产哪些热处理炉？',
    answer:
      '苏能可提供台车炉、箱式炉、井式炉、网带炉、辊底炉、推杆炉、罩式炉及热处理生产线等设备。具体炉型需结合工件尺寸、处理工艺、温度范围、产能节拍和现场条件确定，不建议只按炉型名称直接选型。',
  },
  {
    question: 'Q4：非标热处理炉定制周期多久？',
    answer:
      '定制周期与炉型、尺寸、温度等级、控制系统、制造复杂度和项目排期有关。单机设备和连续生产线周期差异较大，旧炉改造项目还需考虑现场施工窗口。具体交期应以技术方案和合同约定为准。',
  },
  {
    question: 'Q5：热处理炉厂家怎么判断是否靠谱？',
    answer:
      '建议重点看真实制造能力、相近案例、工艺理解能力、技术方案细节、售后服务能力和合同边界。不要只看低价报价，也不要只看宣传图片。对于非标热处理炉，更应关注厂家是否能把工件、温度、产能和控制要求说清楚。',
  },
  {
    question: 'Q6：苏能能做旧炉改造和大修吗？',
    answer:
      '可以。苏能已设置工业炉节能改造与热处理炉大修服务页面，可对老旧工业炉进行炉衬翻新、控制系统升级、燃烧系统改造、搬迁复产和整炉大修评估。是否适合改造，需要结合原炉状态和现场条件判断。',
  },
  {
    question: 'Q7：热处理炉询价前需要准备哪些资料？',
    answer:
      '建议准备工件材质、尺寸、重量、装炉量、最高温度、热处理工艺、温度均匀性、能源类型、控制要求和现场条件。资料不完整也可以先沟通，由技术人员判断需要补充的信息。',
  },
  {
    question: 'Q8：苏能是否承接工程总包？',
    answer:
      '苏能通常作为工业炉设备供应商或设备分包方参与项目，不宣称承接工程总包业务。如项目涉及土建、压力容器、特殊行业资质或工程总包要求，应由具备相应资质的单位承担，苏能可配合设备部分实施。',
  },
];

const faqJsonLd = getFaqJsonLd(faqs);
const faqColumnSize = Math.ceil(faqs.length / 2);
const faqColumns = [faqs.slice(0, faqColumnSize), faqs.slice(faqColumnSize)];

const selectionReferenceLinks = [
  getStaticProductBySlug('trolley-furnace') && {
    title: '工件材质',
    href: '/zh/products/detail/trolley-furnace',
    text: '大型铸锻件、焊接结构件和模具可先参考台车炉选型。',
  },
  getStaticProductBySlug('box-furnace') && {
    title: '炉型选择',
    href: '/zh/products/detail/box-furnace',
    text: '中小型零件、小批量和试制任务可先参考箱式炉配置。',
  },
  getStaticProductBySlug('mesh-belt-furnace') && {
    title: '产能需求',
    href: '/zh/products/detail/mesh-belt-furnace',
    text: '小件批量、连续生产和节拍稳定场景可先参考网带炉。',
  },
  getStaticProductBySlug('pit-furnace') && {
    title: '装炉方式',
    href: '/zh/products/detail/pit-furnace',
    text: '轴类、杆件和竖直装炉工件可先参考井式炉。',
  },
  getStaticProductBySlug('roller-hearth-furnace') && {
    title: '温度等级',
    href: '/zh/products/detail/roller-hearth-furnace',
    text: '板材、棒材、管材等连续处理可先参考辊底炉。',
  },
].filter(Boolean) as LinkCard[];

const relatedLinks = [
  {
    title: '工业炉报价需要哪些参数',
    href: quoteParamsPath,
    text: '查看询价前建议整理的炉型、尺寸、温度、装炉量、工艺和现场条件。',
  },
  {
    title: '连续热处理生产线解决方案',
    href: continuousLinePath,
    text: '查看产线级项目的系统组成、节拍、交付边界和设备分包范围。',
  },
  {
    title: '工业炉节能改造与热处理炉大修服务',
    href: renovationServicePath,
    text: '了解旧炉改造、大修、炉衬翻新、燃烧系统升级和控制系统改造。',
  },
  {
    title: '产品中心',
    href: productsPath,
    text: '查看苏能工业炉已公开的热处理炉和工业炉产品系列。',
  },
  {
    title: '联系我们',
    href: contactPath,
    text: '提交参数、咨询炉型方案或预约进一步技术沟通。',
  },
].filter(Boolean) as LinkCard[];

const pageJsonLd = cleanObject([
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.jssngyl.cn/zh/solutions/rechuli-lu-changjia#webpage',
    url: 'https://www.jssngyl.cn/zh/solutions/rechuli-lu-changjia',
    name: '热处理炉厂家｜工业炉定制与热处理设备制造',
    description: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.description,
    inLanguage: 'zh-CN',
    about: {
      '@id': 'https://www.jssngyl.cn/#organization',
    },
    mainEntity: {
      '@id': 'https://www.jssngyl.cn/#organization',
    },
  },
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '热处理炉厂家', url: pagePath },
  ]),
]);

export function generateStaticParams() {
  return [{ locale: 'zh' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return buildMetadata({
    title: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.title,
    description: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.description,
    path: pagePath,
    pageKey: 'solutions',
    keywords: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.keywords,
    image: HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO.ogImage,
    type: 'website',
    alternateLocales: {
      'zh-CN': pagePath,
      'x-default': pagePath,
    },
  });
}

function Section({ id, eyebrow, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[#e2e8f0] py-12 lg:py-16">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <p className="text-[13px] font-semibold text-[#c51624]">{eyebrow}</p>
        <h2 className="mt-3 text-[26px] font-semibold leading-[1.28] text-[#101828] lg:text-[38px]">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export default async function HeatTreatmentFurnaceManufacturerPage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return (
    <main className="bg-white text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] text-white">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-38" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,36,0.96)_0%,rgba(12,38,74,0.84)_58%,rgba(12,38,74,0.5)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-20">
          <Breadcrumb
            locale="zh"
            tone="light"
            currentLabel="热处理炉厂家"
            className="text-[13px]"
            items={[{ label: '解决方案' }]}
          />

          <div className="mt-10 max-w-[980px]">
            <p className="text-[13px] font-semibold text-white/64 lg:text-[14px]">热处理工业炉厂家能力页</p>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.16] tracking-[0.01em] lg:text-[56px]">
              热处理炉厂家｜工业炉定制与热处理设备制造
            </h1>
            <p className="mt-5 max-w-[920px] text-[18px] font-semibold leading-[1.72] text-white/92 lg:text-[23px]">
              江苏苏能工业炉有限公司成立于 2006 年，专注热处理工业炉研发制造，可根据客户工件尺寸、工艺温度、装炉量、产能节拍和现场条件，提供台车炉、箱式炉、井式炉、网带炉、辊底炉、推杆炉等非标工业炉定制方案。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-[14px] font-semibold text-white">
              {heroTags.map((tag) => (
                <span key={tag} className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href={`${quoteParamsPath}#quote-contact-form`}
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

      <Section id="products" eyebrow="产品矩阵" title="一、苏能能做哪些热处理炉？">
        <p className="max-w-[940px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          热处理炉通常需要围绕工件形态、温度区间、装炉方式和生产节拍做非标设计。以下炉型均链接到官网已有真实产品页，未配置真实页面的产品不会在本模块展示。
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {productMatrix.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group rounded-[8px] border border-[#e1e7f0] bg-white p-6 transition hover:border-[#c51624] hover:shadow-[0_14px_28px_rgba(15,35,75,0.08)]"
            >
              <h3 className="text-[20px] font-semibold leading-[1.35] text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">{item.text}</p>
              <span className="mt-5 inline-flex text-[14px] font-semibold text-[#c51624]">查看产品参数</span>
            </a>
          ))}
        </div>
      </Section>

      <Section id="processes" eyebrow="工艺能力" title="二、苏能覆盖哪些热处理工艺？">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {processCards.map((card) => (
            <article key={card.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.35] text-[#101828]">{card.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{card.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="params" eyebrow="定制参数" title="三、非标热处理炉定制，需要确认哪些参数？">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
              非标热处理炉报价和方案设计不能只看炉型名称。建议先整理以下参数，便于厂家判断炉型方向、配置范围和交付边界。
            </p>
            <a
              href={quoteParamsPath}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[4px] border border-[#c51624] px-5 text-[14px] font-semibold text-[#c51624] transition hover:bg-[#fff5f5]"
            >
              查看报价需要哪些参数
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {customParams.map((item) => (
              <div key={item} className="rounded-[8px] border border-[#e1e7f0] bg-white px-5 py-4 text-[15px] font-semibold text-[#253047]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="selection-reference" eyebrow="选型参考" title="四、工业炉选型核心参考">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {selectionReferenceLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-[8px] border border-[#e1e7f0] bg-white p-5 transition hover:border-[#c51624] hover:shadow-[0_10px_24px_rgba(15,35,75,0.06)]"
            >
              <span className="text-[17px] font-semibold leading-[1.45] text-[#c51624]">{item.title}</span>
              <span className="mt-2 block text-[14px] leading-[1.8] text-[#475467]">{item.text}</span>
            </a>
          ))}
        </div>
      </Section>

      <Section id="selection" eyebrow="厂家选择" title="五、热处理炉厂家怎么选？">
        <div className="grid gap-4 md:hidden">
          {selectionRows.map((row) => (
            <article key={row.dimension} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5">
              <h3 className="text-[17px] font-semibold leading-[1.45] text-[#101828]">{row.dimension}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">{row.text}</p>
            </article>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-[8px] border border-[#dfe6f0] md:block">
          <table className="w-full border-collapse bg-white text-left">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="w-[280px] border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">维度</th>
                <th className="border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">说明</th>
              </tr>
            </thead>
            <tbody>
              {selectionRows.map((row) => (
                <tr key={row.dimension} className="border-b border-[#edf1f6] last:border-b-0">
                  <td className="px-5 py-4 text-[15px] font-semibold leading-[1.8] text-[#253047]">{row.dimension}</td>
                  <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#475467]">{row.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="capabilities" eyebrow="制造交付" title="六、苏能的制造与交付能力">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {deliveryCapabilities.map((item, index) => (
            <article key={item.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c51624] text-[15px] font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-[20px] font-semibold leading-[1.35] text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="industries" eyebrow="应用行业" title="七、典型应用行业">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industryCards.map((industry) => (
            <article key={industry.title} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5">
              <h3 className="text-[18px] font-semibold leading-[1.4] text-[#101828]">{industry.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.8] text-[#667085]">{industry.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="cases" eyebrow="项目经验" title="八、典型案例 / 项目经验">
        <div className="grid gap-5 lg:grid-cols-3">
          {caseCards.map((item) => (
            <article key={item.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[21px] font-semibold leading-[1.4] text-[#101828]">{item.title}</h3>
              <dl className="mt-5 space-y-3 text-[14px] leading-[1.75]">
                {[
                  ['行业', item.industry],
                  ['炉型', item.furnaceType],
                  ['工艺', item.process],
                  ['项目类型', item.projectType],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[76px_1fr] gap-3">
                    <dt className="font-semibold text-[#667085]">{label}</dt>
                    <dd className="text-[#344054]">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[15px] leading-[1.85] text-[#475467]">{item.scope}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]"
                >
                  查看完整案例
                </a>
              ) : (
                <p className="mt-5 rounded-[8px] border border-[#dfe6f0] bg-white p-4 text-[14px] leading-[1.75] text-[#667085]">
                  暂无公开详情页，可在商务沟通中提供经授权的参考材料。
                </p>
              )}
            </article>
          ))}
        </div>
        <p className="mt-7 rounded-[8px] border border-[#fed7aa] bg-[#fff7ed] p-5 text-[14px] leading-[1.85] text-[#7c2d12]">
          案例信息以公开页面和脱敏描述为准，不代表所有热处理炉项目均具备相同配置、周期或效果。具体方案需结合项目参数单独评估。
        </p>
      </Section>

      <Section id="flow" eyebrow="定制流程" title="九、热处理炉定制流程">
        <div className="grid gap-4">
          {customSteps.map((step, index) => (
            <article key={step.title} className="grid gap-5 rounded-[8px] border border-[#e1e7f0] bg-white p-5 shadow-[0_10px_24px_rgba(15,35,75,0.04)] md:grid-cols-[72px_1fr]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c51624] text-[20px] font-semibold text-white">
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

      <Section id="faq" eyebrow="常见问题" title="十、热处理炉厂家常见问题">
        <div className="grid gap-3 md:grid-cols-2 md:items-start md:gap-5" itemScope itemType="https://schema.org/FAQPage">
          {faqColumns.map((column, columnIndex) => (
            <div key={`faq-column-${columnIndex}`} className="space-y-3">
              {column.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-[8px] border border-[#dfe6f0] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,35,75,0.03)] [&>summary::-webkit-details-marker]:hidden"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  open
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
                  <div className="mt-4 border-t border-[#edf1f6] pt-4" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <div className="text-[15px] leading-[1.9] text-[#344054]" itemProp="text">
                      {faq.answer}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section id="related" eyebrow="相关页面" title="十一、相关页面内链">
        <div className="grid gap-4 md:grid-cols-2">
          {relatedLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5 transition hover:border-[#c51624] hover:shadow-[0_10px_24px_rgba(15,35,75,0.06)]"
            >
              <span className="text-[17px] font-semibold leading-[1.45] text-[#c51624]">{item.title}</span>
              <span className="mt-2 block text-[14px] leading-[1.8] text-[#475467]">{item.text}</span>
            </a>
          ))}
        </div>
      </Section>

      <section id="contact" className="border-t border-[#e2e8f0] bg-[#101828] py-12 text-white lg:py-16">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-[13px] font-semibold text-white/58">获取炉型方案</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-[1.28] lg:text-[42px]">
              正在寻找热处理炉厂家？
            </h2>
            <p className="mt-5 max-w-[820px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
              把工件材质、尺寸、重量、装炉量、最高温度、热处理工艺和现场条件发给苏能，技术人员可先判断适合的炉型方向，并给出初步方案建议。
            </p>
            <address className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px] leading-[1.8] text-white/82 not-italic">
              <span>电话 / 微信：+86-130-5298-6814</span>
              <span>邮箱：jssngyl@outlook.com</span>
            </address>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <a
              href={`${quoteParamsPath}#quote-contact-form`}
              className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
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
      </section>

      <JsonLd id="heat-treatment-furnace-manufacturer-page-jsonld" data={pageJsonLd} />
      <JsonLd id="heat-treatment-furnace-manufacturer-faq-jsonld" data={faqJsonLd} />
    </main>
  );
}
