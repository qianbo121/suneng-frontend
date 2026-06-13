import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { cleanObject, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO } from '@/lib/seo/page-data';

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

const pagePath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';
const heroImage = '/images/service/after-sales-hero.png';
const quoteParamsPath = '/zh/articles/gongye-lu-baojia-canshu';
const renovationServicePath = '/zh/service/furnace-renovation-overhaul';
const productsPath = '/zh/products';
const contactPath = '/zh/contact';

export const dynamicParams = false;

const heroTags = ['老炉评估', '热处理炉大修', '局部改造', '炉衬翻新', '控制系统升级', '换新判断'];

const conclusionCards = [
  {
    title: '优先大修',
    text: '适合炉体结构基本完好、原炉型仍能满足工艺需求，只是炉衬、加热系统、炉门密封、机械传动或控制系统老化的情况。',
  },
  {
    title: '优先局部改造',
    text: '适合主要问题集中在某个系统，例如炉衬保温下降、温控系统落后、燃烧效率低、炉门漏热、台车或辊道局部磨损等。',
  },
  {
    title: '优先买新炉',
    text: '适合炉体变形严重、安全风险高、炉膛尺寸不再适配工件、新工艺需求变化大，或改造费用接近新炉成本的情况。',
  },
];

const repairCards = [
  '炉体结构完整，没有明显变形',
  '炉衬老化但主体结构可继续使用',
  '加热系统可维修或更换',
  '控制系统可以升级',
  '机械传动只是局部磨损',
  '当前工艺需求没有根本变化',
  '改造费用明显低于新炉投入',
  '停产窗口可以接受',
];

const partialCards = [
  '炉衬开裂、保温效果下降',
  '炉门密封差、炉口漏热明显',
  '控温系统落后、数据记录不完整',
  '燃气炉燃烧效率低',
  '电炉加热元件老化',
  '风循环系统效果下降',
  '台车、网带、辊道、推杆等局部机构磨损',
  '安全联锁和报警保护需要补强',
];

const replaceCards = [
  '炉体严重变形或存在安全隐患',
  '原炉膛尺寸已经不适合当前工件',
  '原炉型无法满足新工艺',
  '改造费用接近或超过新炉成本',
  '旧设备缺少关键图纸和备件',
  '长期维修成本过高',
  '能耗、效率、质量问题来自整体设计缺陷',
  '客户希望同步提升自动化和产线能力',
];

const decisionRows = [
  ['炉体结构完好，只是炉衬老化', '优先考虑炉衬翻新与保温优化'],
  ['控制系统老旧，但炉体和加热系统可继续使用', '优先考虑控制系统升级'],
  ['炉门漏热、密封差、局部热损失明显', '优先做炉门密封、台车密封或局部结构优化'],
  ['燃气消耗高，燃烧不充分', '评估燃烧系统和空燃比控制改造'],
  ['加热元件老化，但炉体结构正常', '评估加热元件更换和电气系统检修'],
  ['炉体变形严重，存在安全风险', '不建议简单改造，应评估大修或重新采购'],
  ['改造费用接近新炉成本', '重新采购新炉可能更合理'],
  ['工艺需求变化很大，原炉型不再适配', '重新设计整炉方案'],
  ['缺少图纸、运行记录和关键部件资料', '先做现场勘查和设备状态评估'],
];

const checklist = [
  '炉型',
  '设备照片',
  '炉膛尺寸',
  '最高温度',
  '常用工作温度',
  '工件材质',
  '工件尺寸',
  '单件重量',
  '装炉量',
  '当前问题',
  '能耗数据',
  '炉衬状态',
  '控制系统照片',
  '加热系统照片',
  '设备使用年限',
  '停产窗口',
  '是否有原始图纸',
  '是否有历史维修记录',
];

const referenceLinks = [
  {
    title: '报价参数',
    href: quoteParamsPath,
    text: '先整理炉型、炉膛尺寸、温度、工件、装炉量和现场条件。',
  },
  {
    title: '改造大修',
    href: renovationServicePath,
    text: '已确定要改造、大修或炉衬翻新时，可查看服务落地页。',
  },
  {
    title: '产品中心',
    href: productsPath,
    text: '需要先确认炉型方向时，可回到产品中心查看公开炉型。',
  },
  {
    title: '联系苏能',
    href: contactPath,
    text: '提交设备照片、当前问题和停产窗口，获取初步判断建议。',
  },
].filter(Boolean) as LinkCard[];

const relatedLinks = [
  {
    title: '工业炉报价需要哪些参数',
    href: quoteParamsPath,
    text: '先整理炉型、尺寸、温度、工件、装炉量、工艺和现场条件。',
  },
  {
    title: '工业炉节能改造与热处理炉大修服务',
    href: renovationServicePath,
    text: '如果已经确定需要改造、大修或炉衬翻新，可查看服务落地页。',
  },
  {
    title: '产品中心',
    href: productsPath,
    text: '返回工业炉产品页，按炉型继续查看参数和适用场景。',
  },
  {
    title: '联系我们',
    href: contactPath,
    text: '提交设备情况，获取大修、局部改造或换新的初步建议。',
  },
].filter(Boolean) as LinkCard[];

