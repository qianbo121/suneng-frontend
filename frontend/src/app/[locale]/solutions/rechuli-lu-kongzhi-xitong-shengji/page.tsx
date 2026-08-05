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
import { FURNACE_CONTROL_SYSTEM_UPGRADE_SEO as seo } from '@/lib/seo/page-data';

type PageProps = { params: Promise<{ locale: string }> };

const pagePath = '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji';
const servicePath = '/zh/service/furnace-renovation-overhaul';
const quotePath = '/zh/articles/gongye-lu-baojia-canshu';
const decisionPath = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';

const factAudit = {
  references: ['SN-CASE-P1-012'] as const,
  publicSource: '公司批准公开的控制系统改造判断方法与项目技术方案配置。',
};
void factAudit.references;

const organizationJsonLd = {
  ...getOrganizationJsonLd('zh'),
  '@type': 'Organization',
};

const faqs = [
  {
    question: '热处理炉控制系统升级，就是换一套 PLC 吗？',
    answer:
      '不是。还要核对测量回路、执行机构、安全联锁、程序与图纸、历史数据、外部接口和切换方案；否则新 PLC 可能只是承接了旧问题。',
  },
  {
    question: '热处理炉改造用 PLC 还是 DCS？',
    answer:
      '按控制对象数量、联锁复杂度、冗余需求、全厂接口、数据治理和维护能力选择。单看品牌、价格或系统名称不能得出结论。',
  },
  {
    question: '热处理炉控制系统升级多少钱？',
    answer:
      '需拆分 I/O、柜体、仪表、执行机构、安全系统、软件、数据接口、现场施工和停产切换范围后报价，不能按“换 PLC”给通用价格。',
  },
];

