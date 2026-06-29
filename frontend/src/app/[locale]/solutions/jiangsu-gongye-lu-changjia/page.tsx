import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { QuoteModalButton } from '@/components/lead/QuoteModalButton';
import { getStaticProductBySlug } from '@/constants/static-products';
import { cleanObject, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO } from '@/lib/seo/page-data';
import { siteSettings } from '@/mock/siteSettings';

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
  projectType: string;
  scope: string;
  href?: string;
};

const pagePath = '/zh/solutions/jiangsu-gongye-lu-changjia';
const heroImage = '/images/about/about_img_hero_factory_01.png';
const quoteParamsPath = '/zh/articles/gongye-lu-baojia-canshu';
const decisionPath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';
const manufacturerPath = '/zh/solutions/rechuli-lu-changjia';
const renovationServicePath = '/zh/service/furnace-renovation-overhaul';
const productsPath = '/zh/products';
const contactPath = '/zh/contact';
const casePath = '/zh/case/anonymous-tsingshan-1250-renovation';

export const dynamicParams = false;

const heroTags = ['江苏泰州生产基地', '成立于 2006 年', '14700㎡生产基地', '国家高新技术企业', '热处理炉定制', '工业炉改造与大修'];

const serviceCards = [
  {
    title: '工业炉定制',
    text: '台车炉、箱式炉、井式炉、罩式炉、网带炉、辊底炉、推杆炉、转底炉等非标工业炉定制。',
  },
  {
    title: '热处理炉制造',
    text: '围绕退火、回火、正火、淬火加热、固溶、时效等工艺提供热处理炉方案。',
  },
  {
    title: '热处理生产线',
    text: '连续退火线、固溶生产线、铜丝退火线、托辊网带炉生产线等。',
  },
  {
    title: '工业炉节能改造',
    text: '针对老旧工业炉能耗高、炉衬老化、控制系统落后等问题进行评估。',
  },
  {
    title: '热处理炉大修',
    text: '炉衬翻新、加热系统检修、炉门密封、机械传动、电气控制系统升级。',
  },
  {
    title: '安装调试与售后',
    text: '根据项目位置、设备状态、合同约定和服务范围安排现场支持。',
  },
];

const productMatrixSeed = [
  {
    slug: 'trolley-furnace',
    title: '台车炉',
    text: '适合大型铸锻件、焊接结构件、模具和大件周期式热处理。',
  },
  {
    slug: 'box-furnace',
    title: '箱式炉',
    text: '适合中小型零件、小批量试制、回火、退火和工艺验证任务。',
  },
  {
    slug: 'pit-furnace',
    title: '井式炉',
    text: '适合轴类、杆件、套筒件等更适合竖直装炉的工件。',
  },
  {
    slug: 'bell-furnace',
    title: '罩式炉',
    text: '适合卷材、线材、盘卷和装框件的罩式退火与气氛保护处理。',
  },
  {
    slug: 'mesh-belt-furnace',
    title: '网带炉',
    text: '适合标准件、五金件、小型零件的连续式批量热处理。',
  },
  {
    slug: 'roller-hearth-furnace',
    title: '辊底炉',
    text: '适合板材、棒材、管材或规整工件的连续热处理生产线。',
  },
  {
    slug: 'pusher-furnace',
    title: '推杆炉',
    text: '适合节拍稳定、可按料盘或批次推进的连续热处理场景。',
  },
  {
    slug: 'rotary-hearth-furnace',
    title: '转底炉',
    text: '适合环形布料、节拍式旋转加热和中小型批量工件处理。',
  },
  {
    slug: 'roller-mesh-belt-line',
    title: '托辊型网带式电阻炉生产线',
    text: '适合中长炉膛、托辊支撑网带运行的连续热处理生产线。',
  },
  {
    slug: 'copper-wire-annealing-line',
    title: '铜丝自动化退火生产线',
    text: '适合铜丝、铜线、铜合金丝等线材连续退火和收放线联动。',
  },
  {
    slug: 'annealing-solution-line',
    title: '退火固溶生产线',
    text: '适合不锈钢带材、合金带材和卷材连续退火固溶处理。',
  },
];

