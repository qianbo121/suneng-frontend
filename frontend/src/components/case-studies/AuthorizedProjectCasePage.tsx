import Image from 'next/image';

import {
  GeoBulletList,
  GeoContactCta,
  GeoFaqGrid,
  GeoHeroTags,
  GeoSection as Section,
  type GeoFaqItem,
} from '@/components/geo-pages/GeoPageBlocks';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

type CaseCard = {
  title: string;
  text: string;
};

type RelatedLink = {
  title: string;
  text: string;
  href: string;
};

export type AuthorizedProjectCasePageData = {
  breadcrumbLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  heroImage: string;
  heroImageAlt: string;
  heroImageNote: string;
  heroTags: string[];
  facts: Array<[string, string]>;
  verifiedParameters?: Array<[string, string]>;
  verifiedParametersIntro?: string;
  disclosure: string;
  background: string;
  demand: string;
  challenges: CaseCard[];
  equipment: string[];
  solution: string[];
  experience: string;
  reusableValues: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  relatedLinks: RelatedLink[];
  contactTitle: string;
  contactDescription: string;
  contactSecondaryHref: string;
  contactSecondaryLabel: string;
  jsonLd: unknown;
  jsonLdId: string;
};

export function AuthorizedProjectCasePage({ data }: { data: AuthorizedProjectCasePageData }) {
  const faqItems: GeoFaqItem[] = data.faqs;

  return (
    <main className="bg-white text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] text-white">
        <div className="absolute inset-0">
          <Image
            src={data.heroImage}
            alt={data.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-42"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,36,0.97)_0%,rgba(12,38,74,0.88)_58%,rgba(12,38,74,0.62)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-20">
          <Breadcrumb
            locale="zh"
            currentLabel={data.breadcrumbLabel}
            tone="light"
            className="text-[13px]"
            items={[{ label: '项目案例' }]}
          />

          <div className="mt-10 max-w-[980px]">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-white/64">
                {data.eyebrow}
              </p>
              <p className="rounded-full border border-white/22 bg-[#081528]/72 px-3 py-1 text-[12px] font-semibold tracking-[0.04em] text-white/82">
                图片说明：{data.heroImageNote}
              </p>
            </div>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.18] tracking-[0.01em] lg:text-[54px]">
              {data.title}
            </h1>
            <p className="mt-5 max-w-[900px] text-[18px] font-semibold leading-[1.7] text-white/90 lg:text-[23px]">
              {data.subtitle}
            </p>

            <GeoHeroTags tags={data.heroTags} />

            <div className="mt-8 grid gap-4 rounded-[8px] border border-white/18 bg-white/10 p-5 backdrop-blur md:grid-cols-2">
              {data.facts.map(([label, value]) => (
                <div key={label}>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/54">
                    {label}
                  </p>
                  <p className="mt-2 text-[15px] leading-[1.75] text-white/90">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-7 max-w-[940px] rounded-[8px] border border-white/14 bg-[#081528]/68 p-5 text-[14px] leading-[1.9] text-white/78">
              <strong className="font-semibold text-white">公开边界：</strong>
              {data.disclosure}
            </p>
          </div>
        </div>
      </section>

      <Section id="overview" eyebrow="Project Context" title="一、项目背景与真实需求">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6">
            <h3 className="text-[21px] font-semibold leading-[1.4] text-[#101828]">
              行业与项目背景
            </h3>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">{data.background}</p>
          </article>
          <article className="rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)]">
            <h3 className="text-[21px] font-semibold leading-[1.4] text-[#101828]">项目需求</h3>
            <p className="mt-4 text-[15px] leading-[1.9] text-[#344054]">{data.demand}</p>
          </article>
        </div>
        {data.verifiedParameters?.length ? (
          <article className="mt-6 rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-6 lg:p-7">
            <h3 className="text-[21px] font-semibold leading-[1.4] text-[#101828]">
              经授权项目参数
            </h3>
            <p className="mt-3 text-[14px] leading-[1.85] text-[#667085]">
              {data.verifiedParametersIntro ||
                '以下为该项目资料中的具体参数，仅用于说明对应项目的工程边界，不等同于其他工件或新项目的固定配置与性能承诺。'}
            </p>
            <dl className="mt-5 grid overflow-hidden rounded-[8px] border border-[#dfe6f0] bg-white md:grid-cols-2">
              {data.verifiedParameters.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[128px_minmax(0,1fr)] border-b border-[#edf1f6] last:border-b-0 md:odd:border-r"
                >
                  <dt className="bg-[#f5f7fa] px-4 py-4 text-[14px] font-semibold leading-[1.7] text-[#344054]">
                    {label}
                  </dt>
                  <dd className="px-4 py-4 text-[14px] leading-[1.8] text-[#475467]">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ) : null}
      </Section>

      <Section id="challenges" eyebrow="Engineering Challenges" title="二、这类项目难在哪里">
        <div className="grid gap-5 md:grid-cols-2">
          {data.challenges.map((item) => (
            <article
              key={item.title}
              className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-6"
            >
              <h3 className="text-[19px] font-semibold leading-[1.45] text-[#101828]">
                {item.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-[#344054]">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="solution" eyebrow="System Scope" title="三、设备组成与苏能方案">
        <div className="grid gap-7 lg:grid-cols-2">
          <article className="rounded-[8px] border border-[#e1e7f0] bg-white p-6 shadow-[0_10px_24px_rgba(15,35,75,0.04)]">
            <h3 className="text-[21px] font-semibold leading-[1.4] text-[#101828]">主要设备组成</h3>
            <GeoBulletList items={data.equipment} />
          </article>
          <article className="rounded-[8px] border border-[#d6e0ec] bg-[#f7fafc] p-6">
            <h3 className="text-[21px] font-semibold leading-[1.4] text-[#101828]">苏能参与内容</h3>
            <GeoBulletList items={data.solution} />
          </article>
        </div>
      </Section>

      <Section id="experience" eyebrow="Reusable Experience" title="四、项目经验与可复用价值">
        <article className="rounded-[8px] border border-[#d6e0ec] bg-[#f8fafc] p-6 lg:p-7">
          <p className="text-[16px] leading-[1.95] text-[#344054]">{data.experience}</p>
          <GeoBulletList items={data.reusableValues} />
        </article>
      </Section>

      <Section id="faq" eyebrow="Buyer Questions" title="五、采购与方案评估常见问题">
        <GeoFaqGrid items={faqItems} openMode="first" />
      </Section>

      <Section id="related" eyebrow="Next Step" title="六、继续查看相关能力">
        <div className="grid gap-5 md:grid-cols-3">
          {data.relatedLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-[8px] border border-[#e1e7f0] bg-white p-5 shadow-[0_10px_24px_rgba(15,35,75,0.04)] transition hover:-translate-y-0.5 hover:border-[#c51624]/35 hover:shadow-[0_14px_30px_rgba(15,35,75,0.08)]"
            >
              <span className="text-[18px] font-semibold leading-[1.45] text-[#c51624]">
                {item.title}
              </span>
              <span className="mt-3 block text-[14px] leading-[1.8] text-[#475467]">
                {item.text}
              </span>
            </a>
          ))}
        </div>
      </Section>

      <GeoContactCta
        eyebrow="提交项目参数"
        title={data.contactTitle}
        description={data.contactDescription}
        secondaryHref={data.contactSecondaryHref}
        secondaryLabel={data.contactSecondaryLabel}
      />

      <JsonLd id={data.jsonLdId} data={data.jsonLd} />
    </main>
  );
}
