import Image from 'next/image';

import { AboutStatsPanel, AboutStatsPanelItem } from '@/components/about/AboutStatsPanel';
import { AboutShell } from '@/components/about/AboutShell';
import { createAboutPageMetadata, getAboutBannerImage, getAboutPageCopy, getAboutPageSource } from '@/lib/about';
import { Locale } from '@/types/site';

type AboutOrganizationPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type LocalizedText = {
  zh: string;
  en: string;
};

export const revalidate = 3600;

const iconBase = '/images/about/organization-icons';

const statItems: AboutStatsPanelItem[] = [
  {
    key: 'management',
    icon: `${iconBase}/stat-management.png`,
    label: { zh: '管理层级', en: 'Management Level' },
    value: { zh: '3级架构', en: '3 Levels' },
  },
  {
    key: 'center',
    icon: `${iconBase}/stat-center.png`,
    label: { zh: '职能中心', en: 'Functional Centers' },
    value: { zh: '5大中心', en: '5 Centers' },
  },
  {
    key: 'department',
    icon: `${iconBase}/stat-department.png`,
    label: { zh: '专业部门', en: 'Departments' },
    value: { zh: '14个部门', en: '14 Departments' },
  },
  {
    key: 'goal',
    icon: `${iconBase}/stat-goal.png`,
    label: { zh: '协同目标', en: 'Shared Goal' },
    value: { zh: '高效交付', en: 'Efficient Delivery' },
  },
];

const centerItems = [
  {
    icon: `${iconBase}/center-tech.png`,
    title: { zh: '技术中心', en: 'Technology Center' },
    departments: {
      zh: ['研发设计部', '工艺技术部', '电气自动化部'],
      en: ['R&D Design', 'Process Technology', 'Electrical Automation'],
    },
    description: {
      zh: '负责产品研发、工艺设计与技术创新支持。',
      en: 'Responsible for product R&D, process design and technical innovation.',
    },
  },
  {
    icon: `${iconBase}/center-production.png`,
    title: { zh: '生产制造中心', en: 'Manufacturing Center' },
    departments: {
      zh: ['计划采购部', '机加工车间', '焊接车间', '装配车间'],
      en: ['Planning & Purchasing', 'Machining Workshop', 'Welding Workshop', 'Assembly Workshop'],
    },
    description: {
      zh: '负责生产计划、加工制造、装配与交付。',
      en: 'Responsible for production planning, machining, assembly and delivery.',
    },
  },
  {
    icon: `${iconBase}/center-quality.png`,
    title: { zh: '品质管理中心', en: 'Quality Center' },
    departments: {
      zh: ['质量检验部', '计量检测部'],
      en: ['Quality Inspection', 'Measurement Testing'],
    },
    description: {
      zh: '负责质量检验、量产管控与过程改进。',
      en: 'Responsible for inspection, quality control and process improvement.',
    },
  },
  {
    icon: `${iconBase}/center-marketing.png`,
    title: { zh: '营销中心', en: 'Marketing Center' },
    departments: {
      zh: ['国内销售部', '外贸业务部', '客户服务部'],
      en: ['Domestic Sales', 'Export Business', 'Customer Service'],
    },
    description: {
      zh: '负责国内外市场开拓、客户沟通与持续跟进。',
      en: 'Responsible for market development, customer communication and follow-up.',
    },
  },
  {
    icon: `${iconBase}/center-management.png`,
    title: { zh: '综合管理中心', en: 'Administration Center' },
    departments: {
      zh: ['人力行政部', '财务部', '设备安环部'],
      en: ['HR & Administration', 'Finance', 'Equipment & EHS'],
    },
    description: {
      zh: '负责人力、财务、行政及设备安全管理。',
      en: 'Responsible for HR, finance, administration, equipment and safety.',
    },
  },
] as const;

export async function generateMetadata({ params }: AboutOrganizationPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return createAboutPageMetadata('organization', currentLocale);
}

function text(locale: Locale, value: LocalizedText) {
  return value[locale];
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="text-center">
      <h2 className="text-[26px] font-normal leading-none text-[var(--color-text-strong)] lg:text-[28px]">{children}</h2>
      <div className="mx-auto mt-4 h-[3px] w-[40px] bg-[var(--color-accent)]" />
    </div>
  );
}