const productMatrix = productMatrixSeed
  .map((item) => {
    const product = getStaticProductBySlug(item.slug);

    if (!product) return null;

    return {
      title: item.title,
      href: `/zh/products/detail/${item.slug}`,
      text: item.text,
    };
  })
  .filter(Boolean) as LinkCard[];

const quoteParams = [
  '炉型或工艺需求',
  '工件材质',
  '工件尺寸',
  '单件重量',
  '装炉量 / 产能',
  '最高温度',
  '热处理工艺',
  '温度均匀性要求',
  '加热方式',
  '控制系统要求',
  '现场位置',
  '现场空间与安装条件',
  '是否为新炉 / 改造 / 大修',
];

const selectionRows = [
  {
    dimension: '是否有真实制造基地',
    text: '看是否具备厂房、装配、制造、调试和交付能力。',
  },
  {
    dimension: '是否理解热处理工艺',
    text: '工业炉不是只做炉壳，还要理解工件、温度、装炉量、工艺曲线和控制要求。',
  },
  {
    dimension: '是否能做非标设计',
    text: '热处理炉多为非标设备，应根据工件和现场条件设计。',
  },
  {
    dimension: '是否有改造和大修能力',
    text: '老旧工业炉可能需要炉衬、加热、控制和机械系统综合评估。',
  },
  {
    dimension: '是否有真实案例和服务边界',
    text: '看相近炉型、相近行业案例，同时关注厂家是否明确不能做的边界。',
  },
];

const serviceRegions = ['江苏', '上海', '浙江', '安徽', '山东及周边区域可按项目评估'];

const industryCards = [
  {
    title: '钢铁与不锈钢',
    text: '常见于带材退火、固溶、酸洗配套和老旧热处理产线改造。',
  },
  {
    title: '铜材与有色金属',
    text: '可围绕铜丝、铜线、合金带材等连续退火和时效工艺评估炉型。',
  },
  {
    title: '机械加工',
    text: '适用于铸件、锻件、焊接件、模具和结构件的周期式热处理。',
  },
  {
    title: '汽车零部件',
    text: '常见于标准件、小型零件、轴类件和批量零件的连续或周期式处理。',
  },
  {
    title: '能源装备',
    text: '关注大型结构件、耐热部件、装备配套件的装炉方式和热处理稳定性。',
  },
  {
    title: '核工业配套',
    text: '适用于对质量记录、工艺稳定性、交付资料和项目协作要求较高的配套场景。',
  },
  {
    title: '工程总包配套项目',
    text: '可作为工业炉设备供应商或设备分包方，配合总包单位实施设备部分。',
  },
  {
    title: '热处理外协厂',
    text: '适合多炉型、多工件、多批次的热处理能力建设和旧炉升级评估。',
  },
];

const caseCards: CaseCard[] = [
  {
    title: '某青山系不锈钢企业 1250mm 三线连续退洗线节能改造',
    industry: '不锈钢深加工',
    furnaceType: '连续退洗线 / 热处理生产线',
    projectType: '工业炉节能改造',
    scope: '燃料结构升级、燃烧系统改造、烟气余热回收、控温系统优化、现场调试配合。',
    href: casePath,
  },
  {
    title: '某不锈钢压延企业罩式炉生产线技改',
    industry: '不锈钢压延',
    furnaceType: '罩式炉生产线',
    projectType: '气氛系统升级与控制系统改造',
    scope: '围绕罩式炉炉罩、密封、气氛、温控和运行稳定性进行技改评估与设备配套。',
  },
  {
    title: '某工程总包项目设备分包',
    industry: '工程总包配套',
    furnaceType: '不锈钢热处理装备',
    projectType: '工业炉设备分包供应',
    scope: '作为工业炉设备供应商或设备分包方，配合工程总包单位完成设备制造、调试与售后支持。',
  },
];

