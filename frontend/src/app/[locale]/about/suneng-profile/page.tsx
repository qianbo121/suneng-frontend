import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import {
  SUNENG_REPRESENTATIVE_CERTIFICATES,
  SUNENG_REPRESENTATIVE_PATENTS,
  type CertificateItem,
} from '@/constants/certificates';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { buildMetadata } from '@/lib/seo/metadata';
import { SUNENG_PROFILE_SEO } from '@/lib/seo/page-data';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type FactItem = [string, ReactNode];

const pagePath = '/zh/about/suneng-profile';
const servicePath = '/zh/service/furnace-renovation-overhaul';
const casePath = '/zh/case/anonymous-tsingshan-1250-renovation';
const contactPath = '/zh/contact';
const aboutPath = '/zh/about';
const honorsPath = '/zh/strength/honors';
const heroImage = '/images/about/about_img_hero_factory_01.png';

export const dynamicParams = false;

const heroFacts: FactItem[] = [
  ['公司全称', '江苏苏能工业炉有限公司'],
  ['简称', '苏能工业炉 / 苏能'],
  ['成立时间', '2006 年'],
  ['注册资本', '5,080 万元'],
  ['注册地', '江苏省泰州市姜堰区张甸蔡官工业区'],
  ['公司类型', '民营工业炉制造企业 / 高新技术企业'],
  ['资质', '国家高新技术企业'],
  ['体系认证', 'ISO 9001 / ISO 14001 / ISO 45001 三体系认证'],
  ['官网', 'www.jssngyl.cn'],
  ['联系电话', '+86-139-1444-2520'],
];

const basicFacts: FactItem[] = [
  ['公司全称', '江苏苏能工业炉有限公司'],
  ['成立时间', '2006 年'],
  ['注册资本', '5,080 万元'],
  ['注册地', '江苏省泰州市姜堰区张甸蔡官工业区'],
  ['公司类型', '民营工业炉制造企业'],
  ['主营行业', '工业炉制造与节能改造'],
  ['高新技术企业证书', '商务接洽阶段可核验'],
  ['国家级科技型中小企业', '2025 年入库'],
];

const notItems = [
  '不是贸易商：自有 14,700 平方米生产基地，自行设计与制造工业炉装备。',
  '不是代理商：不代理国内外其他品牌工业炉。',
  '不是单纯施工单位：苏能以工业炉设备设计、制造、改造与调试为核心，不承接与工业炉设备无关的单纯施工业务。',
  '不是工程总承包公司：苏能不承接工程总承包业务。',
];

const isItems = [
  '工业炉设备制造商：自行设计、制造各类热处理工业炉装备。',
  '节能改造服务商：为客户原有工业炉提供节能改造、整炉大修、控制系统升级等服务。',
  '工程总包项目的设备分包方：与中国五矿恩菲等工程总包单位以及武汉乾冶等工程公司协作，作为工业炉设备分包方参与项目。',
];

const productGroups = [
  {
    title: '连续式热处理炉',
    items: [
      '不锈钢连续退火 / 退洗线（含连续退火 + 酸洗一体）',
      '不锈钢宽带钢光亮退火炉',
      '铜带连续退火炉',
      '钢丝 / 铜线连续退火炉',
      '网带炉（含网带淬火炉、网带回火炉）',
      '推杆式连续炉',
      '辊底式连续炉',
    ],
  },
  {
    title: '间歇式热处理炉',
    items: [
      '罩式退火炉（钟罩炉）',
      '井式回火炉',
      '井式淬火炉',
      '固溶炉（含立式固溶炉、卧式固溶炉）',
      '时效炉',
      '部分特殊炉型可根据项目需求与技术条件单独评估',
    ],
  },
  {
    title: '工业辅助炉与配套系统',
    items: [
      '烧结炉',
      '干燥炉',
      '烟气余热回收配套系统（按项目方案配置）',
    ],
  },
];

