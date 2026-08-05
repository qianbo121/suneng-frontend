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
import { FURNACE_RESTART_RELOCATION_REMANUFACTURING_SEO as seo } from '@/lib/seo/page-data';

type PageProps = { params: Promise<{ locale: string }> };

const pagePath = '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan';
const servicePath = '/zh/service/furnace-renovation-overhaul';
const quotePath = '/zh/articles/gongye-lu-baojia-canshu';
const decisionPath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';

const questionAudit = {
  references: ['Q23', 'Q24', 'Q25'] as const,
  publicSource: '公司批准公开的停产炉重启、搬迁复产与再制造检查方法。',
};
void questionAudit.references;

const organizationJsonLd = {
  ...getOrganizationJsonLd('zh'),
  '@type': 'Organization',
};

const faqs = [
  {
    question: '停产热处理炉可以直接通电或点火吗？',
    answer:
      '不建议。应先还原停机原因并检查绝缘、炉衬、密封、能源管线、执行机构、安全联锁和机械状态，再按冷态、空载和负载顺序验证。',
  },
  {
    question: '工业炉搬迁后，原来的工艺参数还能直接用吗？',
    answer:
      '只能作为核对起点。基础、找正、管线、接线、循环、炉压和测温条件可能变化，需在新现场重新验证并形成新的设备基线。',
  },
  {
    question: '旧热处理炉值得再制造吗？',
    answer:
      '要看结构完整性、安全系统可恢复性、关键备件、能耗和排放边界，以及是否适配新工艺。不能只按购置年份或外观判断。',
  },
  {
    question: '停产炉重启或搬迁复产需要多久？',
    answer:
      '应拆分资料恢复、检查、整改、安装、冷态、空载和负载验收阶段，按设备状态、改造范围、现场条件与停产窗口分别确认，不给通用天数。',
  },
];