const faqs = [
  {
    question: 'Q1：苏能是江苏哪里的工业炉厂家？',
    answer:
      '苏能位于江苏省泰州市姜堰区张甸蔡官工业区，成立于 2006 年，主要从事热处理工业炉研发制造、非标工业炉定制、工业炉改造、大修和安装调试服务。具体项目可根据炉型、工艺和现场条件进行技术沟通。',
  },
  {
    question: 'Q2：江苏工业炉厂家可以做哪些炉型？',
    answer:
      '苏能可提供台车炉、箱式炉、井式炉、罩式炉、网带炉、辊底炉、推杆炉、转底炉及部分连续热处理生产线。具体炉型需结合工件尺寸、装炉量、最高温度、热处理工艺和现场条件判断。',
  },
  {
    question: 'Q3：苏能能服务江苏以外的项目吗？',
    answer:
      '可以根据项目情况评估。苏能位于江苏，可服务江苏及华东区域项目，也可根据设备规模、交付范围、安装调试要求和售后条件，评估其他区域工业炉项目的实施方式。',
  },
  {
    question: 'Q4：江苏工业炉定制报价需要哪些参数？',
    answer:
      '建议提供工件材质、尺寸、重量、装炉量、最高温度、热处理工艺、温度均匀性要求、加热方式、控制系统要求和现场条件。资料不完整也可以先沟通，由技术人员判断需补充内容。',
  },
  {
    question: 'Q5：苏能能做老旧工业炉改造和大修吗？',
    answer:
      '可以。苏能可对老旧工业炉进行炉衬翻新、加热系统检修、燃烧系统升级、控制系统改造、机械传动检修和搬迁复产评估。是否适合改造，需要结合原炉状态、工艺需求和停产窗口判断。',
  },
  {
    question: 'Q6：江苏工业炉厂家怎么判断是否靠谱？',
    answer:
      '建议看真实制造基地、相近炉型案例、热处理工艺理解能力、非标设计能力、售后服务能力和合同边界。工业炉不是标准货，不能只看低价和宣传图，应重点看方案是否匹配工件和工艺。',
  },
  {
    question: 'Q7：工业炉安装调试一般怎么安排？',
    answer:
      '安装调试方式需结合炉型、设备尺寸、现场基础、电源气源、吊装条件和合同范围确定。苏能可根据项目安排现场安装、试炉、调试和验收配合，具体周期和人员安排以项目约定为准。',
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
    title: '热处理炉厂家页面',
    href: manufacturerPath,
    text: '查看苏能作为热处理工业炉厂家的制造能力、产品范围和定制流程。',
  },
  {
    title: '工业炉报价需要哪些参数',
    href: quoteParamsPath,
    text: '整理炉型、尺寸、温度、装炉量、工艺、控制系统和现场条件。',
  },
  {
    title: '老旧工业炉该修还是换？',
    href: decisionPath,
    text: '旧炉项目可先判断适合大修、局部改造还是重新采购。',
  },
  {
    title: '工业炉节能改造与热处理炉大修服务',
    href: renovationServicePath,
    text: '了解老旧工业炉节能改造、炉衬翻新、控制系统升级和整炉大修。',
  },
  {
    title: '产品中心',
    href: productsPath,
    text: '查看苏能工业炉已公开产品系列和热处理炉型。',
  },
  {
    title: '联系我们',
    href: contactPath,
    text: '提交参数、咨询江苏及华东区域项目实施方式。',
  },
].filter(Boolean) as LinkCard[];