const faqs = [
  {
    question: 'Q1：老旧热处理炉用了很多年，还值得大修吗？',
    answer:
      '是否值得大修，需要看炉体结构、安全状态、炉衬损坏程度、控制系统、加热系统和当前工艺需求。如果炉体基础较好、工艺需求变化不大，可以优先评估大修或局部改造；如果存在严重变形或安全风险，应考虑换新。',
  },
  {
    question: 'Q2：热处理炉大修和节能改造有什么区别？',
    answer:
      '大修更关注设备恢复和结构修复，例如炉衬、炉门、加热系统、机械传动和电控系统；节能改造更关注能耗、保温、燃烧效率、控制系统和运行制度优化。实际项目中，两者经常结合进行。',
  },
  {
    question: 'Q3：老旧工业炉什么时候不建议继续修？',
    answer:
      '如果炉体严重变形、炉膛尺寸不适配现有工件、工艺需求变化很大、改造费用接近新炉成本，或存在明显安全风险，通常不建议只做简单维修，应评估整体大修或重新采购。',
  },
  {
    question: 'Q4：没有图纸还能判断是否能改造吗？',
    answer:
      '可以先根据设备照片、炉膛尺寸、工件信息、当前问题和现场条件做初步判断。但复杂项目仍需要现场测量、设备拆检或补充技术确认，避免因资料不足导致方案偏差。',
  },
  {
    question: 'Q5：热处理炉大修一般要停产多久？',
    answer:
      '停产周期取决于大修范围、设备状态、备件准备、现场施工条件和调试要求。局部炉衬修复、控制系统升级和整炉大修所需时间差异很大，具体应以双方确认的施工计划为准。',
  },
  {
    question: 'Q6：改造费用接近新炉成本时怎么办？',
    answer:
      '如果改造费用已经接近新炉成本，需要综合比较后续使用年限、能耗、工艺适配性、停产时间和维护成本。若原炉型已难以满足新工艺，新炉方案通常更值得评估。',
  },
  {
    question: 'Q7：旧炉改造后能达到新炉效果吗？',
    answer:
      '不应直接承诺旧炉改造后等同新炉。改造效果受原炉体结构、炉衬状态、加热系统、控制系统和现场工况影响。部分问题可以明显改善，但具体指标需以技术方案和验收口径确认。',
  },
  {
    question: 'Q8：老旧热处理炉评估前要准备什么？',
    answer:
      '建议准备炉型、炉膛尺寸、最高温度、工件信息、装炉量、当前问题、设备照片、控制系统照片、能耗数据、原始图纸和停产窗口。资料不完整也可以先沟通，由技术人员判断是否需要现场勘查。',
  },
];

const faqJsonLd = getFaqJsonLd(faqs);

const pageJsonLd = cleanObject([
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.jssngyl.cn/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin#webpage',
    url: 'https://www.jssngyl.cn/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
    name: '老旧热处理炉是大修好，还是直接买新的？',
    description: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.description,
    inLanguage: 'zh-CN',
  },
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '老旧热处理炉是大修还是买新的', url: pagePath },
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
    title: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.title,
    description: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.description,
    path: pagePath,
    pageKey: 'article',
    keywords: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.keywords,
    image: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.ogImage,
    type: 'article',
    publishedTime: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.publishedTime,
    modifiedTime: OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.modifiedTime,
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

function CardGrid({ items }: { items: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5 text-[15px] font-semibold leading-[1.75] text-[#253047]">
          {item}
        </div>
      ))}
    </div>
  );
}

