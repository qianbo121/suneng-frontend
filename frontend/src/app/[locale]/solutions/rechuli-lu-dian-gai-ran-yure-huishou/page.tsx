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
import { FURNACE_ENERGY_CONVERSION_HEAT_RECOVERY_SEO as seo } from '@/lib/seo/page-data';

type PageProps = { params: Promise<{ locale: string }> };

const pagePath = '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou';
const servicePath = '/zh/service/furnace-renovation-overhaul';
const quotePath = '/zh/articles/gongye-lu-baojia-canshu';
const decisionPath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';

const factAudit = {
  references: ['Q04', 'Q05', 'SN-CASE-P1-014'] as const,
  publicSource: '公司批准公开的能源改造判断方法、项目方案参数与安全验收边界。',
};
void factAudit.references;

const organizationJsonLd = {
  ...getOrganizationJsonLd('zh'),
  '@type': 'Organization',
};

const faqs = [
  {
    question: '热处理炉电改燃一定更省钱吗？',
    answer:
      '不一定。需同时比较热效率、负荷率、能源价格、增容、安全、排放、维护和停产成本，并用同工况完整周期数据验证。',
  },
  {
    question: '两用燃料系统关闭烧嘴供风就安全了吗？',
    answer:
      '不能。空气侧断风不等于燃料侧隔离；点火许可应由燃料侧切断、实际阀位反馈、模式互锁和吹扫完成共同构成。',
  },
  {
    question: '烟气温度高就适合做余热回收吗？',
    answer:
      '还要看流量、运行时数、含尘与腐蚀性、系统压降、维护条件和利用端是否稳定。没有持续利用端，回收设备可能只有名义收益。',
  },
];

const jsonLd = [
  getArticleJsonLd({
    slug: 'rechuli-lu-dian-gai-ran-yure-huishou',
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
    { name: '能源改造与余热回收', url: pagePath },
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

export default async function FurnaceEnergyConversionPage({ params }: PageProps) {
  if ((await params).locale !== 'zh') notFound();

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeoAuthorityGuidePage
        eyebrow="Energy conversion and waste heat recovery"
        breadcrumbLabel="能源改造与余热回收"
        title="热处理炉电改燃、燃改电和余热回收怎么选？"
        intro="先建立同工况能源基线，再核算炉体、工艺、燃烧或配电、安全、排放、维护和停产边界；能源单价只是输入之一，不是改造结论。"
        tags={['同工况能源基线', '炉体与密封状态', '燃烧或配电条件', '安全与排放', '稳定利用端', '停产实施成本']}
        asideLabel="立项前至少确认"
        asideTitle="6 组决策输入"
        asideItems={['负载、产量与运行制度', '电价、气价与热值口径', '炉衬、密封与炉压状态', '配电或燃气增容条件', '安全联锁与排放要求', '余热利用端和停产窗口']}
        directTitle="不能只比较电价和气价"
        directIntro="应先把工件吸热、炉体散热、烟气与排风损失、待机保温、负荷率、能源单价、增容、安全、排放、维护和停产成本放进同一项目边界。"
        directAnswer="电改燃、燃改电或余热回收是否值得做，取决于同工况能源基线、生产制度、现场公辅条件和完整改造成本。别的项目的节能比例、吨产品成本和回收期不能直接套用。"
        directChecks={['同工况能源基线', '炉体与密封状态', '燃烧或配电条件', '安全与排放', '稳定利用端', '停产实施成本']}
        signalsTitle="先补齐这三类缺口，再谈回报"
        signalsIntro="没有可比基线、没有现场边界或没有稳定利用端时，收益模型看起来精确，实际仍无法验收。"
        signals={[
          { label: 'SIGNAL 01', title: '能耗口径不可比', text: '产量、负载、工艺曲线、能源热值、价格和统计周期没有统一。' },
          { label: 'SIGNAL 02', title: '炉体条件未检查', text: '电改燃会同时牵动炉衬、密封、炉压、排烟、烧嘴接口和控制联锁。' },
          { label: 'SIGNAL 03', title: '余热没有稳定去向', text: '高温烟气不等于可利用；温度品位、流量、运行时数和利用端必须匹配。' },
        ]}
        compareTitle="不同方案分别核对什么"
        compareIntro="决策应围绕工艺稳定性、基础设施、安全和完整生命周期成本，不用“哪种能源更先进”代替项目判断。"
        compareHeaders={['方案方向', '必须核对', '不建议直接推进的情况']}
        compareRows={[
          ['电改燃', '热负荷、炉压、排烟、烧嘴布置、燃气供压与安全联锁', '炉体或基础无法支持、排烟空间不足、燃气与消防条件不成立'],
          ['燃改电', '配电容量、功率分区、加热元件、气氛、循环风与峰谷电价', '增容成本或电网条件无法满足，工艺气氛与节拍不适配'],
          ['两用燃料', '燃料侧切断、阀位反馈、模式互锁、吹扫与完整重新点火', '只有空气侧换向，无法证明燃料侧安全隔离'],
          ['余热回收', '烟温、流量、时数、腐蚀/含尘、压降、保护和稳定利用端', '利用端不稳定、维护代价过高或回收导致系统阻力失控'],
        ]}
        evidenceTitle="安全、能耗与排放分别留证"
        evidenceIntro="设计目标、接口接收和正式验收是不同层级；结论必须绑定测试条件、记录和责任边界。"
        evidence={[
          { label: 'FAT / 工厂测试', title: '逻辑和安全动作', text: '记录控制逻辑、阀门动作与严密性、报警触发点、失焰响应，以及断电、断气、断风的安全状态。' },
          { label: 'SAT / 现场测试', title: '管路和真实工况', text: '验证气密、吹扫、真实失焰、断电、联锁联动和炉压稳定性；FAT 不能替代 SAT。' },
          { label: 'PROJECT / 项目证据', title: '方案参数不是实际能耗', text: '某项目有效加热区约 13×7.4×4.3 m、700℃、14 个温控区、8820 kW 级燃烧输入；该数字是项目方案边界，不是实际能耗。' },
          { label: 'ENERGY / 同工况验证', title: '固定分母与统计周期', text: '统一负载、产量、工艺、热值、价格和运行制度后比较；排放是否达标以适用标准和有资质现场检测为准。' },
        ]}
        faqs={faqs}
        parameterTitle="提交能源与运行资料，先做边界核算"
        parameterIntro="建议提供工件与装炉量、工艺曲线、产量与运行时数、改造前能耗、能源价格和热值、炉体尺寸、配电/供气条件、烟气参数、排放要求、利用端与停产窗口。"
        parameterItems={['工件与装炉量', '工艺曲线', '产量与运行时数', '改造前能耗', '能源价格与热值', '炉体与公辅条件', '烟气与排放要求', '利用端与停产窗口']}
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
