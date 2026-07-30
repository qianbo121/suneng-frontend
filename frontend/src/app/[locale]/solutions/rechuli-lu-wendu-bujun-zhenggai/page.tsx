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
import { TEMPERATURE_UNIFORMITY_REMEDIATION_SEO as seo } from '@/lib/seo/page-data';

type PageProps = { params: Promise<{ locale: string }> };

const pagePath = '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai';
const servicePath = '/zh/service/furnace-renovation-overhaul';
const quotePath = '/zh/articles/gongye-lu-baojia-canshu';
const decisionPath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';

const factReferences = ['SN-CASE-P1-013'];
const organizationJsonLd = {
  ...getOrganizationJsonLd('zh'),
  '@type': 'Organization',
};

const faqs = [
  {
    question: '热处理炉温度不均怎么整改？',
    answer:
      '先固定工件、装炉方式和测试条件，再区分测量偏差与炉内真实温差，依次检查测温回路、加热分区、循环与导流、密封炉衬以及装炉工艺。整改后应按项目约定的同一条件复测。',
  },
  {
    question: '热处理炉温度不均，找厂家改造要看哪些能力？',
    answer:
      '应看厂家能否同时核对测温、热源、气流、密封、炉衬和装炉工艺，能否说明空炉与负载测试边界，并交付可复核的仪器、测点、曲线、异常和复测记录。',
  },
  {
    question: '工业炉改造后温度还是不均怎么办？',
    answer:
      '不要继续只调控制参数。先确认改造前后工件、负载、装炉、测点、保温和仪器条件是否一致，再根据偏差分布判断是测量、加热、循环、散热还是装炉造成。',
  },
  {
    question: '工业炉改造验收看哪些温度条件？',
    answer:
      '应写清空炉还是负载、测点数量、测点位置、保温时间、测温仪器、校准状态和依据的标准号。上述条件无法统一时，按项目技术协议和适用标准单独确认。',
  },
];

const jsonLd = [
  getArticleJsonLd({
    slug: 'rechuli-lu-wendu-bujun-zhenggai',
    path: pagePath,
    headline: seo.title,
    description: seo.description,
    image: seo.ogImage,
    datePublished: seo.publishedTime,
    dateModified: seo.modifiedTime,
  }),
  getBreadcrumbJsonLd([
    { name: '首页', url: '/zh' },
    { name: '工业炉改造服务', url: servicePath },
    { name: '温度不均整改与验收', url: pagePath },
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

export default async function TemperatureUniformityRemediationPage({ params }: PageProps) {
  if ((await params).locale !== 'zh') notFound();

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeoAuthorityGuidePage
        eyebrow="Temperature uniformity remediation"
        breadcrumbLabel="温度不均整改与验收"
        title="热处理炉温度不均怎么整改？"
        intro="从测试条件、测温回路、加热分区、循环导流、密封炉衬到装炉工艺，把温度不均拆成可诊断、可整改、可复测的问题。"
        tags={['测试条件', '测温校准', '加热分区', '循环与导流', '密封与炉衬', '负载复测']}
        asideLabel="诊断前先固定"
        asideTitle="测试与工况边界"
        asideItems={['空炉或负载状态', '工件与装炉方式', '测点位置与数量', '保温与采样条件', '仪器和校准状态']}
        directTitle="先固定测试条件，再判断原因"
        directIntro="控制点稳定不代表有效加热区内所有位置一致；不同工件、装炉方式和运行制度的结果也不能直接互相外推。"
        directAnswer="热处理炉温度不均不能只靠修改温控参数。应先固定工件、装炉方式和负载条件，再依次排查测温、热源、气流、密封、炉衬和装炉工艺，整改后按项目约定的相同条件复测。"
        directChecks={['明确空炉或负载', '固定工件与装炉', '核对测温回路', '检查热量与气流', '检查密封与散热', '同条件复测']}
        signalsTitle="出现这些现象时，先区分测量问题和真实温差"
        signalsIntro="单个显示值异常、固定位置反复偏差、空炉与负载结果不一致，对应的排查路径并不相同。"
        signals={[
          { label: 'SIGNAL / DISPLAY', title: '相邻测点趋势不一致', text: '优先核对热电偶、补偿导线、仪表、采集通道和校准状态，再判断炉内温差。' },
          { label: 'SIGNAL / POSITION', title: '固定区域持续偏冷或偏热', text: '检查对应加热分区、循环方向、导流、炉门台车缝隙、炉衬损伤和局部热桥。' },
          { label: 'SIGNAL / LOAD', title: '空炉正常、负载异常', text: '优先检查工件热容量、料架、装炉密度、遮挡、循环通道和工艺保温条件。' },
        ]}
        compareTitle="按偏差现象选择排查路径"
        compareIntro="同一个“温度不均”可能来自测量、热量分配、气流散热或装炉工艺，不凭单一曲线直接下结论。"
        compareHeaders={['现象', '优先核对', '决策边界']}
        compareRows={[
          ['单点异常或漂移', '热电偶、补偿导线、仪表、通道与校准', '测量链路未确认前，不直接改炉体'],
          ['稳定的空间冷热区', '加热分区、循环导流、炉压、密封与炉衬', '先确认偏差分布是否可重复'],
          ['空炉与负载差异明显', '工件、料架、装炉密度、遮挡与保温制度', '空炉结论不能替代负载工况'],
          ['改造后仍然不均', '复核前后测试条件，再逐项关闭未解决原因', '不同条件的结果不能直接比较'],
        ]}
        evidenceTitle="验收结论必须带测试脚手架"
        evidenceIntro="没有完整测试条件的温度结论不能跨项目复用；无法统一的条件一律按项目技术协议和适用标准单独确认。"
        evidence={[
          { label: 'CONDITION', title: '空炉、负载与装炉', text: '记录测试状态、工件、料架、装炉方式和运行制度，不能只保留最终结论。' },
          { label: 'POINTS & TIME', title: '测点与保温条件', text: '测点数量、位置、采样和保温时间按项目工艺、技术协议与适用标准单独确认。' },
          { label: 'INSTRUMENT', title: '仪器与校准', text: '记录仪器、传感器、通道和校准状态；无法确认时，不给出通用精度或均匀性承诺。' },
          { label: 'STANDARD', title: '标准与结果关闭', text: '记录依据的标准号、异常点、整改动作与复测结论；标准号按项目适用范围单独确认。' },
        ]}
        faqs={faqs}
        parameterTitle="提交温度与装炉资料，先判断偏差来自哪里"
        parameterIntro="信息不足时只给排查方向，不给脱离测试条件的温度均匀性承诺。"
        parameterItems={['炉型与工艺', '工件和装炉照片', '空炉或负载状态', '温度曲线与测点', '仪器与校准资料', '循环和加热配置', '当前异常位置', '计划验收依据']}
        relatedLinks={[
          { href: servicePath, label: '工业炉改造服务' },
          { href: quotePath, label: '工业炉报价参数' },
          { href: decisionPath, label: '老炉修还是换' },
        ]}
        sourceNote={`公司批准公开的温度诊断方法与验收边界；项目事实边界核对：${factReferences.join('、')}。该事实的均匀性设计要求未作为本页通用承诺。`}
        modifiedDate={seo.modifiedTime.slice(0, 10)}
      />
    </>
  );
}
