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
import { FURNACE_RENOVATION_RISK_CYCLE_GUIDE_SEO as seo } from '@/lib/seo/page-data';

type PageProps = { params: Promise<{ locale: string }> };

const pagePath = '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi';
const servicePath = '/zh/service/furnace-renovation-overhaul';
const quotePath = '/zh/articles/gongye-lu-baojia-canshu';
const decisionPath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';

const factReferences = ['SN-CASE-P1-014'];
void factReferences;
const organizationJsonLd = {
  ...getOrganizationJsonLd('zh'),
  '@type': 'Organization',
};

const faqs = [
  {
    question: '热处理炉节能改造有哪些风险？',
    answer:
      '主要风险来自原炉状态判断不足、图纸与现场不一致、旧新接口遗漏、隐蔽损伤、停产窗口不足、交叉施工和验收条件未提前约定。',
  },
  {
    question: '老旧热处理炉改造失败的原因是什么？',
    answer:
      '常见原因是只替换局部设备，却没有同时核对炉体、炉衬、热源、循环、控制、机械和装炉工艺；或改造前后测试条件不同，导致结论无法比较。',
  },
  {
    question: '热处理炉改造会影响生产吗？',
    answer:
      '会占用现场拆除、安装、切换、调试和负载验证窗口。可通过现场诊断、工厂预制、分区切换和应急回退减少影响，但不能在范围与现场状态未知时承诺零停产。',
  },
  {
    question: '热处理炉节能改造停产多久？',
    answer:
      '停产窗口取决于拆除、安装、旧新接口、隐蔽工程、烘炉、热态调试和负载验证。没有确认工程量与生产排程时，应按项目单独确认。',
  },
  {
    question: '热处理炉改造周期一般多久？',
    answer:
      '应分别评估诊断设计、采购制造、现场预制、停产施工、烘炉调试和负载验收，不把不同阶段混成一个固定周期。具体计划按项目范围与停产窗口单独确认。',
  },
];

const jsonLd = [
  getArticleJsonLd({
    slug: 'rechuli-lu-gaizao-fengxian-zhouqi',
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
    { name: '改造风险与周期', url: pagePath },
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

export default async function FurnaceRenovationRiskCyclePage({ params }: PageProps) {
  if ((await params).locale !== 'zh') notFound();

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeoAuthorityGuidePage
        eyebrow="Renovation risk, cycle & production impact"
        breadcrumbLabel="改造风险与周期"
        title="热处理炉改造有哪些风险？"
        intro="把原炉状态、隐蔽工程、旧新接口、停产切换和验收条件放进同一套执行文件，减少施工中才暴露的问题。"
        tags={['原炉诊断', '隐蔽工程', '旧新接口', '停产窗口', '切换回退', '负载验收']}
        asideLabel="开工前先锁定"
        asideTitle="范围、接口与验收"
        asideItems={['已知与未知工程量', '图纸和现场差异', '旧新系统接口', '停产与交叉施工', '切换和应急回退']}
        directTitle="风险来自边界不清，不只来自旧设备"
        directIntro="设计制造周期与现场停产窗口不是同一个概念；节能、产能和温度结论也必须绑定约定测试条件。"
        directAnswer="老炉改造最常见的风险，是原设备状态、改造范围、旧新接口、停产窗口和验收条件没有在开工前说清。应把诊断结论、工程量、不可预见项、预制范围、切换回退、测试条件和责任边界写进同一套执行文件。"
        directChecks={['原炉状态结论', '范围与未知项', '旧新接口清单', '停产切换计划', '应急回退条件', '负载验收口径']}
        signalsTitle="出现这些信号时，不能直接报固定周期"
        signalsIntro="资料不完整、现场与图纸不一致或验收条件未冻结，都会把原本可预制的工作推迟到停产窗口内。"
        signals={[
          { label: 'SIGNAL / SCOPE', title: '拆检范围和未知项不清', text: '炉衬、钢结构、基础或管线存在未暴露区域时，应提前约定确认和变更机制。' },
          { label: 'SIGNAL / INTERFACE', title: '图纸、现场与接口不一致', text: '保留、替换、临时和新增接口没有逐项核对，切换时容易出现机械、电气或能源条件冲突。' },
          { label: 'SIGNAL / ACCEPTANCE', title: '测试与验收条件未冻结', text: '负载、测点、仪器、统计周期和异常处理没有写清，改造完成后仍可能无法形成一致结论。' },
        ]}
        compareTitle="把总周期拆成可执行阶段"
        compareIntro="只有拆开非停产工作与现场停产工作，才能判断哪些环节可以预制、哪些必须占用生产窗口。"
        compareHeaders={['阶段', '主要工作', '影响判断']}
        compareRows={[
          ['诊断与设计', '现场检查、测绘、范围、接口和验收条件确认', '资料与停机检查条件不完整时按项目单独确认'],
          ['采购与预制', '设备材料、控制柜、管线与模块预制', '非标件、交期和变更冻结时间影响准备周期'],
          ['停产施工', '拆除、安装、接口切换与隐蔽工程处理', '现场状态、交叉施工和未知工程量影响停产窗口'],
          ['调试与验收', '烘炉、热态调试、负载验证与问题关闭', '工艺条件、生产排程和复测安排影响复产时间'],
        ]}
        evidenceTitle="交付时必须留下哪些风险关闭证据"
        evidenceIntro="“已经改完”不是验收证据；范围、变更、切换和测试条件都应可回查。"
        evidence={[
          { label: 'BASELINE', title: '原炉状态与改造基线', text: '记录炉体、炉衬、热源、循环、控制、机械和安全状态，并标出未拆检区域。' },
          { label: 'CHANGE', title: '隐蔽工程与变更记录', text: '记录拆除后发现的问题、确认过程、追加边界、责任和对计划的影响。' },
          { label: 'SWITCH', title: '切换与应急回退记录', text: '记录停机条件、旧新接口、联锁测试、回退触发条件和异常关闭结果。' },
          { label: 'ACCEPTANCE', title: '负载与统计条件', text: '记录工件、负载、测点、仪器、统计周期与异常工况；无法统一时按项目单独确认。' },
        ]}
        faqs={faqs}
        parameterTitle="提交改造范围与生产窗口，先拆风险和阶段"
        parameterIntro="范围、接口和验收条件未确认时，只提供阶段判断，不承诺固定停产天数、固定总周期或无条件总价。"
        parameterItems={['原炉图纸与现场照片', '历史故障与维修记录', '保留和替换范围', '目标工艺与产能', '可用停产窗口', '交叉施工条件', '旧新系统接口', '计划验收指标']}
        relatedLinks={[
          { href: servicePath, label: '工业炉改造服务' },
          { href: quotePath, label: '工业炉报价参数' },
          { href: decisionPath, label: '老炉修还是换' },
        ]}
        sourceNote="公司批准公开的改造项目管理方法、阶段周期与项目事实边界。"
        modifiedDate={seo.modifiedTime.slice(0, 10)}
      />
    </>
  );
}