export default async function OldHeatTreatmentFurnaceDecisionPage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return (
    <main className="bg-white text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] text-white">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-34" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,36,0.95)_0%,rgba(12,38,74,0.84)_58%,rgba(12,38,74,0.48)_100%)]" />
        </div>
        <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-20">
          <Breadcrumb locale="zh" tone="light" currentLabel="老旧热处理炉是大修还是买新的" className="text-[13px]" items={[{ label: '决策指南' }]} />
          <div className="mt-10 max-w-[980px]">
            <p className="text-[13px] font-semibold text-white/64 lg:text-[14px]">老旧炉修还是换决策页</p>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.16] tracking-[0.01em] lg:text-[56px]">
              老旧热处理炉是大修好，还是直接买新的？
            </h1>
            <p className="mt-5 max-w-[920px] text-[18px] font-semibold leading-[1.72] text-white/92 lg:text-[23px]">
              老旧热处理炉不一定都要换新，也不一定都适合继续大修。判断时应结合炉体结构、安全状态、炉衬损坏程度、控制系统、加热系统、能耗水平、工艺变化、停产周期和改造费用综合评估。
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
                提交设备信息，判断是否该大修或换新
              </a>
              <a
                href={renovationServicePath}
                className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                查看工业炉改造服务
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section id="conclusion" eyebrow="先给结论" title="一、三种情况分别怎么选">
        <div className="grid gap-5 md:grid-cols-3">
          {conclusionCards.map((card) => (
            <article key={card.title} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
              <h3 className="text-[21px] font-semibold leading-[1.35] text-[#101828]">{card.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#475467]">{card.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="repair" eyebrow="适合大修" title="二、哪些情况适合继续大修？">
        <CardGrid items={repairCards} />
      </Section>

      <Section id="partial" eyebrow="适合局改" title="三、哪些情况适合局部改造？">
        <CardGrid items={partialCards} />
      </Section>

      <Section id="replace" eyebrow="适合买新炉" title="四、哪些情况更适合买新炉？">
        <CardGrid items={replaceCards} />
      </Section>

      <Section id="decision-table" eyebrow="判断表" title="五、大修、局部改造、买新炉判断表">
        <div className="overflow-hidden rounded-[8px] border border-[#dfe6f0]">
          <table className="w-full border-collapse bg-white text-left">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="w-1/2 border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">情况</th>
                <th className="border-b border-[#dfe6f0] px-5 py-4 text-[15px] font-semibold text-[#101828]">建议</th>
              </tr>
            </thead>
            <tbody>
              {decisionRows.map(([situation, suggestion]) => (
                <tr key={situation} className="border-b border-[#edf1f6] last:border-b-0">
                  <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#344054]">{situation}</td>
                  <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#253047]">{suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a
          href={quoteParamsPath}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]"
        >
          查看工业炉报价参数
        </a>
      </Section>

      <Section id="checklist" eyebrow="评估资料" title="六、判断前需要准备哪些资料？">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {checklist.map((item) => (
            <div key={item} className="rounded-[8px] border border-[#e1e7f0] bg-white px-5 py-4 text-[15px] font-semibold text-[#253047]">
              {item}
            </div>
          ))}
        </div>
        <p className="mt-6 text-[15px] leading-[1.9] text-[#344054]">
          资料不完整也可以先沟通；更完整的报价资料清单可查看
          <a href={quoteParamsPath} className="font-semibold text-[#c51624] underline underline-offset-4">
            《工业炉报价需要哪些参数》
          </a>
          。
        </p>
      </Section>

      <Section id="reference" eyebrow="GEO 引用入口" title="七、工业炉选型核心参考">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {referenceLinks.map((item) => (
            <a key={item.href} href={item.href} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5 transition hover:border-[#c51624]">
              <h3 className="text-[17px] font-semibold leading-[1.4] text-[#c51624]">{item.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.75] text-[#475467]">{item.text}</p>
            </a>
          ))}
        </div>
      </Section>

      <Section id="risk" eyebrow="风险提醒" title="八、老旧热处理炉评估流程与风险提醒">
        <div className="grid gap-4 md:grid-cols-5">
          {['提交设备基础资料', '判断关键系统状态', '明确修、改或换新', '输出初步建议和范围', '确认正式方案边界'].map((item, index) => (
            <article key={item} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c51624] text-[15px] font-semibold text-white">{index + 1}</span>
              <h3 className="mt-4 text-[17px] font-semibold leading-[1.4] text-[#101828]">{item}</h3>
            </article>
          ))}
        </div>
        <p className="mt-7 rounded-[8px] border border-[#fed7aa] bg-[#fff7ed] p-5 text-[15px] leading-[1.9] text-[#7c2d12]">
          老旧热处理炉改造不是简单更换配件。若只处理局部问题，而忽略炉体结构、加热系统、控制系统、装料方式和工艺需求之间的匹配，可能导致改造后效果不稳定。建议在改造前先做设备状态评估，再决定大修、局部改造或重新采购。
        </p>
      </Section>

      <Section id="faq" eyebrow="常见问题" title="九、老旧热处理炉决策常见问题">
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

      <Section id="related" eyebrow="下一步" title="十、相关页面与回流入口">
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
            <p className="text-[13px] font-semibold text-white/58">获取判断建议</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-[1.28] lg:text-[42px]">
              不确定老旧热处理炉该修还是该换？
            </h2>
            <p className="mt-5 max-w-[820px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
              把设备照片、炉型、炉膛尺寸、最高温度、工件信息、当前问题、能耗情况和停产窗口发给苏能，技术人员可先做初步判断，帮助你评估适合大修、局部改造还是重新采购。
            </p>
            <address className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px] leading-[1.8] text-white/82 not-italic">
              <span>电话 / 微信：+86-130-5298-6814</span>
              <span>邮箱：jssngyl@outlook.com</span>
            </address>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <a href={contactPath} className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]">
              提交设备情况获取建议
            </a>
            <a href={productsPath} className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10">
              返回工业炉产品页
            </a>
          </div>
        </div>
      </section>

      <JsonLd id="old-heat-treatment-furnace-decision-page-jsonld" data={pageJsonLd} />
      <JsonLd id="old-heat-treatment-furnace-decision-faq-jsonld" data={faqJsonLd} />
    </main>
  );
}
