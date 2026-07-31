import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GeoAuthorityGuidePage } from '@/components/geo-pages/GeoAuthorityGuidePage';
import { JsonLd } from '@/components/JsonLd';
import {
  getArticleJsonLd,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getOrganizationJsonLd,
} from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { FURNACE_LINING_RENOVATION_GUIDE_SEO as seo } from '@/lib/seo/page-data';

type PageProps = { params: Promise<{ locale: string }> };

const pagePath = '/zh/solutions/rechuli-lu-luchen-fanxin';
const servicePath = '/zh/service/furnace-renovation-overhaul';
const quotePath = '/zh/articles/gongye-lu-baojia-canshu';
const decisionPath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';

const factAudit = {
  references: ['Q01', 'Q02', 'Q03', 'Q06'] as const,
  publicSource: '公司批准公开的炉衬诊断方法、项目技术方案、材料与验收边界。',
};
void factAudit.references;

const organizationJsonLd = {
  ...getOrganizationJsonLd('zh'),
  '@type': 'Organization',
};

const faqs = [
  {
    question: '炉衬坏了一小块，是否只补这一块？',
    answer:
      '不一定。除损坏面积外，还要检查冷面、锚固、失效原因和新旧衬接缝；发现下沉、异常升温或贯通裂缝时应扩大拆检。',
  },
  {
    question: '纤维模块压缩量越大越好吗？',
    answer:
      '不能脱离材料和结构判断。方案中的压缩要求用于补偿高温收缩并维持接缝，但计算基准、安装方向和适用范围应由产品资料与施工设计共同确认。',
  },
  {
    question: '炉衬翻新后能承诺节能多少吗？',
    answer:
      '没有同环境、同负载、同工艺和完整统计周期的前后数据，不能给通用比例。应分别记录外壁温度、升温时间、保温功率或燃料消耗及密封状态。',
  },
];

const jsonLd = [
  getArticleJsonLd({
    slug: 'rechuli-lu-luchen-fanxin',
    path: pagePath,
    headline: seo.title,
    description: seo.description,
    image: seo.ogImage,
    datePublished: seo.publishedTime,
    dateModified: seo.modifiedTime,
    reviewerName: '王工',
  }),
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '工业炉改造服务', url: servicePath },
    { name: '炉衬翻新与保温', url: pagePath },
  ]),
  organizationJsonLd,
  getFaqJsonLd(faqs),
];

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ locale: 'zh' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if ((await params).locale !== 'zh') notFound();
  return buildMetadata({
    locale: 'zh',
    path: pagePath,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    image: seo.ogImage,
    type: 'article',
    publishedTime: seo.publishedTime,
    modifiedTime: seo.modifiedTime,
  });
}