function SourceIcon({ src, alt, size, className = '' }: { src: string; alt: string; size: number; className?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export default async function AboutOrganizationPage({ params }: AboutOrganizationPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const { data, error, sidebarItems, sidebarTitle } = await getAboutPageSource(currentLocale);
  const pageCopy = getAboutPageCopy('organization', currentLocale);
  const bannerSubtitle =
    currentLocale === 'en'
      ? 'Clear division, efficient collaboration, supporting R&D, manufacturing and service systems'
      : '清晰分工 · 高效协同 · 支撑工业炉研发、制造与服务体系';

  return (
    <AboutShell
      locale={locale}
      title={pageCopy.title}
      englishTitle={pageCopy.englishTitle}
      subtitle={pageCopy.subtitle}
      bannerTitle={pageCopy.title}
      bannerSubtitle={bannerSubtitle}
      bannerImage={getAboutBannerImage('organization', data)}
      sidebarTitle={sidebarTitle}
      sidebarItems={sidebarItems}
    >
      {error ? (
        <div className="hidden mb-6 border border-[rgba(230,0,18,0.16)] bg-white px-5 py-4 text-sm text-neutral-700 shadow-soft">
          {currentLocale === 'en'
            ? 'The live about API is currently unavailable. The page is showing available fallback structure.'
            : '当前关于我们接口暂时不可用，页面已按可用结构进行降级显示。'}
        </div>
      ) : null}

      <section className="bg-white">
        <p className="mx-auto max-w-[980px] text-center text-[16px] leading-[2] text-[#333333]">
          {currentLocale === 'en'
            ? 'Jiangsu Suneng Industrial Furnace has established a professional, collaborative organization system covering R&D, manufacturing, quality management, marketing and integrated services.'
            : '江苏苏能工业炉有限公司建立了专业化、协同化的组织体系，覆盖工企的研发、制造、质量管理、市场营销与综合服务，实现高效协同与精细化管理，持续为客户提供高质量的产品与解决方案。'}
        </p>

        <AboutStatsPanel
          locale={currentLocale}
          items={statItems}
          className="mt-8 rounded-md"
          iconSize={32}
          itemClassName="min-h-[120px] py-6"
          separatorInset={26}
          separatorClassName="bg-white/35"
          labelClassName="text-[14px] font-normal"
          valueClassName="text-[29px] font-normal lg:text-[33px]"
        />

        <div className="mx-auto mt-8 max-w-[990px]">
          <div className="relative flex flex-col items-center">
            <div className="relative z-10 flex min-h-[54px] min-w-[210px] items-center justify-center gap-4 rounded-md border border-[#dcdfe6] bg-white px-6 text-[22px] font-normal text-[#202020] shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
              <SourceIcon src={`${iconBase}/org-board.png`} alt="" size={36} />
              {currentLocale === 'en' ? 'Board' : '董事会'}
            </div>
            <div className="h-6 w-px bg-[#c9cdd4]" />
            <div className="relative z-10 flex min-h-[54px] min-w-[210px] items-center justify-center gap-4 rounded-md border border-[#dcdfe6] bg-white px-6 text-[22px] font-normal text-[#202020] shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
              <SourceIcon src={`${iconBase}/center-management.png`} alt="" size={32} />
              {currentLocale === 'en' ? 'General Manager' : '总经理'}
            </div>
            <div className="h-6 w-px bg-[#c9cdd4]" />
            <div className="hidden h-px w-[82%] bg-[#c9cdd4] lg:block" />
          </div>

          <div className="mt-0 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {centerItems.map((item) => (
              <div key={item.title.zh} className="relative pt-6 text-center">
                <span className="absolute left-1/2 top-0 hidden h-6 w-px -translate-x-1/2 bg-[#c9cdd4] lg:block" />
                <div className="rounded-md border border-[#dcdfe6] bg-white px-4 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <SourceIcon src={item.icon} alt="" size={42} className="mx-auto" />
                  <h3 className="mt-4 text-[20px] font-normal leading-none text-[#202020]">{text(currentLocale, item.title)}</h3>
                </div>
                <div className="mt-4 space-y-2">
                  {item.departments[currentLocale].map((department) => (
                    <div
                      key={department}
                      className="rounded-md border border-[#dcdfe6] bg-white px-3 py-2 text-[16px] leading-none text-[#333333]"
                    >
                      {department}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <SectionHeading>{currentLocale === 'en' ? 'Department Responsibilities' : '部门职责概览'}</SectionHeading>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {centerItems.map((item) => (
              <article key={item.title.zh} className="rounded-md border border-[#dcdfe6] bg-white px-5 py-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <SourceIcon src={item.icon} alt="" size={45} className="mx-auto" />
                <h3 className="mt-4 text-[20px] font-normal leading-none text-[#202020]">{text(currentLocale, item.title)}</h3>
                <p className="mt-4 text-[15px] leading-[1.8] text-[#555555]">{text(currentLocale, item.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AboutShell>
  );
}