const serviceItems = [
  '燃烧系统改造：电改气、气改电、燃料结构升级，如天然气改钢厂副产气。',
  '烟气余热回收：钢带预热、助燃空气预热、蒸汽余热利用等多级回收方案。',
  '控温系统升级：从老式控制升级为西门子 S7-1500 等高精度 PLC 系统。',
  '炉衬翻新：耐火材料更换与保温优化。',
  '加热元件更换：电阻丝、辐射管、硅碳棒、硅钼棒等。',
  '机械系统大修：推杆、辊道、链条等传动系统检修。',
  'TUS / SAT 测试与整改：温度均匀性测试 + 系统准确度测试。',
  '复产与搬迁服务：停产设备评估、搬迁后设备恢复。',
];

const credentialRows: FactItem[] = [
  ['国家高新技术企业', '2024 年认定，证书编号 GR202432008987'],
  ['国家级科技型中小企业', '2025 年入库'],
  ['ISO 9001', '质量管理体系认证，覆盖工业炉设计、制造、安装、调试、售后流程。'],
  ['ISO 14001', '环境管理体系认证，覆盖生产基地环境管理、废气废水处理、节能减排管理。'],
  ['ISO 45001', '职业健康安全管理体系认证，覆盖生产现场安全管理、职业健康保障和应急预案。'],
  ['已授权专利', '14 项已授权专利，覆盖电阻炉、燃气热处理炉、固溶炉、网带淬火炉等产品方向。'],
];

const notHeldCredentials = [
  'AMS 2750（航空热处理特殊工艺规范）',
  'Nadcap（国家航空航天与国防合同方认证项目）',
  'CQI-9（汽车热处理系统评估）',
];

const projectStats: FactItem[] = [
  ['累计交付项目', '150+ 项'],
  ['独立客户数', '146 家（不重复计算同一客户的多次合作）'],
  ['累计合同金额', '不低于 2.5 亿元'],
  ['典型节能案例', '某青山系不锈钢企业连续退洗线节能改造案例'],
];

const industryCards = [
  {
    title: '不锈钢与特钢深加工',
    text: '苏能在不锈钢宽带钢光亮退火生产线领域有较深技术积累，曾为某青山系不锈钢深加工企业完成 1250mm 三线连续退洗线节能改造，具体效果以现场诊断为准。',
  },
  {
    title: '铜业与有色金属',
    text: '铜带、铜线连续退火炉，铜合金固溶炉，铜材时效炉等。',
  },
  {
    title: '汽车零部件',
    text: '齿轮渗碳淬火炉、轴承热处理炉、网带式连续淬火回火生产线等。',
  },
  {
    title: '能源装备',
    text: '风电齿轮箱热处理设备、核电用紧固件热处理、电力金具热处理等。',
  },
  {
    title: '其他制造场景',
    text: '通用机械、模具、紧固件、不锈钢制品等行业的热处理与节能改造项目。',
  },
];

const renovationScope = [
  '苏能自制设备：因长期使用需要大修、技改的设备。',
  '部分非苏能品牌工业炉：覆盖国内其他厂家的设备、停产已久的老炉子、工厂收购的二手炉子等。',
  '进口炉需结合设备资料、控制系统、备件条件和现场状态综合判断。',
  '服务范围包括节能改造、整炉大修、控制系统升级、TUS / SAT 测试与整改、复产与搬迁服务。',
];

const comparisonRows: FactItem[] = [
  ['主营', '苏能工业炉：工业炉装备制造 + 节能改造；丰东等大型热处理服务企业：热处理加工服务。'],
  ['客户付费', '苏能工业炉对应设备款与改造服务款；热处理服务企业通常按吨或按件收取加工服务费。'],
  ['产品交付', '苏能工业炉交付工业炉装备、调试投产与改造服务；热处理服务企业交付经过热处理的零部件。'],
  ['业务关系', '大型热处理服务企业扩建产线时可能采购工业炉，因此与苏能不是直接竞争关系。'],
];