export default async function FurnaceLiningRenovationPage({ params }: PageProps) {
  if ((await params).locale !== 'zh') notFound();

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeoAuthorityGuidePage
        eyebrow="Industrial furnace lining renovation"
        breadcrumbLabel="炉衬翻新与保温"
        title="热处理炉炉衬翻新方案：旧衬诊断、耐材选型与验收"
        intro="从热面损坏、冷面钢板、锚固体系和密封接口入手，判断局部修复、扩大拆检还是整体处理，并把烘炉与外壁温升写成可核对的验收条件。"
        tags={['热面损坏范围', '冷面钢板状态', '锚固体系连续性', '失效原因', '密封与穿墙接口', '新旧工况变化']}
        asideLabel="停炉检查前先准备"
        asideTitle="6 组判断资料"
        asideItems={['炉型、温度与运行气氛', '损坏位置和范围照片', '冷面温度与异常记录', '炉衬及锚固结构图', '超温、进水和维修历史', '计划变更的生产工况']}
        directTitle="先判断支撑体系，不只看热面坏了多少"
        directIntro="炉龄和损坏面积都不能单独决定翻新范围。真正影响决策的是冷面状态、锚固连续性、失效原因、新旧衬接缝条件，以及工况是否发生变化。"
        directAnswer="损坏不连片、未贯穿冷面、损坏区外锚固完好、失效原因为局部且新旧衬可以可靠衔接时，可考虑局部修复；出现炉顶下沉、冷面异常升温、贯通裂缝等信号时，应扩大拆检，最终范围以停炉检查为准。"
        directChecks={['热面损坏范围', '冷面钢板状态', '锚固体系连续性', '失效原因', '密封与穿墙接口', '新旧工况变化']}
        signalsTitle="出现这些信号，应扩大检查"
        signalsIntro="信号本身不是脱离现场条件的通用否决项，但说明继续只补热面存在遗漏冷面和锚固风险的可能。"
        signals={[
          { label: 'SIGNAL 01', title: '炉顶下沉、鼓包或外凸', text: '优先检查吊挂、锚固件和背衬状态，不能只覆盖表面纤维。' },
          { label: 'SIGNAL 02', title: '冷面异常升温或变色', text: '排除密封漏热后，应检查贯通裂缝、热桥和保温层缺损。' },
          { label: 'SIGNAL 03', title: '多次补丁或异常工况', text: '反复修补、超温、进水、气氛侵蚀和工况变化都需要重新核算。' },
        ]}
        compareTitle="局部修、扩大拆检还是整体处理"
        compareIntro="决策表用于组织现场检查，不替代停炉开衬后的工程结论。"
        compareHeaders={['判断结果', '需要同时满足或确认', '不能忽略的边界']}
        compareRows={[
          ['考虑局部修复', '损坏局部、未及冷面、区外锚固完好、接缝可连续', '仍需查明火焰直冲、碰撞或局部超温等失效原因'],
          ['扩大拆检', '冷面异常、贯通裂缝、锚固腐蚀、炉顶下沉或多次修补', '拆检范围根据结构图、测温与开衬结果确定'],
          ['重新核算', '改燃料、提高温度、增加装炉量或改变炉压和气流', '旧炉衬按旧工况设计，不能直接沿用原结论'],
          ['材料与接口', '纤维、浇注料、砖体、烧嘴口、炉门与热电偶接口', '材料牌号、压缩要求和烘炉制度按项目确认'],
        ]}
        evidenceTitle="翻新后应留下哪些验收证据"
        evidenceIntro="记录不仅证明施工完成，也为后续判断外壁温升、密封和能耗变化提供可比基线。"
        evidence={[
          { label: 'STRUCTURE / 结构', title: '冷面、锚固与接缝记录', text: '保留拆除前后照片、冷面钢板状态、锚固检查、新旧衬接缝及穿墙接口记录。' },
          { label: 'MATERIAL / 材料', title: '合格证与施工参数', text: '某项目方案载明“1140 型、压缩量≥40%”，但牌号含义和适用性仍应结合产品资料与施工方案确认。' },
          { label: 'DRY-OUT / 烘炉', title: '实测曲线与排湿记录', text: '记录时间—温度曲线、保温时长、排湿口状态、排汽观察、异常处理和环境温湿度，不发布跨材料体系的通用曲线。' },
          { label: 'SURFACE / 外壁', title: '把温升变成可验收条件', text: '某项目采用 800℃、稳定态、热桥除外时外表面温升不超过 40 K 的设计指标；如用于验收，需约定测点、环境温度、仪器与热桥排除规则。' },
        ]}
        faqs={faqs}
        parameterTitle="提交炉衬资料，先判断检查边界"
        parameterIntro="建议提供炉型与温度、运行气氛、炉衬结构图、损坏照片、冷面温度、维修与异常历史、计划工况、可用停产窗口和希望复测的指标。"
        parameterItems={['炉型与温度', '运行气氛', '炉衬结构图', '损坏照片', '冷面温度', '维修与异常历史', '计划工况', '可用停产窗口']}
        relatedLinks={[
          { href: servicePath, label: '工业炉改造服务' },
          { href: quotePath, label: '工业炉报价参数' },
          { href: decisionPath, label: '老炉修还是换' },
        ]}
        sourceNote={factAudit.publicSource}
        reviewerName="王工"
        modifiedDate={seo.modifiedTime.slice(0, 10)}
      />
    </>
  );
}
