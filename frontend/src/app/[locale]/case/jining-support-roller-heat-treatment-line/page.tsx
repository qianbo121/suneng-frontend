import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  AuthorizedProjectCasePage,
  type AuthorizedProjectCasePageData,
} from '@/components/case-studies/AuthorizedProjectCasePage';
import { getArticleJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { JINING_SUPPORT_ROLLER_CASE_SEO } from '@/lib/seo/page-data';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const slug = 'jining-support-roller-heat-treatment-line';
const pagePath = `/zh/case/${slug}`;
const heroImage = JINING_SUPPORT_ROLLER_CASE_SEO.ogImage;
const continuousLinePath = '/zh/solutions/continuous-heat-treatment-line';
const manufacturerPath = '/zh/solutions/rechuli-lu-changjia';
const quoteParamsPath = '/zh/articles/gongye-lu-baojia-canshu';

export const dynamicParams = false;

const faqs = [
  {
    question: '这个案例适合什么行业和工件？',
    answer:
      '该案例适合工程机械零部件行业，尤其是支重轮、托轮、履带底盘零部件等需要连续加热、淬火、回火和冷却联动的重载工件。其他工件是否适用，需要结合材质、尺寸、重量、热处理工艺和节拍要求单独判断。',
  },
  {
    question: '支重轮热处理生产线通常由哪些设备组成？',
    answer:
      '通常包括连续加热炉、自动淬火机床、回火炉、喷淋冷却系统、输送系统和电气控制系统。具体配置取决于工件规格、淬火方式、回火要求、上下料方式和现场空间。',
  },
  {
    question: '这类项目报价前需要提供哪些参数？',
    answer:
      '建议提供支重轮型号范围、材质、外形尺寸、单件重量、每小时或每班产能、加热温度、淬火方式、回火要求、冷却介质、现场布置和上下料方式。已有工艺曲线、图纸或照片也应一并提交。',
  },
  {
    question: '支重轮连续热处理的主要技术难点是什么？',
    answer:
      '主要难点包括多规格工件适配、加热与淬火节拍衔接、工件旋转定位、喷水分区控制、回火段连续衔接以及全线自动控制。实际难度还与工件材料和验收要求有关。',
  },
  {
    question: '苏能在这类项目中可以提供什么？',
    answer:
      '苏能可提供支重轮热处理生产线方案设计、连续加热炉、自动淬火机床、回火炉、喷淋冷却系统、电气控制系统和安装调试配合。具体供货边界以项目技术方案和合同约定为准。',
  },
];

const pageData = {
  breadcrumbLabel: '济宁支重轮热处理生产线案例',
  eyebrow: 'Authorized Project Case · Jining',
  title: '济宁市五创机械有限公司支重轮热处理生产线项目经验',
  subtitle: '连续加热、自动淬火、回火与喷淋冷却协同，而不是单台加热炉的简单组合',
  heroImage,
  heroImageAlt: '工程机械零部件连续热处理生产线参考设备',
  heroImageNote: '参考设备图，非客户现场照片',
  heroTags: ['山东济宁项目', '工程机械零部件', '支重轮', '连续加热', '自动淬火', '回火冷却'],
  facts: [
    ['客户', '济宁市五创机械有限公司'],
    ['项目地域', '山东省济宁市'],
    ['项目类型', '多规格工程机械支重轮连续热处理生产线'],
    ['公开等级', '客户授权公开合作信息'],
  ],
  disclosure:
    '本案例已获得客户授权公开合作信息。页面不公开联系人、报价、合同条款、完整图纸、控制图、供应商清单和 PLC 程序；设备参数与处理能力需按具体项目重新确认。',
  background:
    '支重轮是工程机械底盘系统中的关键零部件，常见于挖掘机、履带式工程机械和重载行走机构。与普通单炉热处理相比，这类工件更关注连续输送、自动淬火、回火衔接和多规格适配。',
  demand:
    '项目需要建设适用于多规格工程机械支重轮的连续热处理生产线，完成连续加热、自动淬火、回火和喷淋冷却，并协调尺寸差异、装料节拍、旋转淬火、喷水分区和后续回火稳定性。',
  challenges: [
    {
      title: '多规格工件适配',
      text: '支重轮尺寸、壁厚和单件重量存在差异，装料、输送、定位与淬火动作不能按单一规格固定套用。',
    },
    {
      title: '加热与淬火节拍衔接',
      text: '连续加热炉的出料节拍需要与淬火机床定位、旋转、喷水和转运时间匹配，避免工件等待或工艺波动。',
    },
    {
      title: '旋转与喷水分区控制',
      text: '淬火阶段需要协调工件旋转、喷水位置、冷却时间与区域控制，具体方案取决于工件结构和淬火要求。',
    },
    {
      title: '全线联动与安全控制',
      text: '加热、淬火、回火、冷却和输送需要统一联锁、报警和节拍管理，不能只优化某一台设备。',
    },
  ],
  equipment: [
    '辊子式连续加热炉',
    '自动淬火机床与工件旋转定位机构',
    '回火炉及前后段输送装置',
    '喷淋冷却与分区供水系统',
    '电气控制、联锁、报警和运行记录系统',
  ],
  solution: [
    '围绕支重轮连续热处理工艺进行生产线方案设计。',
    '协调连续加热炉与自动淬火机床的节拍和转运边界。',
    '按工件规格与淬火要求评估旋转、喷水分区和冷却方式。',
    '配置回火段、喷淋冷却和全线电气控制系统。',
    '根据合同范围提供制造、安装调试与现场配合。',
  ],
  experience:
    '该项目体现的是工程机械零部件连续热处理系统的集成经验。对于支重轮、托轮、链轨节等重载零部件，方案不能只看加热功率或炉膛尺寸，还需要把工件规格、进出料方式、淬火方式、回火节拍、自动化程度和现场布置放在同一条工艺链中评估。',
  reusableValues: [
    '连续加热、自动淬火、回火和冷却的节拍协同方法。',
    '多规格重载工件的输送、定位和旋转淬火评估思路。',
    '加热设备、淬火机床、喷淋系统与控制系统的接口划分。',
    '支重轮或相似工程机械零部件询价前的参数准备清单。',
  ],
  faqs,
  relatedLinks: [
    {
      title: '连续热处理生产线方案',
      href: continuousLinePath,
      text: '查看连续加热、冷却、输送和控制系统如何围绕产能节拍协同。',
    },
    {
      title: '热处理炉厂家能力',
      href: manufacturerPath,
      text: '了解苏能的制造基地、炉型范围、非标设计能力和交付边界。',
    },
    {
      title: '工业炉报价参数',
      href: quoteParamsPath,
      text: '整理工件、材质、温度、产能、工艺和现场条件后再评估方案。',
    },
  ],
  contactTitle: '需要评估支重轮或工程机械零部件热处理线？',
  contactDescription:
    '请提供工件图纸或尺寸、材质、单件重量、产能节拍、热处理工艺、淬火要求和现场条件，技术人员可先判断生产线组合方向与需补充的参数。',
  contactSecondaryHref: continuousLinePath,
  contactSecondaryLabel: '查看连续生产线方案',
  jsonLdId: 'jining-support-roller-case-jsonld',
  jsonLd: [
    getArticleJsonLd({
      slug,
      path: pagePath,
      headline: '济宁市五创机械有限公司支重轮热处理生产线项目经验',
      description: JINING_SUPPORT_ROLLER_CASE_SEO.description,
      image: heroImage,
      datePublished: JINING_SUPPORT_ROLLER_CASE_SEO.publishedTime,
      dateModified: JINING_SUPPORT_ROLLER_CASE_SEO.modifiedTime,
    }),
    getBreadcrumbJsonLd([
      { name: '首页', url: '/zh' },
      { name: '连续热处理生产线', url: continuousLinePath },
      { name: '济宁支重轮热处理生产线案例', url: pagePath },
    ]),
    getFaqJsonLd(faqs),
  ],
} satisfies AuthorizedProjectCasePageData;

export function generateStaticParams() {
  return [{ locale: 'zh' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return buildMetadata({
    title: JINING_SUPPORT_ROLLER_CASE_SEO.title,
    description: JINING_SUPPORT_ROLLER_CASE_SEO.description,
    path: pagePath,
    pageKey: 'case',
    keywords: JINING_SUPPORT_ROLLER_CASE_SEO.keywords,
    image: heroImage,
    type: 'article',
    publishedTime: JINING_SUPPORT_ROLLER_CASE_SEO.publishedTime,
    modifiedTime: JINING_SUPPORT_ROLLER_CASE_SEO.modifiedTime,
    alternateLocales: {
      'zh-CN': pagePath,
      'x-default': pagePath,
    },
  });
}

export default async function JiningSupportRollerCasePage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return <AuthorizedProjectCasePage data={pageData} />;
}