const jsonLd = [
  getArticleJsonLd({
    slug: 'rechuli-lu-tingchan-chongqi-banqian-fuchan',
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
    { name: '停产重启与搬迁复产', url: pagePath },
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

export default async function FurnaceRestartRelocationPage({ params }: PageProps) {
  if ((await params).locale !== 'zh') notFound();

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeoAuthorityGuidePage
        eyebrow="Furnace restart, relocation and remanufacturing"
        breadcrumbLabel="停产重启与搬迁复产"
        title="停产热处理炉重启与搬迁复产怎么评估？检查、试运行和验收清单"
        intro="不能从“设备还能启动”直接跳到负载生产。应先还原停机原因和设备状态，再检查结构、炉衬、能源、电气、测温、联锁和机械系统，按冷态、空载和负载三个阶段形成复产证据。"
        tags={[
          '停机原因与历史',
          '基础和钢结构',
          '炉衬与密封',
          '能源与安全联锁',
          '电气、测温和绝缘',
          '机械与传动系统',
        ]}
        asideLabel="恢复生产前先确认"
        asideTitle="6 组设备状态"
        asideItems={[
          '停机原因与最后工况',
          '基础、炉体与钢结构',
          '炉衬、加热或燃烧系统',
          '绝缘、测温与安全联锁',
          '机械系统与能源管线',
          '图纸、程序、铭牌与备件',
        ]}
        directTitle="先证明设备安全可控，再谈负载复产"
        directIntro="原设计能力、旧验收记录和短时启动结果，都不能自动成为搬迁后或长期停产后的新验收结论。"
        directAnswer="先查清停机原因、资料完整度和设备现状，完成结构、炉衬、能源、电气、测温、联锁与机械检查，再依次做冷态动作、空载升温和负载验证。每一步通过后才能进入下一步，具体检查范围和周期按项目确认。"
        directChecks={[
          '停机原因与历史',
          '基础和钢结构',
          '炉衬与密封',
          '能源与安全联锁',
          '电气、测温和绝缘',
          '机械与传动系统',
        ]}
        signalsTitle="出现这些情况，不能直接通电或点火"
        signalsIntro="以下信号说明设备状态或安全边界尚未建立，应先补检查和资料，不以一次空转代替系统判断。"
        signals={[
          {
            label: 'SIGNAL 01',
            title: '停机原因和现状不清',
            text: '不知道最后工况、故障原因、异常维修或介质残留时，不能直接恢复原启停程序。',
          },
          {
            label: 'SIGNAL 02',
            title: '图纸、程序或铭牌缺失',
            text: '控制版本、回路、设备参数和安全逻辑无法核对时，应先测绘、盘点并建立新基线。',
          },
          {
            label: 'SIGNAL 03',
            title: '搬迁拆解记录不完整',
            text: '基础、定位、管线、接线和部件编号发生变化后，原安装与验收结论不能直接沿用。',
          },
        ]}
        compareTitle="重启、搬迁与再制造分别核对什么"
        compareIntro="四种任务的检查重点不同，不能用一份“通电试机”清单覆盖全部风险。"
        compareHeaders={['任务方向', '优先核对', '不能直接沿用']}
        compareRows={[
          [
            '原地重启',
            '停机历史、绝缘、密封、执行机构、联锁与能源条件',
            '原设计能力不能自动成为当前负载生产结果',
          ],
          [
            '搬迁复产',
            '拆解编号、运输变形、基础、找正、管线和接口复原',
            '原安装状态和旧验收记录不能替代新现场验证',
          ],
          [
            '旧炉再制造',
            '结构完整性、安全系统、备件可得性和新工艺适配',
            '炉体或安全边界不可恢复时，不能只靠更换外观件继续使用',
          ],
          [
            '机械系统大修',
            '推杆、辊道、链条、液压、磨损、找正与负载动作',
            '空载能转不等于负载下速度、定位和保护均符合要求',
          ],
        ]}
        evidenceTitle="分三阶段形成复产证据"
        evidenceIntro="每个阶段都要记录条件、结果、偏差和整改，避免用“已开机”替代完整复产验收。"
        evidence={[
          {
            label: 'COLD / 冷态',
            title: '动作、绝缘与联锁检查',
            text: '核对旋向、行程、限位、阀门、急停、报警、绝缘和失效安全动作，记录缺陷与整改。',
          },
          {
            label: 'NO-LOAD / 空载',
            title: '按批准条件升温试运行',
            text: '依据炉衬材料和设备状态确认升温或烘炉要求，检查温区、循环、炉压、机械和异常报警。',
          },
          {
            label: 'LOAD / 负载',
            title: '固定工件和工艺验证',
            text: '记录工件、装炉方式、负载、工艺曲线、测量方法和结果；不把空载结果直接作为负载验收结论。',
          },
          {
            label: 'HANDOVER / 交付',
            title: '形成新的设备基线',
            text: '归档竣工图、程序与参数备份、报警清单、试验记录、培训资料、备件清单和后续检查计划。',
          },
        ]}
        faqs={faqs}
        parameterTitle="提交设备现状，先判断检查与复产边界"
        parameterIntro="建议提供炉型与工艺、停机原因和最后工况、设备照片、原图纸与程序、铭牌、维修记录、搬迁拆解记录、能源条件、目标工件和计划复产窗口。"
        parameterItems={[
          '炉型与工艺',
          '停机原因与最后工况',
          '设备照片',
          '原图纸与程序',
          '铭牌与维修记录',
          '搬迁拆解记录',
          '能源条件',
          '目标工件与复产窗口',
        ]}
        relatedLinks={[
          { href: servicePath, label: '工业炉改造服务' },
          { href: quotePath, label: '工业炉报价参数' },
          { href: decisionPath, label: '老炉修还是换' },
        ]}
        sourceNote={questionAudit.publicSource}
        modifiedDate={seo.modifiedTime.slice(0, 10)}
      />
    </>
  );
}
