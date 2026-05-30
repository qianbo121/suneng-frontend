import Image from 'next/image';
import Link from 'next/link';

import { Locale } from '@/types/site';

export type CorePartnerLogoItem = {
  id: number;
  name: string;
  logoUrl: string;
};

export type CooperationFieldItem = {
  id: number;
  title: string;
  description: string;
  iconUrl: string;
  furnaceTypes: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};

export type RelatedPartnerLinkItem = {
  title: string;
  href: string;
  description: string;
};

type PartnerLogoGridProps = {
  locale: Locale;
  coreItems: CorePartnerLogoItem[];
  moreItems: string[];
  fieldItems: CooperationFieldItem[];
  relatedLinks: RelatedPartnerLinkItem[];
};

function SectionHeading({
  children,
  description,
  align = 'center',
}: {
  children: string;
  description?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <h2 className="text-[26px] font-normal leading-none text-[var(--color-text-strong)] lg:text-[28px]">
        {children}
      </h2>
      <div
        className={
          align === 'center'
            ? 'mx-auto mt-4 h-[3px] w-[40px] bg-[var(--color-accent)]'
            : 'mt-4 h-[3px] w-[40px] bg-[var(--color-accent)]'
        }
      />
      {description ? (
        <p
          className={
            align === 'center'
              ? 'mx-auto mt-5 max-w-[860px] text-[16px] leading-[1.9] text-[#555555]'
              : 'mt-5 max-w-[860px] text-[16px] leading-[1.9] text-[#555555]'
          }
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

function partnerLogoAlt(name: string) {
  return `${name.replace(/\s+/g, '')} logo`;
}

export function PartnerLogoGrid({
  locale,
  coreItems,
  moreItems,
  fieldItems,
  relatedLinks,
}: PartnerLogoGridProps) {
  return (
    <section className="bg-white">
      <div className="rounded-[8px] border border-[#e1e7f0] bg-[#f8fafc] p-6 lg:p-8">
        <SectionHeading align="left">
          {locale === 'en' ? 'Cooperation Notes' : '合作关系说明'}
        </SectionHeading>
        <div className="mt-6 space-y-5 text-[16px] leading-[1.9] text-[#344054]">
          <p>
            苏能工业炉与部分产业链企业、工程单位和行业客户存在过往项目合作、设备应用、设备配套、工程协作或相关业务往来。常见的合作形式包括：
          </p>
          <ul className="grid gap-3 md:grid-cols-2">
            {[
              '工业炉设备供货与配套',
              '退火、固溶、光亮退火等生产线的设计、制造与交付',
              '在大型项目中作为工业炉设备分包方，与工程总包单位协作完成',
              '在役工业炉的节能改造、控制系统升级、耐材翻新等服务',
            ].map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-[6px] bg-white px-4 py-3 ring-1 ring-[#e1e7f0]"
              >
                <span className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>不同单位的合作形式并不完全相同，具体以项目资料和可披露信息为准。</p>
        </div>
      </div>

      <div className="mt-12 lg:mt-14">
        <SectionHeading description="以下为苏能工业炉在装备制造、工程项目协作及工业炉设备应用中的部分合作单位。">
          {locale === 'en' ? 'Selected Cooperation Units' : '部分合作单位'}
        </SectionHeading>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {coreItems.map((item) => (
            <div
              key={item.id}
              className="flex h-[150px] items-center justify-center rounded-lg border border-[#dcdfe6] bg-white px-4 py-5 text-center shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="flex h-full w-full items-center justify-center bg-white">
                <Image
                  src={item.logoUrl}
                  alt={partnerLogoAlt(item.name)}
                  width={900}
                  height={360}
                  className="mx-auto max-h-[92px] max-w-[190px] object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 lg:mt-14">
        <SectionHeading>
          {locale === 'en' ? 'Other Cooperation Units' : '其他合作单位'}
        </SectionHeading>
        <div className="mt-9 grid gap-x-5 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {moreItems.map((name) => (
            <div
              key={name}
              className="flex min-h-[74px] items-center justify-center rounded-[4px] border border-[#dcdfe6] bg-white px-4 py-3 text-center text-[16px] font-normal leading-[1.45] text-[#202020]"
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 lg:mt-16">
        <SectionHeading>
          {locale === 'en' ? 'Industry Applications' : '行业应用场景'}
        </SectionHeading>
        <div className="mt-9 grid gap-6 lg:grid-cols-2 lg:gap-7">
          {fieldItems.map((item) => (
            <article
              key={item.id}
              className="rounded-md border border-[#dcdfe6] bg-white px-6 py-7"
            >
              <div className="flex gap-5">
                <div className="relative mt-1 h-[72px] w-[88px] shrink-0">
                  <Image
                    src={item.iconUrl}
                    alt={item.title}
                    fill
                    sizes="88px"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[21px] font-normal leading-[1.45] text-[#202020]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] font-normal leading-[1.85] text-[#555555]">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-[6px] bg-[#f8fafc] px-4 py-3 text-[14px] leading-[1.75] text-[#475467]">
                <span className="font-semibold text-[#202020]">适用炉型：</span>
                {item.furnaceTypes}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {item.links.map((link) => (
                  <Link
                    key={`${item.id}-${link.href}-${link.label}`}
                    href={link.href}
                    className="inline-flex min-h-[40px] items-center rounded-[4px] border border-[#d6dde8] px-4 text-[14px] font-semibold text-[#253047] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-14 lg:mt-16">
        <SectionHeading>
          {locale === 'en' ? 'Related Services' : '相关服务与了解更多'}
        </SectionHeading>
        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {relatedLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[8px] border border-[#dcdfe6] bg-white p-5 transition hover:border-[var(--color-accent)] hover:shadow-md"
            >
              <h3 className="text-[18px] font-semibold leading-[1.45] text-[#202020] group-hover:text-[var(--color-accent)]">
                {item.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.75] text-[#667085]">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-[8px] border border-[#e1e7f0] bg-[#f8fafc] p-6 text-[14px] leading-[1.9] text-[#667085] lg:p-7">
        <p>
          苏能工业炉为通用工业热处理装备制造商，不持有 AMS
          2750、Nadcap、CQI-9、军工产品资质或航空航天特殊工艺认证。涉及上述特殊工艺认证要求的项目，建议选择具备相应资质的供应商。
        </p>
        <p className="mt-3">各行业适用炉型与工艺仅供参考，具体设备配置以实际项目方案为准。</p>
      </div>
    </section>
  );
}