const jsonLd = [
  getArticleJsonLd({
    slug: 'rechuli-lu-kongzhi-xitong-shengji',
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
    { name: '控制系统升级', url: pagePath },
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

export default async function FurnaceControlSystemUpgradePage({ params }: PageProps) {
  if ((await params).locale !== 'zh') notFound();

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeoAuthorityGuidePage
        eyebrow="Heat-treatment furnace control system upgrade"
        breadcrumbLabel="控制系统升级"
        title="热处理炉控制系统升级怎么做？PLC、DCS、测温、联锁与数据接口检查清单"
        intro="先盘点控制对象、测量回路、执行机构、安全联锁、程序备份和数据接口，再决定保留、局部升级还是更换架构。PLC、DCS 或其他架构应按项目复杂度与维护条件选择。"
        tags={[
          '图纸与 I/O 点表',
          '测温与校准',
          '执行机构与反馈',
          '安全联锁与报警',
          '历史数据与接口',
          '切换与回退',
        ]}
        asideLabel="升级前先盘点"
        asideTitle="6 组控制资料"
        asideItems={[
          '原电气图与 I/O 点表',
          'PLC、HMI 程序与版本',
          '测温与执行机构清单',
          '安全联锁与报警逻辑',
          '历史数据和外部接口',
          '停产切换与回退条件',
        ]}
        directTitle="先盘点控制对象，再决定 PLC 还是 DCS"
        directIntro="PLC 品牌、HMI 尺寸或算法名称，都不能单独决定控温精度、温度均匀性和工艺稳定性。控制升级必须连同炉体、加热、循环、测温和联锁一起核对。"
        directAnswer="先恢复图纸、点表、程序、参数和版本基线，再检查测量回路、执行机构和安全联锁；依据 I/O 规模、控制复杂度、数据接口与维护能力，决定保留、局部升级或更换架构，并通过冷态、热态和负载验证形成闭环。"
        directChecks={[
          '图纸、点表与程序',
          '测温与校准状态',
          '执行机构与反馈',
          '安全联锁与报警',
          '历史数据与接口',
          '切换与回退条件',
        ]}
        signalsTitle="出现这些信号，应先做控制系统体检"
        signalsIntro="体检用于找出真正的失效链，不把所有温度波动、停机和质量问题都归因于 PLC。"
        signals={[
          {
            label: 'SIGNAL 01',
            title: '备件停产，程序不可维护',
            text: '控制器、模块或触摸屏难以替换，程序、密码、备份或注释缺失，故障恢复依赖临时处理。',
          },
          {
            label: 'SIGNAL 02',
            title: '显示稳定，工艺仍波动',
            text: '应核对传感器位置、校准、执行机构、加热能力、循环与炉膛状态，不能只改控制参数。',
          },
          {
            label: 'SIGNAL 03',
            title: '报警、追溯和接口缺失',
            text: '事件记录、历史曲线、配方版本或上位接口不足时，异常原因难以复盘，质量责任也难以追溯。',
          },
        ]}
        compareTitle="不同架构分别核对什么"
        compareIntro="架构选择不是品牌排名。应比较控制对象、联锁复杂度、冗余要求、数据治理、维护能力和改造边界。"
        compareHeaders={['方案方向', '优先核对', '不能直接承诺']}
        compareRows={[
          [
            'PLC',
            'I/O 规模、顺序控制、分区温控、通信接口和维护能力',
            '不能仅凭品牌或型号承诺控温精度与温度均匀性',
          ],
          [
            'DCS',
            '多系统协同、冗余、权限、历史数据库和全厂接口',
            '系统更复杂不等于更适合单台炉，需核对运维与数据边界',
          ],
          [
            '保留并局部升级',
            '原程序可读性、备件状态、现有回路与新增接口',
            '安全逻辑、图纸和数据基础不清时，不宜继续叠加补丁',
          ],
          [
            'HMI / SCADA / MES',
            '点位映射、时间戳、存储周期、权限和网络安全',
            '更换画面或增加看板不等于完成底层控制升级',
          ],
        ]}
        evidenceTitle="切换和验收必须留下哪些证据"
        evidenceIntro="交付物要能回答“改了什么、如何验证、出现问题怎样回退”，而不只是证明新柜体已经通电。"
        evidence={[
          {
            label: 'BACKUP / 基线',
            title: '原程序、参数与版本归档',
            text: '保留原程序、参数、校验信息、I/O 点表、通信表和图纸版本，记录变更项与回退条件。',
          },
          {
            label: 'FAT / 工厂测试',
            title: '模拟 I/O、报警和联锁',
            text: '按项目测试大纲验证输入输出、报警触发、联锁顺序和失效安全动作，并形成偏差整改闭环。',
          },
          {
            label: 'SAT / 现场测试',
            title: '冷态、热态与负载验证',
            text: '现场核对回路、执行机构、联锁、工艺曲线和负载结果；冷态逻辑通过不能替代热态或负载验证。',
          },
          {
            label: 'PROJECT / 项目边界',
            title: '项目配置只作边界示例',
            text: '某项目技术方案采用 S7-1200 PLC、14 英寸 HMI、每室 2 区 PID；它只说明该项目的方案配置，不代表所有控制升级都应采用相同品牌、屏幕尺寸或分区。',
          },
        ]}
        faqs={faqs}
        parameterTitle="提交图纸、点表和程序信息，先拆保留与替换边界"
        parameterIntro="建议提供炉型与工艺、原电气图、I/O 点表、PLC 与 HMI 型号和程序、测温与执行机构清单、联锁与报警、数据接口、故障记录和可用停产窗口。"
        parameterItems={[
          '炉型与工艺',
          '原电气图',
          'I/O 点表',
          'PLC 与 HMI 程序',
          '测温与执行机构',
          '联锁与报警',
          '数据接口',
          '停产窗口',
        ]}
        relatedLinks={[
          { href: servicePath, label: '工业炉改造服务' },
          { href: quotePath, label: '工业炉报价参数' },
          { href: decisionPath, label: '老炉修还是换' },
        ]}
        sourceNote={factAudit.publicSource}
        modifiedDate={seo.modifiedTime.slice(0, 10)}
      />
    </>
  );
}