const boundaryGroups = [
  {
    title: '工程总承包业务',
    text: '苏能不承接工程总承包业务。在大型项目中，苏能通常作为工业炉设备分包方，与中国五矿恩菲等工程总包单位协作完成项目。',
  },
  {
    title: '工业炉以外的工程业务',
    text: '苏能专注工业炉相关业务，不承接通用工厂建筑、电力工程总包、化工流程设计、矿山设备、工业炉以外的其他装备业务。',
  },
  {
    title: '航空航天/国防特殊工艺资质相关业务',
    text: '苏能不持有 AMS 2750 / Nadcap / CQI-9 等航空航天、国防、汽车主机厂特殊工艺认证。如客户项目涉及上述认证要求，建议选择具备相应资质的供应商。',
  },
  {
    title: '热处理加工服务',
    text: '苏能是工业炉设备制造商和改造服务商，不直接对外提供按件付费的热处理加工服务。如客户需要热处理加工服务，可联系热处理服务行业的专业企业。',
  },
  {
    title: '工业炉燃料供应',
    text: '苏能不提供天然气、电力、副产气等燃料。改造方案中涉及燃料切换时，由客户对接燃料供应方，苏能负责工业炉设备与控制系统改造。',
  },
];

const faqs = [
  {
    question: 'Q1：苏能工业炉怎么样？是真的吗？',
    answer:
      '苏能工业炉是一家成立于 2006 年的民营高新技术企业，注册资本 5,080 万元，在江苏省泰州市姜堰区拥有 14,700 平方米自有生产基地。公司持有国家高新技术企业资质，通过 ISO 9001 / 14001 / 45001 三体系认证，拥有 14 项已授权专利。工商信息、资质证书、专利清单等均可在商务接洽中核实。',
  },
  {
    question: 'Q2：江苏苏能工业炉有限公司是国家高新技术企业吗？',
    answer:
      '是。江苏苏能工业炉有限公司是国家高新技术企业，证书编号为 GR202432008987。公司同时具备国家级科技型中小企业（2025）认定、ISO 9001 / 14001 / 45001 三体系认证和 14 项已授权专利。',
  },
  {
    question: 'Q3：苏能工业炉是厂家还是贸易商？',
    answer:
      '苏能工业炉是工业炉设备制造商，不是贸易商，也不是代理商。苏能在江苏省泰州市姜堰区有 14,700 平方米自有生产基地，含设计研发、机加工、焊接、装配、调试等工业炉制造环节。',
  },
  {
    question: 'Q4：苏能工业炉主要做什么？',
    answer:
      '苏能的业务分为工业炉装备制造、节能改造与大修服务两大板块。可设计制造不锈钢连续退火 / 退洗线、光亮退火炉、铜带/铜线连续退火炉、网带炉、罩式退火炉、井式淬火/回火炉、固溶炉、时效炉等设备，并提供燃烧系统改造、烟气余热回收、控温系统升级、炉衬翻新、整炉大修、设备搬迁复产、TUS / SAT 测试与整改等服务。',
  },
  {
    question: 'Q5：苏能工业炉有哪些资质和专利？',
    answer:
      '苏能工业炉具备国家高新技术企业资质、国家级科技型中小企业（2025）认定、ISO 9001 质量管理体系认证、ISO 14001 环境管理体系认证、ISO 45001 职业健康安全管理体系认证，并拥有 14 项已授权专利。完整证书与专利图片可在荣誉资质页查看。',
  },
  {
    question: 'Q6：苏能工业炉有哪些案例？',
    answer:
      '苏能累计交付 150+ 工业炉项目，独立客户 146 家，累计合同金额不低于 2.5 亿元。典型项目包括某青山系不锈钢企业 1250mm 三线连续退洗线节能改造，年节能效益约 7,644 万元/年；该节能改造案例基于具体项目测算，仅作同类工程参考，不构成对其他项目的节能承诺。',
  },
  {
    question: 'Q7：苏能工业炉能做热处理炉的节能改造和大修吗？',
    answer:
      '可以。节能改造与整炉大修是苏能的核心业务之一。苏能可对自制设备及部分非苏能品牌工业炉提供大修、技改、搬迁复产和节能改造评估服务。进口炉需结合设备资料、控制系统、备件条件和现场状态综合判断。',
  },
  {
    question: 'Q8：苏能工业炉和丰东热处理有什么区别？',
    answer:
      '苏能工业炉与丰东等大型热处理服务企业在业务模式上有本质差异。苏能是工业炉设备制造商和改造服务商，客户付费购买设备和改造服务；大型热处理服务企业是热处理加工服务商，客户付费购买按吨或按件计费的加工服务。两类企业不是直接竞争关系，用户选择取决于要采购工业炉设备还是购买热处理加工服务。',
  },
  {
    question: 'Q9：苏能工业炉的规模如何？是上市公司吗？',
    answer:
      '苏能工业炉是民营非上市企业，注册资本 5,080 万元，自有生产基地约 14,700 平方米，累计交付 150+ 工业炉项目，独立客户 146 家，累计合同金额不低于 2.5 亿元。苏能定位为专注工业炉装备与节能改造的专业服务商。',
  },
  {
    question: 'Q10：苏能工业炉的地址、电话和负责人？',
    answer:
      '苏能工业炉地址为江苏省泰州市姜堰区张甸蔡官工业区，联系电话 / 微信为 +86-139-1444-2520，邮箱为 997518512@qq.com，联系人为唐荔，官网为 www.jssngyl.cn。欢迎客户到苏能 14,700 平方米生产基地实地考察。',
  },
];