const pageJsonLd = cleanObject([
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.jssngyl.cn/zh/solutions/jiangsu-gongye-lu-changjia#webpage',
    url: 'https://www.jssngyl.cn/zh/solutions/jiangsu-gongye-lu-changjia',
    name: '江苏工业炉厂家｜热处理炉定制、改造与大修服务',
    description: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.description,
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
    { name: '江苏工业炉厂家', url: pagePath },
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
    title: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.title,
    description: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.description,
    path: pagePath,
    pageKey: 'solutions',
    keywords: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.keywords,
    image: JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO.ogImage,
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

export default async function JiangsuIndustrialFurnaceManufacturerPage({ params }: PageProps) {
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
            currentLabel="江苏工业炉厂家"
            className="text-[13px]"
            items={[{ label: '解决方案' }]}
          />

          <div className="mt-10 max-w-[980px]">
            <p className="text-[13px] font-semibold text-white/64 lg:text-[14px]">江苏区域服务能力页</p>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.16] tracking-[0.01em] lg:text-[56px]">
              江苏工业炉厂家｜热处理炉定制、改造与大修服务
            </h1>
            <p className="mt-5 max-w-[920px] text-[18px] font-semibold leading-[1.72] text-white/92 lg:text-[23px]">
              江苏苏能工业炉有限公司位于江苏泰州，成立于 2006 年，专注热处理工业炉研发制造，可为江苏及华东区域客户提供工业炉定制、热处理炉制造、老旧工业炉改造、大修、安装调试与售后支持。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-[14px] font-semibold text-white">
              {heroTags.map((tag) => (
                <span key={tag} className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-4">
              <QuoteModalButton
                label="获取报价方案"
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
              />
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

      <Section id="services" eyebrow="服务能力" title="一、苏能在江苏能提供哪些工业炉服务？">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map((item) => (
            <article key={item.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.35] text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="products" eyebrow="炉型范围" title="二、苏能主要服务哪些炉型？">
        <p className="max-w-[940px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          以下炉型均链接到官网已有真实产品页。若项目需要特殊炉型或组合产线，可先提交工件与工艺资料，由技术人员判断适配方向。
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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

      <Section id="params" eyebrow="询价资料" title="三、江苏客户询价前建议准备哪些资料？">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
              工业炉多为非标设备，江苏及华东项目在沟通初期可先整理基础参数，便于判断炉型、配置范围、安装条件和报价边界。
            </p>
            <a
              href={quoteParamsPath}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[4px] border border-[#c51624] px-5 text-[14px] font-semibold text-[#c51624] transition hover:bg-[#fff5f5]"
            >
              查看报价需要哪些参数
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quoteParams.map((item) => (
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

      <Section id="selection" eyebrow="厂家判断" title="五、江苏工业炉厂家怎么选？">
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

      <Section id="region" eyebrow="区域说明" title="六、江苏及华东区域项目服务说明">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6 lg:p-7">
            <p className="text-[16px] leading-[1.95] text-[#344054] lg:text-[18px]">
              苏能位于江苏泰州，可根据江苏及华东区域项目情况，安排技术沟通、现场勘查、安装调试、维修支持和售后服务。具体响应方式和服务周期需结合设备位置、项目复杂度、合同约定和工程排期确定。
            </p>
          </div>
          <div className="grid gap-3">
            {serviceRegions.map((item) => (
              <div key={item} className="rounded-[8px] border border-[#e1e7f0] bg-white px-5 py-4 text-[15px] font-semibold text-[#253047]">
                {item}
              </div>
            ))}
          </div>
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

      <Section id="cases" eyebrow="项目经验" title="八、项目经验">
        <div className="grid gap-5 lg:grid-cols-3">
          {caseCards.map((item) => (
            <article key={item.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[21px] font-semibold leading-[1.4] text-[#101828]">{item.title}</h3>
              <dl className="mt-5 space-y-3 text-[14px] leading-[1.75]">
                {[
                  ['行业', item.industry],
                  ['炉型', item.furnaceType],
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
          案例信息以公开页面和脱敏描述为准，不代表所有江苏或华东项目均具备相同配置、周期或效果。具体方案需结合项目参数单独评估。
        </p>
      </Section>

      <Section id="faq" eyebrow="常见问题" title="九、江苏工业炉厂家常见问题">
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

      <Section id="related" eyebrow="相关页面" title="十、相关页面内链">
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
              正在寻找江苏工业炉厂家？
            </h2>
            <p className="mt-5 max-w-[820px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
              把工件材质、尺寸、装炉量、最高温度、热处理工艺、现场位置和项目类型发给苏能，技术人员可先判断适合的炉型方向，并给出初步方案建议。
            </p>
            <address className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px] leading-[1.8] text-white/82 not-italic">
              <span>电话 / 微信：{siteSettings.salesPhone}</span>
              <span>邮箱：{siteSettings.email}</span>
            </address>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <QuoteModalButton
              label="获取报价方案"
              className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
            />
            <a
              href={contactPath}
              className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              联系苏能工业炉
            </a>
          </div>
        </div>
      </section>

      <JsonLd id="jiangsu-industrial-furnace-manufacturer-page-jsonld" data={pageJsonLd} />
      <JsonLd id="jiangsu-industrial-furnace-manufacturer-faq-jsonld" data={faqJsonLd} />
    </main>
  );
}
