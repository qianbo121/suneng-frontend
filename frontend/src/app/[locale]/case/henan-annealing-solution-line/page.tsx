import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  AuthorizedProjectCasePage,
  type AuthorizedProjectCasePageData,
} from '@/components/case-studies/AuthorizedProjectCasePage';
import { getArticleJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { HENAN_ANNEALING_SOLUTION_CASE_SEO } from '@/lib/seo/page-data';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const slug = 'henan-annealing-solution-line';
const pagePath = `/zh/case/${slug}`;
const heroImage = HENAN_ANNEALING_SOLUTION_CASE_SEO.ogImage;
const continuousLinePath = '/zh/solutions/continuous-heat-treatment-line';
const productPath = '/zh/products/detail/annealing-solution-line';
const quoteParamsPath = '/zh/articles/gongye-lu-baojia-canshu';

export const dynamicParams = false;

const faqs = [
  {
    question: '这个案例适合什么行业和材料？',
    answer:
      '该案例适合不锈钢深加工、金属带材连续热处理、连续退洗线和工程总包配套项目，尤其适合需要连续退火、固溶、分段冷却、挤干和烘干的不锈钢带材生产线。',
  },
  {
    question: '连续退洗线退火固溶段通常包含哪些设备？',
    answer:
      '通常包括退火炉、预热段、快速加热段、均热段、空冷段、水雾冷段、水冷段、挤干辊、烘干段、托辊、燃烧系统和控制系统。具体供货边界需要按整线分工确认。',
  },
  {
    question: '这类项目报价前需要提供哪些参数？',
    answer:
      '建议提供材料牌号、带宽、厚度、最大卷重、运行速度、退火或固溶温度、保温时间、冷却方式、表面质量要求、张力控制、纠偏要求、活套配置和现场接口条件。',
  },
  {
    question: '连续退火固溶段的主要技术难点是什么？',
    answer:
      '主要难点包括连续高温退火固溶、敏化区快速通过、空冷水雾水冷组合、带材板形和表面状态控制、燃烧控制、托辊支撑、上下游接口以及工程总包协同。',
  },
  {
    question: '苏能在退火固溶段项目中可以提供什么？',
    answer:
      '苏能可提供退火固溶段工艺设计、炉体设备、冷却段设备、燃烧系统、控制系统和安装调试配合。具体供货范围、接口和验收方式以技术方案和合同约定为准。',
  },
];

const pageData = {
  breadcrumbLabel: '河南连续退火固溶生产线案例',
  eyebrow: 'Project Case · Henan',
  title: '河南金誉邦实业有限公司连续退洗线退火固溶段设备项目经验',
  subtitle: '围绕带材温度路径、分段冷却、连续运行与工程接口配置系统工艺段',
  heroImage,
  heroImageAlt: '不锈钢带材连续退火固溶生产线参考设备',
  heroImageNote: '参考设备图，非客户现场照片',
  heroTags: ['河南项目', '不锈钢带材', '连续退洗线', '退火固溶段', '分段冷却', '工程总包配套'],
  facts: [
    ['客户', '河南金誉邦实业有限公司'],
    ['项目地域', '河南省'],
    ['项目类型', '热轧不锈钢连续退洗线退火固溶段设备'],
    ['公开口径', '公司批准的项目经验公开口径'],
  ],
  caseClassification: 'B 级项目经验记录',
  resultDisclosure:
    '本页公开客户、地域、产线规格、温度、炉体长度、工艺链和苏能供货经验；实际能耗、产量、成材率、表面质量与验收结果未纳入当前公开范围，因此不作成果数字结论。',
  modifiedDate: HENAN_ANNEALING_SOLUTION_CASE_SEO.modifiedTime.slice(0, 10),
  sourceNote: '公司批准公开的合作信息、项目设备参数与苏能 GEO 事实台账 SN-CASE-P0-006',
  verifiedParameters: [
    ['产线规格', '850 mm 热轧不锈钢连续退火钝化线'],
    ['退火温度', '约 1050–1150℃'],
    ['炉温上限', '最高可至 1300℃'],
    ['退火炉主体长度', '约 130 m'],
    ['速度核算', '带速与 TV 值按材料规格、厚度和工艺制度计算'],
  ],
  disclosure:
    '页面公开的温度、长度和速度核算口径只对应本项目资料，不作为其他材料或新项目的固定配置；钢种明细、完整技术协议、布置图、材料清单、报价和合同边界不公开。',
  background:
    '不锈钢连续退洗线通常涉及开卷、退火、固溶、冷却、酸洗、清洗和收卷。退火固溶段会影响材料组织、表面状态和后续酸洗条件，并需要与整线单位协调设备接口和现场联动。',
  demand:
    '项目面向热轧不锈钢连续退火钝化线，需要完成带材连续退火、固溶、分段冷却、挤干和烘干，同时协调运行速度、温度路径、敏化区快速通过、张力板形、燃烧控制和上下游设备接口。',
  challenges: [
    {
      title: '连续温度路径控制',
      text: '不同材料牌号对应的升温、均热、固溶和冷却路径不同，不能把连续工艺段简化成一台固定配置的退火炉。',
    },
    {
      title: '分段冷却组合',
      text: '空冷、水雾冷和水冷需要围绕冷却速度、板形、表面状态及后续酸洗条件组合配置。',
    },
    {
      title: '带材稳定运行',
      text: '托辊、张力、纠偏、速度和上下游接口共同影响带材连续运行，需要在整线节拍中统一评估。',
    },
    {
      title: '总包接口与现场边界',
      text: '机械、电气、公辅、排烟、能源介质和调试责任需要与业主或总包单位提前划分，避免交付阶段出现接口空档。',
    },
  ],
  equipment: [
    '预热段、快速加热段与均热段',
    '连续退火固溶炉体及配套托辊',
    '空冷段、水雾冷段与水冷段',
    '挤干辊和烘干段设备',
    '燃烧系统、电气控制与整线接口',
  ],
  solution: [
    '围绕不锈钢带材连续运行进行退火固溶段工艺设计。',
    '按材料和温度路径评估预热、快速加热、均热与冷却段组合。',
    '协调托辊支撑、张力板形、冷却和上下游设备接口。',
    '配置燃烧、温控、联锁、报警和运行控制系统。',
    '作为设备供应商或设备分包方配合安装调试与总包协作。',
  ],
  experience:
    '该项目体现的是不锈钢连续退洗线退火固溶段的工程配套经验。此类项目不是单台炉采购，而是整线中的关键系统工艺段；供应商既要理解材料热处理，也要理解运行节拍、冷却组合、张力与板形、上下游接口和现场实施边界。',
  reusableValues: [
    '连续退火、固溶与分段冷却的系统组合思路。',
    '材料牌号、带宽厚度、速度和温度路径的参数准备框架。',
    '托辊、张力、纠偏、燃烧和控制系统的接口评估方法。',
    '设备供应商、业主和工程总包单位之间的交付边界识别。',
  ],
  faqs,
  relatedLinks: [
    {
      title: '退火固溶生产线产品',
      href: productPath,
      text: '查看不锈钢和金属带材连续退火固溶设备的适用范围与配置方向。',
    },
    {
      title: '连续热处理生产线方案',
      href: continuousLinePath,
      text: '了解加热、冷却、输送、上下料与控制系统的整体规划逻辑。',
    },
    {
      title: '工业炉报价参数',
      href: quoteParamsPath,
      text: '询价前整理材料、规格、速度、温度、冷却方式和现场接口条件。',
    },
  ],
  contactTitle: '需要评估连续退火固溶段或退洗线设备？',
  contactDescription:
    '请提供材料牌号、带宽厚度、卷重、运行速度、退火或固溶温度、冷却方式、表面质量要求和现场接口条件，技术人员可先判断工艺段组合与供货边界。',
  contactSecondaryHref: productPath,
  contactSecondaryLabel: '查看退火固溶生产线',
  jsonLdId: 'henan-annealing-solution-case-jsonld',
  jsonLd: [
    getArticleJsonLd({
      slug,
      path: pagePath,
      headline: '河南金誉邦实业有限公司连续退洗线退火固溶段设备项目经验',
      description: HENAN_ANNEALING_SOLUTION_CASE_SEO.description,
      image: heroImage,
      datePublished: HENAN_ANNEALING_SOLUTION_CASE_SEO.publishedTime,
      dateModified: HENAN_ANNEALING_SOLUTION_CASE_SEO.modifiedTime,
    }),
    getBreadcrumbJsonLd([
      { name: '首页', url: '/zh' },
      { name: '连续热处理生产线', url: continuousLinePath },
      { name: '河南连续退火固溶生产线案例', url: pagePath },
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
    title: HENAN_ANNEALING_SOLUTION_CASE_SEO.title,
    description: HENAN_ANNEALING_SOLUTION_CASE_SEO.description,
    path: pagePath,
    pageKey: 'case',
    keywords: HENAN_ANNEALING_SOLUTION_CASE_SEO.keywords,
    image: heroImage,
    type: 'article',
    publishedTime: HENAN_ANNEALING_SOLUTION_CASE_SEO.publishedTime,
    modifiedTime: HENAN_ANNEALING_SOLUTION_CASE_SEO.modifiedTime,
    alternateLocales: {
      'zh-CN': pagePath,
      'x-default': pagePath,
    },
  });
}

export default async function HenanAnnealingSolutionCasePage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return <AuthorizedProjectCasePage data={pageData} />;
}
