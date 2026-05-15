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
      '我们郑重承诺，所供工业炉设备均为全新未使用状态，采用精工制造工艺，严格符合合同约定的质量、规格与性能标准。在正确操作、规范运转及合理维护前提下，设备在整个使用周期内持续稳定可靠，为您的生产效率与产品质量提供坚实基础。',
    ],
  },
  {
    title: '二、质保保障：责任不设限，安心无边界',
    paragraphs: [
      '质保期限：设备验收合格后12个月，涵盖设计、工艺、材料等非人为因素导致的设备缺陷或故障，维修和更换费用由我方承担，无后顾之忧。',
      '潜在缺陷保障：质保期终止不代表责任终结。如设备在正常工况下，因设计、材料或制造工艺存在的潜在缺陷出现故障（非正常磨损或老化），无论是否超出质保期，我们均提供免费维修或更换服务，从源头规避风险。',
      '超期服务承诺：质保期满后，我们持续提供原厂维修配件，仅收取材料成本费用，保持透明定价和高品质服务，降低您的长期使用成本。',
    ],
  },
  {
    title: '三、响应速度：高效出击，不负所托',
    paragraphs: [
      '故障咨询：专业技术团队即时回复电话咨询，快速初步诊断问题。',
      '现场服务：如需上门服务，24小时内派遣专业人员到场，快速排除故障，最大限度减少停机损失。',
      '保障承诺：若48小时内无法解决问题，客户可采取必要补救措施，相关风险与费用由我方全额承担。',
    ],
  },
  {
    title: '四、全周期服务：赋能成长，终身相伴',
    paragraphs: [
      '免费培训指导：设备到场后提供终身免费技术培训，覆盖操作规范、日常保养、故障排查等，确保团队熟练掌握设备使用技巧。',
      '定期巡检回访：建立常态化服务机制，每年提供两次免费上门巡检，每月至少一次电话或现场回访，主动排查潜在问题。',
      '长效服务保障：质保期过后2年内人工与备品备件费用保持稳定，为您的成本规划提供确定性支持。',
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