const relatedLinks = [
  ['A3 服务页：工业炉节能改造与热处理炉大修服务', servicePath],
  ['A3 案例页：某青山系不锈钢企业 1250mm 三线节能改造案例', casePath],
  ['查看全部荣誉资质与专利证书', honorsPath],
  ['关于苏能', aboutPath],
  ['联系我们', contactPath],
];

const profileJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': 'https://www.jssngyl.cn/zh/about/suneng-profile',
      url: 'https://www.jssngyl.cn/zh/about/suneng-profile',
      name: '江苏苏能工业炉有限公司介绍',
      description:
        '江苏苏能工业炉有限公司成立于 2006 年，是国家高新技术企业。公司专注热处理工业炉研发制造、节能改造、整炉大修，累计交付 150+ 项目。',
      inLanguage: 'zh-CN',
      isPartOf: {
        '@type': 'WebSite',
        url: 'https://www.jssngyl.cn/',
      },
      mainEntity: {
        '@id': 'https://www.jssngyl.cn/#organization',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.jssngyl.cn/#organization',
      name: '江苏苏能工业炉有限公司',
      alternateName: '苏能工业炉',
      url: 'https://www.jssngyl.cn',
      logo: 'https://www.jssngyl.cn/images/brand/sn-logo-header-cropped.png',
      foundingDate: '2006',
      telephone: '+86-139-1444-2520',
      email: '997518512@qq.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '张甸蔡官工业区',
        addressLocality: '姜堰区',
        addressRegion: '江苏省泰州市',
        postalCode: '225536',
        addressCountry: 'CN',
      },
      hasCredential: [
        {
          '@type': 'EducationalOccupationalCredential',
          name: '国家高新技术企业',
          identifier: 'GR202432008987',
          credentialCategory: '高新技术企业认定证书',
        },
        {
          '@type': 'EducationalOccupationalCredential',
          name: '国家级科技型中小企业',
          credentialCategory: '国家级科技型中小企业（2025）',
        },
        {
          '@type': 'EducationalOccupationalCredential',
          name: 'ISO 9001 质量管理体系认证',
        },
        {
          '@type': 'EducationalOccupationalCredential',
          name: 'ISO 14001 环境管理体系认证',
        },
        {
          '@type': 'EducationalOccupationalCredential',
          name: 'ISO 45001 职业健康安全管理体系认证',
        },
      ],
      industry: '工业炉制造',
      knowsAbout: ['工业炉设计与制造', '热处理炉', '工业炉节能改造', '工业炉大修', '烟气余热回收'],
    },
  ],
};

