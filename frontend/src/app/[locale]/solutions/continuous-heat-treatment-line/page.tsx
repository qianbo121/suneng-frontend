import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { cleanObject, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { CONTINUOUS_HEAT_TREATMENT_LINE_SEO } from '@/lib/seo/page-data';

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

type TextCard = {
  title: string;
  text: string;
};

type ExperienceCard = {
  title: string;
  text: string;
  href?: string;
};

const pagePath = '/zh/solutions/continuous-heat-treatment-line';
const heroImage = '/images/products/annealing-solution-line/gallery/line-01.jpg';
const quoteParamsPath = '/zh/articles/gongye-lu-baojia-canshu';
const renovationServicePath = '/zh/service/furnace-renovation-overhaul';
const manufacturerPath = '/zh/solutions/rechuli-lu-changjia';
const contactPath = '/zh/contact';
const casePath = '/zh/case/anonymous-tsingshan-1250-renovation';
const annealingSolutionLinePath = '/zh/products/detail/annealing-solution-line';
const copperWireAnnealingLinePath = '/zh/products/detail/copper-wire-annealing-line';
const rollerMeshBeltLinePath = '/zh/products/detail/roller-mesh-belt-line';

export const dynamicParams = false;

const heroTags = ['连续退火', '固溶处理', '正火 / 回火', '淬火加热', '托辊网带线', '退洗线退火炉', '铜丝退火线', 'PLC / DCS 控制系统'];

const systemReasons = [
  {
    title: '工艺链连续',
    text: '上料、输送、加热、冷却、清洗、回火和收料等设备必须围绕同一节拍协同。',
  },
  {
    title: '产能节拍决定配置',
    text: '炉膛长度、输送速度、温区数量和冷却能力都需围绕产能目标核算。',
  },
  {
    title: '工件形态决定输送方式',
    text: '网带、托辊、辊底、推杆、带钢、线材等输送方式需按工件形态选择。',
  },
  {
    title: '后段系统影响整体效果',
    text: '冷却、清洗、回火、收放线等后段配置会影响生产线稳定性和工件状态。',
  },
  {
    title: '控制系统影响追溯',
    text: '电气控制、报警联锁、数据记录和接口需求决定生产线运行管理方式。',
  },
  {
    title: '改造项目需看现场',
    text: '旧线升级还要评估原设备状态、停产窗口、现场空间和上下游设备边界。',
  },
];

const lineTypes: TextCard[] = [
  {
    title: '退火固溶生产线',
    text: '适用于不锈钢带材、合金带材、有色金属带材等连续退火、固溶处理场景，重点确认带宽、厚度、卷重、速度、温度、冷却和收放卷系统。',
  },
  {
    title: '不锈钢连续退火 / 退洗线退火炉',
    text: '适用于不锈钢带材连续退火、酸洗配套、固溶段设备和退洗线技改项目，重点关注带材规格、产线节拍、加热冷却边界和自动化接口。',
  },
  {
    title: '托辊网带式热处理生产线',
    text: '适用于标准件、五金件、粉末冶金件、支重轮、机械小件等连续正火、回火、淬火加热、清洗、冷却和回火组合工艺。',
  },
  {
    title: '铜丝自动化退火生产线',
    text: '适用于铜丝、铜线、铜合金丝等线材连续退火、软化退火、光亮退火和去应力处理，重点确认线径、速度、张力控制、收放线和保护气氛。',
  },
  {
    title: '支重轮 / 零部件热处理生产线',
    text: '适用于支重轮、履带件、工程机械零件等加热、淬火、回火、喷淋冷却或自动输送场景，重点确认节拍、单件重量、硬度要求、冷却方式和自动化程度。',
  },
];

const systemComponents = [
  {
    title: '节拍与输送系统',
    text: '围绕上料、输送、炉内停留时间和出料衔接统一设计，避免前后段节拍不匹配。',
  },
  {
    title: '热处理工艺段',
    text: '按退火、固溶、正火、回火、淬火加热等工艺确定温区、保温时间和加热方式。',
  },
  {
    title: '冷却与后处理段',
    text: '根据工艺需要评估淬火、冷却、清洗、干燥、回火或收料等后段系统边界。',
  },
  {
    title: '自动化与追溯系统',
    text: '围绕温度、速度、联锁、报警、记录和数据接口确定控制系统等级。',
  },
  {
    title: '安全与公用工程边界',
    text: '结合燃料、电力、水气接口、气氛安全、排烟和现场空间明确交付范围。',
  },
];

const selectionRows = [
  {
    type: '退火固溶生产线',
    text: '适合不锈钢带材、合金带材、有色金属带材；关注带宽、厚度、卷重、速度、张力、纠偏、冷却和表面质量。',
  },
  {
    type: '托辊网带生产线',
    text: '适合标准件、五金件、粉末冶金件、小型机械件；关注网带宽度、铺料厚度、托辊结构和产能节拍。',
  },
  {
    type: '铜丝自动化退火生产线',
    text: '适合铜丝、铜线、铜合金丝等线材；关注线径、速度、张力控制、保护气氛和表面状态。',
  },
  {
    type: '支重轮 / 零部件热处理生产线',
    text: '适合工程机械件、支重轮、批量机械零件；关注节拍、硬度要求、变形控制和自动化输送。',
  },
];

const customParams = [
  '工件类型',
  '工件材质',
  '工件尺寸',
  '单件重量',
  '每小时产能',
  '热处理工艺',
  '最高温度',
  '保温时间',
  '炉内停留时间',
  '输送方式',
  '输送速度',
  '冷却方式',
  '气氛或表面要求',
  '是否需要清洗 / 冷却 / 回火段',
  '温区数量',
  '控制系统要求',
  '上下料方式',
  '现场空间',
  '交付范围',
];

const experienceCards: ExperienceCard[] = [
  {
    title: '不锈钢退洗线退火炉 / 退火固溶段设备',
    text: '苏能具备不锈钢连续退火、固溶段、退洗线退火炉相关项目经验，可根据带材规格、温度制度、冷却边界和自动化要求进行方案评估。',
    href: casePath,
  },
  {
    title: '托辊网带正火回火生产线',
    text: '苏能具备托辊网带式正火炉、快速冷却装置、回火炉及工控系统组合方案经验，可根据工件节拍、网带宽度、温区和冷却方式评估生产线配置。',
  },
  {
    title: '网带式淬火 / 渗碳气氛热处理生产线',
    text: '苏能具备网带式连续加热、淬火冷却、提升出料、气氛控制和生产线控制系统相关方案经验。涉及渗碳或特殊气氛时，应根据工艺和安全条件单独评估。',
  },
  {
    title: '支重轮热处理生产线',
    text: '苏能具备支重轮加热、自动淬火、回火、冷却及温控系统组合方案经验，可根据支重轮规格、节拍、硬度要求和冷却方式评估产线结构。',
  },
  {
    title: '铜丝自动化退火生产线',
    text: '苏能具备铜丝、铜线类连续退火生产线页面和方案能力，重点围绕线径、运行速度、张力控制、保护气氛和收放线系统进行方案配置。',
  },
];

const faqs = [
  {
    question: 'Q1：连续热处理生产线和单台工业炉有什么区别？',
    answer:
      '单台工业炉通常解决一个加热或热处理环节，连续热处理生产线则需要把上料、输送、加热、冷却、清洗、回火、出料和控制系统串联起来。生产线更关注节拍、产能、工艺链和现场布局，不能只按单台炉报价。',
  },
  {
    question: 'Q2：哪些工件适合做连续热处理生产线？',
    answer:
      '适合产量稳定、规格相对明确、工艺路线固定的工件，例如不锈钢带材、铜丝线材、标准件、五金件、粉末冶金件、支重轮和批量机械零件。是否适合做连续线，需要结合工件尺寸、产能、节拍和工艺要求判断。',
  },
  {
    question: 'Q3：连续热处理生产线报价主要看哪些参数？',
    answer:
      '主要看工件材质、尺寸、单件重量、产能节拍、热处理工艺、最高温度、保温时间、输送方式、冷却方式、气氛要求、温区数量、自动化程度和现场条件。参数越完整，方案和报价越接近真实项目成本。',
  },
  {
    question: 'Q4：退火固溶生产线适合哪些材料？',
    answer:
      '退火固溶生产线多用于不锈钢带材、合金带材、有色金属带材等连续热处理场景。需要确认材料牌号、带宽、厚度、卷重、退火或固溶温度、运行速度、冷却方式和表面质量要求。',
  },
  {
    question: 'Q5：托辊网带热处理生产线适合哪些工件？',
    answer:
      '托辊网带热处理生产线适合标准件、五金件、粉末冶金件、小型机械件和部分批量零件。它通过托辊支撑网带连续运行，适用于正火、回火、淬火加热、清洗、冷却等组合工艺。',
  },
  {
    question: 'Q6：生产线能否做旧线改造或扩产升级？',
    answer:
      '可以根据项目情况评估。旧线改造通常需要检查炉体、炉衬、加热系统、输送系统、控制系统、冷却系统和现场空间。是否适合改造或扩产，需要结合原设备状态、停产窗口和目标产能判断。',
  },
  {
    question: 'Q7：连续热处理生产线能做到固定产能吗？',
    answer:
      '不应脱离项目条件直接承诺固定产能。产能与工件尺寸、装料方式、炉膛长度、运行速度、保温时间、冷却方式、上下料节拍和现场管理有关。正式产能指标应在技术方案和合同中明确。',
  },
  {
    question: 'Q8：生产线是否需要 PLC 或 DCS 控制系统？',
    answer:
      '连续热处理生产线通常需要自动化控制系统，用于温度、速度、动作、联锁、报警和数据记录。具体采用 PLC、DCS 或其他系统，应根据产线复杂度、客户系统接口和数据追溯要求确定。',
  },
  {
    question: 'Q9：生产线项目周期多久？',
    answer:
      '项目周期与生产线长度、设备组成、制造复杂度、外购件周期、现场条件和安装调试范围有关。单条网带线、退火固溶线和大型退洗线的周期差异较大，具体应以技术方案和合同约定为准。',
  },
  {
    question: 'Q10：询价连续热处理生产线前需要准备什么？',
    answer:
      '建议准备工件材质、尺寸、单件重量、产能节拍、热处理工艺、最高温度、冷却方式、输送方式、气氛要求、自动化需求、现场平面条件和交付范围。资料不完整也可以先沟通，由技术人员判断需补充内容。',
  },
];

const faqJsonLd = getFaqJsonLd(faqs);

const relatedLinks: LinkCard[] = [
  {
    title: '工业炉报价需要哪些参数',
    href: quoteParamsPath,
    text: '整理连续生产线询价前需要提供的工件、产能、温度、工艺和现场条件。',
  },
  {
    title: '工业炉节能改造与热处理炉大修服务',
    href: renovationServicePath,
    text: '旧线改造、大修或搬迁复产项目可先查看评估服务页面。',
  },
  {
    title: '热处理炉厂家页面',
    href: manufacturerPath,
    text: '查看苏能作为热处理工业炉厂家的制造能力与交付边界。',
  },
  {
    title: '退火固溶生产线',
    href: annealingSolutionLinePath,
    text: '查看金属带材、卷材连续退火与固溶处理生产线参数。',
  },
  {
    title: '铜丝自动化退火生产线',
    href: copperWireAnnealingLinePath,
    text: '查看铜丝、铜线、铜合金丝连续退火与收放线配置。',
  },
  {
    title: '托辊型网带式电阻炉生产线',
    href: rollerMeshBeltLinePath,
    text: '查看托辊支撑网带、连续退火回火正火设备配置。',
  },
  {
    title: '联系我们',
    href: contactPath,
    text: '提交连续生产线参数，获取初步方案沟通。',
  },
];

const pageJsonLd = cleanObject([
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.jssngyl.cn/zh/solutions/continuous-heat-treatment-line#webpage',
    url: 'https://www.jssngyl.cn/zh/solutions/continuous-heat-treatment-line',
    name: '连续热处理生产线解决方案',
    description: CONTINUOUS_HEAT_TREATMENT_LINE_SEO.description,
    inLanguage: 'zh-CN',
    about: {
      '@id': 'https://www.jssngyl.cn/#organization',
    },
  },
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '连续热处理生产线解决方案', url: pagePath },
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
    title: CONTINUOUS_HEAT_TREATMENT_LINE_SEO.title,
    description: CONTINUOUS_HEAT_TREATMENT_LINE_SEO.description,
    path: pagePath,
    pageKey: 'solutions',
    keywords: CONTINUOUS_HEAT_TREATMENT_LINE_SEO.keywords,
    image: CONTINUOUS_HEAT_TREATMENT_LINE_SEO.ogImage,
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

export default async function ContinuousHeatTreatmentLinePage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return (
    <main className="bg-white text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] text-white">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-36" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,36,0.96)_0%,rgba(12,38,74,0.84)_58%,rgba(12,38,74,0.5)_100%)]" />
        </div>
        <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-20">
          <Breadcrumb
            locale="zh"
            tone="light"
            currentLabel="连续热处理生产线解决方案"
            className="text-[13px]"
            items={[{ label: '解决方案' }]}
          />
          <div className="mt-10 max-w-[980px]">
            <p className="text-[13px] font-semibold text-white/64 lg:text-[14px]">系统级热处理生产线方案</p>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.16] tracking-[0.01em] lg:text-[56px]">
              连续热处理生产线解决方案
            </h1>
            <p className="mt-5 max-w-[920px] text-[18px] font-semibold leading-[1.72] text-white/92 lg:text-[23px]">
              苏能可根据工件材质、工件形态、热处理工艺、产能节拍、温度制度、冷却方式、自动化程度和现场条件，提供连续退火、固溶、正火、回火、淬火加热、清洗、冷却、上下料和控制系统等热处理生产线方案。
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
                href={contactPath}
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
              >
                提交产线参数获取方案
              </a>
              <a
                href="#line-types"
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                查看生产线类型
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section id="why" eyebrow="系统逻辑" title="一、为什么连续热处理生产线不是“多台炉子简单组合”？">
        <p className="max-w-[960px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          连续热处理生产线不仅是加热炉本体，还涉及上料、输送、加热、保温、淬火、冷却、清洗、干燥、回火、收料、电控系统、气氛系统、燃烧系统、余热利用和现场安装调试等多个环节。方案设计需要围绕工艺节拍、产能、温度制度、工件状态和现场布局综合判断。
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {systemReasons.map((item) => (
            <article key={item.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.35] text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="line-types" eyebrow="生产线类型" title="二、苏能可覆盖哪些连续热处理生产线？">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {lineTypes.map((item) => (
            <article key={item.title} className="rounded-[8px] border border-[#e1e7f0] bg-white p-6">
              <h3 className="text-[21px] font-semibold leading-[1.35] text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="systems" eyebrow="系统组成" title="三、连续热处理生产线通常由哪些系统组成？">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {systemComponents.map((item) => (
            <article key={item.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.35] text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="selection" eyebrow="选型对比" title="四、不同生产线怎么选？">
        <div className="grid gap-4 md:hidden">
          {selectionRows.map((row) => (
            <article key={row.type} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5">
              <h3 className="text-[17px] font-semibold leading-[1.45] text-[#101828]">{row.type}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">{row.text}</p>
            </article>
          ))}
        </div>
        <div className="hidden overflow-hidden rounded-[8px] border border-[#dfe6f0] md:block">
          <table className="w-full border-collapse bg-white text-left">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="w-[260px] border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">生产线类型</th>
                <th className="border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">适用判断</th>
              </tr>
            </thead>
            <tbody>
              {selectionRows.map((row) => (
                <tr key={row.type} className="border-b border-[#edf1f6] last:border-b-0">
                  <td className="px-5 py-4 text-[15px] font-semibold leading-[1.8] text-[#253047]">{row.type}</td>
                  <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#475467]">{row.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="params" eyebrow="定制参数" title="五、连续热处理生产线定制需要确认哪些参数？">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
              连续生产线报价需要先明确工件、节拍、工艺链、控制系统和现场边界。资料越完整，越有利于判断炉型组合、温区配置、输送方式和交付范围。
            </p>
            <a
              href={quoteParamsPath}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]"
            >
              查看《工业炉报价需要哪些参数》
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

      <Section id="experience" eyebrow="项目经验" title="六、苏能连续热处理生产线项目经验">
        <div className="grid gap-5 lg:grid-cols-3">
          {experienceCards.map((item) => (
            <article key={item.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{item.text}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-5 inline-flex min-h-[40px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]"
                >
                  查看案例详情
                </a>
              ) : (
                <p className="mt-5 rounded-[8px] border border-[#dfe6f0] bg-white p-4 text-[14px] leading-[1.75] text-[#667085]">
                  暂无公开详情页，可在商务沟通中结合授权资料进一步说明。
                </p>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section id="boundary" eyebrow="交付边界" title="七、项目交付边界说明">
        <p className="rounded-[8px] border border-[#dfe6f0] bg-[#fbfcfe] p-6 text-[16px] leading-[1.95] text-[#344054] lg:text-[18px]">
          苏能通常作为热处理工业炉设备供应商、热处理生产线设备供应商或设备分包方参与项目，可根据合同范围提供设计、制造、供货、安装指导、调试配合和售后支持。若项目涉及土建、压力容器、特种设备、环保总包或工程总承包，应由具备相应资质的单位承担或配合实施。
        </p>
      </Section>

      <Section id="faq" eyebrow="常见问题" title="八、连续热处理生产线常见问题">
        <div className="grid gap-3 md:grid-cols-2 md:items-start md:gap-5" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq) => (
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
              </summary>
              <div className="mt-4 border-t border-[#edf1f6] pt-4" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <div className="text-[15px] leading-[1.9] text-[#344054]" itemProp="text">
                  {faq.answer}
                </div>
              </div>
            </details>
          ))}
        </div>
      </Section>

      <Section id="related" eyebrow="相关页面" title="九、相关页面内链">
        <div className="grid gap-4 md:grid-cols-2">
          {relatedLinks.map((item) => (
            <a key={item.href} href={item.href} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5 transition hover:border-[#c51624]">
              <span className="text-[17px] font-semibold leading-[1.45] text-[#c51624]">{item.title}</span>
              <span className="mt-2 block text-[14px] leading-[1.8] text-[#475467]">{item.text}</span>
            </a>
          ))}
        </div>
      </Section>

      <section id="contact" className="border-t border-[#e2e8f0] bg-[#101828] py-12 text-white lg:py-16">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-[13px] font-semibold text-white/58">获取产线方案</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-[1.28] lg:text-[42px]">
              需要规划连续热处理生产线？
            </h2>
            <p className="mt-5 max-w-[820px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
              把工件材质、尺寸、单件重量、产能节拍、热处理工艺、最高温度、冷却方式、输送方式、自动化要求和现场条件发给苏能，技术人员可先判断适合的产线结构、炉型组合、温区配置和交付边界。
            </p>
            <address className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px] leading-[1.8] text-white/82 not-italic">
              <span>电话 / 微信：+86-130-5298-6814</span>
              <span>邮箱：jssngyl@outlook.com</span>
            </address>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <a
              href={contactPath}
              className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
            >
              提交产线参数获取方案
            </a>
            <a
              href="tel:+8613052986814"
              className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              联系苏能工业炉
            </a>
          </div>
        </div>
      </section>

      <JsonLd id="continuous-heat-treatment-line-page-jsonld" data={pageJsonLd} />
      <JsonLd id="continuous-heat-treatment-line-faq-jsonld" data={faqJsonLd} />
    </main>
  );
}
