import type { Metadata } from 'next';
import Image from 'next/image';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageBanner } from '@/components/layout/PageBanner';
import { buildMetadata } from '@/lib/seo/metadata';
import { SERVICE_SEO } from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

type ServicePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const heroImage = '/images/service/after-sales-hero.png';
const phoneIcon = '/images/service/service-phone-icon.png';

const serviceSections = [
  {
    title: '一、品质基石：源自匠心，始终如一',
    paragraphs: [
      '苏能所供工业炉设备为全新未使用状态，采用精工制造工艺，符合合同约定的质量、规格与性能标准。在规范操作与合理维护条件下，设备在合同约定的使用周期内运行稳定。',
    ],
  },
  {
    title: '二、质保保障：合同约定，规范执行',
    paragraphs: [
      '质保期内因设备制造质量或设计缺陷导致的故障，按合同约定提供免费维修或更换服务。',
      '潜在缺陷处理：如设备在质保期内出现因设计、材料或制造工艺潜在缺陷导致的非正常故障，按合同约定提供维修或更换服务；质保期外的潜在缺陷处理依据合同条款执行。',
      '超期服务：质保期满后可持续提供原厂维修配件及有偿技术服务，具体收费标准依据合同约定或单独协商。',
    ],
  },
  {
    title: '三、响应速度：高效出击，不负所托',
    paragraphs: [
      '故障咨询：客户服务热线 +86-139-1444-2520，专业技术团队接听后协助初步诊断问题。',
      '现场服务：客户服务热线 8 小时内响应，技术服务团队 24 小时内答复处理方案；现场上门服务依据合同约定、设备状态、现场工况和服务距离安排。',
      '故障处理：按问题影响等级与合同约定的服务条款响应。具体处理方案、停产损失补偿等事宜，以合同条款为准。',
    ],
  },
  {
    title: '四、长期服务保障：持续支持，伴您发展',
    paragraphs: [
      '免费培训指导：设备交付时提供操作培训，覆盖操作规范、日常维护、应急处理等内容；后续培训依据合同约定或单独协商。',
      '定期回访：建立常态化客户服务机制，按合同约定的频次安排定期巡检与回访，主动了解设备运行状态。',
      '长期服务支持：质保期外的维修服务与备品备件供应，依据合同约定或单独报价提供。',
    ],
  },
  {
    title: '五、实力护航：专业团队，全域覆盖',
    paragraphs: [
      '我们组建了一支由30余名专职售后服务人员组成的团队，深耕全国各地工业炉领域，经验丰富、技术精湛。各区域售后服务站配备专职人员，实现快速电话响应、定期巡检及现场服务，全域覆盖，确保无论您身处何地，都能享受到及时、优质的售后服务。',
    ],
  },
];

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return buildMetadata({
    title: SERVICE_SEO.title,
    description: SERVICE_SEO.description,
    path: `/${currentLocale}/service`,
    pageKey: 'service',
    keywords: SERVICE_SEO.keywords,
    image: heroImage,
    alternateLocales: {
      'zh-CN': '/zh/service',
      'en-US': '/en/service',
      'x-default': '/zh/service',
    },
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale } = await params;
  const title = '售后服务';

  return (
    <div className="bg-[#f7f8fa]">
      <PageBanner
        locale={locale}
        title={title}
        englishTitle="After-sales Service"
        subtitle="从方案设计到现场应用的全周期技术服务"
        backgroundImage={heroImage}
        variant="about"
      />

      <div className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex min-h-[54px] max-w-[1660px] items-center px-6 lg:px-[86px]">
          <Breadcrumb
            locale={locale}
            currentLabel={title}
            tone="dark"
            className="text-[13px]"
            items={[
              { label: '服务支持' },
            ]}
          />
        </div>
      </div>

      <section className="mx-auto max-w-[1160px] px-6 py-10 lg:px-8 lg:py-12">
        <article className="bg-white px-8 py-10 shadow-[0_10px_34px_rgba(15,35,75,0.08)] md:px-14 lg:px-[84px] lg:py-[58px]">
          <header className="text-center">
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[0.03em] text-[#071a3d] lg:text-[38px]">
              江苏苏能工业炉：以匠心筑品质，以服务赢信赖
            </h2>
            <p className="mx-auto mt-7 max-w-[880px] text-[17px] leading-[2] text-[#1d3155] lg:text-[19px]">
              江苏苏能工业炉有限公司始终将产品品质与客户服务置于核心地位，以严苛标准保障质量，
              以高效响应兑现承诺，竭诚为工业热处理生产提供安全可靠的设备支持。
            </p>
          </header>

          <div className="mt-12 space-y-10">
            {serviceSections.map((section) => (
              <section key={section.title}>
                <h3 className="text-[22px] font-bold leading-[1.45] text-[#071a3d] lg:text-[25px]">{section.title}</h3>
                <div className="mt-4 space-y-2 text-[16px] leading-[2] text-[#253858] lg:text-[18px]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-11 flex items-center gap-6 rounded-md border border-[#d9dee7] bg-white px-6 py-5 lg:px-8">
            <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-full bg-[#feecef]">
              <Image src={phoneIcon} alt="" fill sizes="86px" className="object-cover" />
            </div>
            <div className="text-[#071a3d]">
              <h3 className="text-[20px] font-normal leading-[1.45] text-[var(--color-accent)]">售后服务热线方式</h3>
              <p className="mt-2 text-[18px] font-normal leading-[1.6]">联系人：唐荔　电话：+86-139-1444-2520</p>
            </div>
          </section>
        </article>
      </section>
    </div>
  );
}