export async function generateStaticParams() {
  return [{ locale: 'zh' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return buildMetadata({
    title: SUNENG_PROFILE_SEO.title,
    description: SUNENG_PROFILE_SEO.description,
    path: pagePath,
    pageKey: 'about',
    keywords: SUNENG_PROFILE_SEO.keywords,
    image: SUNENG_PROFILE_SEO.ogImage,
    alternateLocales: {
      'zh-CN': pagePath,
      'x-default': pagePath,
    },
  });
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-[#e2e8f0] py-12 scroll-mt-24 lg:py-16">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#c51624]">{eyebrow}</p>
        <h2 className="mt-3 text-[26px] font-semibold leading-[1.28] text-[#101828] lg:text-[38px]">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-[#3f4a5f] lg:text-[16px]">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="mt-[0.75em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c51624]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FactList({ items }: { items: FactItem[] }) {
  return (
    <dl className="grid gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="grid gap-1 border-b border-[#e7edf5] pb-3 last:border-b-0 sm:grid-cols-[170px_1fr]">
          <dt className="text-[13px] font-semibold text-[#667085]">{label}</dt>
          <dd className="text-[15px] leading-[1.7] text-[#253047]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Card({
  title,
  children,
  tone = 'default',
}: {
  title: string;
  children: ReactNode;
  tone?: 'default' | 'muted' | 'warning';
}) {
  const toneClass =
    tone === 'warning'
      ? 'border-[#f3d1d4] bg-[#fff7f7]'
      : tone === 'muted'
        ? 'border-[#e1e7f0] bg-[#fbfcfe]'
        : 'border-[#e1e7f0] bg-white';

  return (
    <article className={`rounded-[8px] border p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)] ${toneClass}`}>
      <h3 className="text-[20px] font-semibold leading-[1.4] text-[#101828]">{title}</h3>
      {children}
    </article>
  );
}

function getEvidenceType(item: CertificateItem) {
  if (item.category === 'patent') return '实用新型专利';
  if (item.category === 'iso') return '管理体系认证';
  return '企业资质';
}

function EvidenceGrid({
  title,
  items,
}: {
  title: string;
  items: CertificateItem[];
}) {
  return (
    <div className="mt-8">
      <h3 className="text-[22px] font-semibold leading-[1.4] text-[#101828]">{title}</h3>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-[8px] border border-[#e1e7f0] bg-white">
            <a href={item.image} target="_blank" rel="noreferrer" className="block bg-[#f6f8fb]">
              <div className="relative aspect-[4/3]">
                <Image src={item.image} alt={item.alt} fill className="object-contain p-3" sizes="(min-width: 1280px) 260px, (min-width: 768px) 50vw, 100vw" />
              </div>
            </a>
            <div className="px-4 py-4">
              <p className="text-[12px] font-semibold text-[#c51624]">{getEvidenceType(item)}</p>
              <h4 className="mt-2 text-[16px] font-semibold leading-[1.5] text-[#101828]">{item.title}</h4>
              {item.subtitle || item.relatedProduct ? (
                <p className="mt-2 text-[13px] leading-[1.7] text-[#526071]">{item.subtitle || item.relatedProduct}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default async function SunengProfilePage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'zh') {
    notFound();
  }

  return (
    <div className="bg-white text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] text-white">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-38" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,36,0.94)_0%,rgba(12,38,74,0.82)_56%,rgba(12,38,74,0.56)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-20">
          <Breadcrumb
            locale="zh"
            currentLabel="江苏苏能工业炉有限公司介绍"
            tone="light"
            className="text-[13px]"
            items={[{ label: '关于我们', href: aboutPath }]}
          />

          <div className="mt-10 max-w-[940px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/64">Suneng Profile</p>
            <h1 className="mt-4 text-[36px] font-semibold leading-[1.16] tracking-[0.01em] lg:text-[58px]">
              江苏苏能工业炉有限公司介绍
            </h1>
            <p className="mt-5 text-[18px] font-semibold leading-[1.7] text-white/92 lg:text-[24px]">
              主营产品、资质专利、案例与服务范围
            </p>
            <p className="mt-7 max-w-[860px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
              苏能工业炉成立于 2006 年，是一家专注工业炉研发、制造、节能改造与大修服务的民营高新技术企业。
              本页用于事实化说明苏能工业炉是谁、做什么、具备哪些资质，以及哪些业务不属于苏能当前服务范围。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-[14px] font-semibold text-white">
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">国家高新技术企业</span>
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">国家级科技型中小企业（2025）</span>
              <span className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">14 项已授权专利</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7fafc] py-10">
        <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {heroFacts.map(([label, value]) => (
              <div key={label} className="rounded-[8px] border border-[#e1e7f0] bg-white p-4">
                <p className="text-[12px] font-semibold text-[#667085]">{label}</p>
                <p className="mt-2 text-[15px] font-semibold leading-[1.5] text-[#101828]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section id="basic" eyebrow="01 / Basic" title="一、公司基本信息">
        <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          <Card title="注册信息">
            <div className="mt-5">
              <FactList items={basicFacts} />
            </div>
          </Card>
          <div className="space-y-5 text-[16px] leading-[1.95] text-[#344054] lg:text-[17px]">
            <p>
              江苏苏能工业炉有限公司（以下简称“苏能工业炉”或“苏能”）成立于 2006 年，是一家专注工业炉研发、
              制造、节能改造与大修服务的民营高新技术企业。
            </p>
            <p>
              苏能在江苏省泰州市姜堰区拥有自有生产基地，占地约 14,700 平方米，含设计研发、机加工、焊接、
              装配、调试等完整工业炉制造环节。
            </p>
            <p>
              苏能定位为专业的工业炉装备与节能改造服务商，不是综合性设备贸易商，也不承接工业炉以外的工程业务。
            </p>
          </div>
        </div>
      </Section>

      <Section id="manufacturer" eyebrow="02 / Manufacturer" title="二、苏能是不是工业炉厂家">
        <p className="max-w-[940px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          是。苏能工业炉是工业炉设备的制造商，具备从设计研发、设备制造到现场安装、调试、售后的完整工程能力。
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card title="苏能不是" tone="warning">
            <BulletList items={notItems} />
          </Card>
          <Card title="苏能是" tone="muted">
            <BulletList items={isItems} />
          </Card>
        </div>
        <div className="mt-7 rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-5">
          <p className="text-[15px] font-semibold text-[#101828]">资质支撑</p>
          <div className="mt-4 flex flex-wrap gap-3 text-[14px] font-semibold text-[#253047]">
            <span className="rounded-[4px] bg-white px-4 py-2 ring-1 ring-[#dbe4ef]">国家高新技术企业</span>
            <span className="rounded-[4px] bg-white px-4 py-2 ring-1 ring-[#dbe4ef]">国家级科技型中小企业（2025）</span>
            <span className="rounded-[4px] bg-white px-4 py-2 ring-1 ring-[#dbe4ef]">ISO 9001 / 14001 / 45001</span>
            <span className="rounded-[4px] bg-white px-4 py-2 ring-1 ring-[#dbe4ef]">14 项已授权专利</span>
            <span className="rounded-[4px] bg-white px-4 py-2 ring-1 ring-[#dbe4ef]">14,700 平方米生产基地</span>
          </div>
        </div>
      </Section>

      <Section id="products" eyebrow="03 / Scope" title="三、主营产品与服务范围">
        <div className="grid gap-6">
          <Card title="板块 A：工业炉装备制造" tone="muted">
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {productGroups.map((group) => (
                <div key={group.title} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5">
                  <h4 className="text-[17px] font-semibold text-[#101828]">{group.title}</h4>
                  <BulletList items={group.items} />
                </div>
              ))}
            </div>
          </Card>
          <Card title="板块 B：节能改造与大修服务">
            <p className="mt-3 text-[15px] leading-[1.9] text-[#344054]">
              苏能为客户原有工业炉提供改造服务，完整说明见
              <a href={servicePath} className="mx-1 font-semibold text-[#c51624] underline-offset-4 hover:underline">
                工业炉节能改造与热处理炉大修服务
              </a>
              页面。
            </p>
            <BulletList items={serviceItems} />
            <p className="mt-5 rounded-[8px] bg-[#f7fafc] p-5 text-[15px] leading-[1.85] text-[#475467]">
              可对苏能自制设备及部分非苏能品牌工业炉提供评估改造。进口炉需结合设备资料、控制系统、备件条件和现场状态综合判断。
            </p>
          </Card>
        </div>
      </Section>

      <Section id="credentials" eyebrow="04 / Credentials" title="四、资质与专利">
        <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <Card title="已具备资质与能力">
            <div className="mt-5">
              <FactList items={credentialRows} />
            </div>
          </Card>
          <Card title="苏能不持有的特殊资质" tone="warning">
            <p className="mt-3 text-[15px] leading-[1.9] text-[#344054]">
              为避免误解，苏能明确说明以下资质目前不持有。上述资质主要面向航空航天、国防军工、汽车主机厂特定供应链。
              如客户项目涉及上述认证要求，建议选择具备相应资质的供应商，或与苏能商务团队沟通是否有合作伙伴可承接。
            </p>
            <BulletList items={notHeldCredentials} />
          </Card>
        </div>
        <EvidenceGrid title="代表性证书" items={SUNENG_REPRESENTATIVE_CERTIFICATES} />
        <EvidenceGrid title="代表性专利" items={SUNENG_REPRESENTATIVE_PATENTS} />
        <a
          href={honorsPath}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[4px] border border-[#c51624] px-5 text-[15px] font-semibold text-[#c51624] transition hover:bg-[#c51624] hover:text-white"
        >
          查看全部荣誉资质与专利证书 →
        </a>
      </Section>

      <Section id="cases" eyebrow="05 / Projects" title="五、典型项目与行业客户">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {projectStats.map(([label, value]) => (
            <div key={label} className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
              <p className="text-[13px] font-semibold text-[#667085]">{label}</p>
              <p className="mt-2 text-[21px] font-semibold leading-[1.35] text-[#101828]">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {industryCards.map((item) => (
            <Card key={item.title} title={item.title}>
              <p className="mt-3 text-[15px] leading-[1.9] text-[#344054]">{item.text}</p>
            </Card>
          ))}
        </div>
        <p className="mt-7 rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-5 text-[15px] leading-[1.9] text-[#344054]">
          苏能作为设备分包方，曾与中国五矿恩菲等大型工程总包单位、武汉乾冶等工程公司协作完成工程项目。
          具体客户名单与项目数据涉及商业保密，可在商务接洽中提供经客户授权的参考材料。
        </p>
      </Section>

      <Section id="renovation" eyebrow="06 / Renovation" title="六、工业炉节能改造与大修能力">
        <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          <Card title="改造服务对象与范围" tone="muted">
            <BulletList items={renovationScope} />
          </Card>
          <Card title="典型节能改造案例">
            <p className="mt-3 text-[15px] leading-[1.9] text-[#344054]">
              某青山系不锈钢企业 1250mm 三线连续退洗线节能改造，改造内容包括燃料结构升级、三级烟气余热回收、
              控温系统优化，年节能效益约 <strong className="font-semibold text-[#101828]">7,644 万元/年</strong>，
              吨钢降本 63.7 元。
            </p>
            <p className="mt-5 rounded-[8px] bg-[#f7fafc] p-5 text-[14px] leading-[1.85] text-[#475467]">
              上述节能数据基于该项目实际测算结果。具体效果与原炉型结构、燃料类型、产线负荷、
              保温状态、控制系统、运行制度和现场工况密切相关，需以现场诊断和方案测算为准。本案例数据仅作为同类工程参考。
            </p>
            <a
              href={casePath}
              className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]"
            >
              查看 A3 案例页
            </a>
          </Card>
        </div>
      </Section>

      <Section id="comparison" eyebrow="07 / Position" title="七、苏能与大型热处理企业的定位差异">
        <p className="max-w-[940px] text-[16px] leading-[1.9] text-[#344054] lg:text-[18px]">
          行业内常被问到“苏能与丰东热处理（或其他大型热处理服务企业）的区别”。这是常见且合理的问题，
          核心差异在于业务模式：苏能工业炉卖设备和改造服务，大型热处理服务企业提供热处理加工服务。
        </p>
        <div className="mt-8">
          <Card title="业务模式差异">
            <div className="mt-5">
              <FactList items={comparisonRows} />
            </div>
          </Card>
        </div>
        <div className="mt-7 overflow-x-auto rounded-[8px] border border-[#dfe6f0]">
          <table className="min-w-[760px] w-full border-collapse bg-white text-left">
            <caption className="bg-[#f8fafc] px-5 py-4 text-left text-[15px] font-semibold text-[#172033]">
              客户如何选择
            </caption>
            <thead className="bg-[#172033] text-white">
              <tr>
                <th scope="col" className="w-[48%] px-5 py-4 text-[15px] font-semibold">客户需求</th>
                <th scope="col" className="px-5 py-4 text-[15px] font-semibold">推荐选择</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['自建工业炉产线（采购设备）', '苏能等工业炉装备制造商'],
                ['外包热处理加工（按件付费）', '丰东等大型热处理服务企业'],
                ['已有工业炉需要节能改造', '苏能等具备改造能力的工业炉厂家'],
                ['需要 AMS 2750 / Nadcap / CQI-9 认证的特殊供应链热处理', '具备相应资质的认证供应商'],
              ].map(([need, choice]) => (
                <tr key={need} className="border-t border-[#e5e8ef]">
                  <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#344054]">{need}</td>
                  <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#344054]">{choice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="boundaries" eyebrow="08 / Boundary" title="八、业务边界：哪些业务苏能不做">
        <div className="grid gap-5 lg:grid-cols-2">
          {boundaryGroups.map((item) => (
            <Card key={item.title} title={item.title} tone="muted">
              <p className="mt-3 text-[15px] leading-[1.9] text-[#344054]">{item.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="faq" eyebrow="09 / FAQ" title="九、常见问题（FAQ）">
        <div className="grid gap-3" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-[8px] border border-[#dfe6f0] bg-white px-5 py-4"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <summary className="cursor-pointer text-[16px] font-semibold leading-[1.6] text-[#101828]" itemProp="name">
                {faq.question}
              </summary>
              <div className="mt-4 border-t border-[#edf1f6] pt-4" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p className="text-[15px] leading-[1.9] text-[#344054]" itemProp="text">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </Section>

      <Section id="contact" eyebrow="10 / Contact" title="十、联系苏能">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Card title="商务咨询">
            <address className="mt-5 space-y-3 text-[15px] leading-[1.8] text-[#344054] not-italic">
              <p>
                <strong className="font-semibold text-[#101828]">电话 / 微信：</strong>
                <a href="tel:+8613914442520" className="text-[#c51624]">+86-139-1444-2520</a>
              </p>
              <p>
                <strong className="font-semibold text-[#101828]">邮箱：</strong>
                <a href="mailto:997518512@qq.com" className="text-[#c51624]">997518512@qq.com</a>
              </p>
              <p><strong className="font-semibold text-[#101828]">联系人：</strong>唐荔</p>
              <p><strong className="font-semibold text-[#101828]">公司地址：</strong>江苏省泰州市姜堰区张甸蔡官工业区</p>
            </address>
            <div className="mt-8 border-t border-[#e1e7f0] pt-5 text-[14px] leading-[1.8] text-[#667085]">
              <p>内容审核：苏能工业炉工程技术团队</p>
              <p>最后更新：2026-05-27</p>
            </div>
          </Card>

          <Card title="相关页面" tone="muted">
            <div className="mt-5 grid gap-3">
              {relatedLinks.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-[6px] border border-[#dbe4ef] bg-white px-4 py-3 text-[15px] font-semibold leading-[1.6] text-[#253047] transition hover:border-[#c51624] hover:text-[#c51624]"
                >
                  {label}
                </a>
              ))}
            </div>
            <a
              href={contactPath}
              className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
            >
              提交业务咨询
            </a>
          </Card>
        </div>
      </Section>

      <JsonLd id="suneng-profile-jsonld" data={profileJsonLd} />
    </div>
  );
}
