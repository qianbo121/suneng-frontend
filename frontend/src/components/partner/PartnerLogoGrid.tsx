import Image from 'next/image';

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
};

type PartnerLogoGridProps = {
  locale: Locale;
  coreItems: CorePartnerLogoItem[];
  moreItems: string[];
  fieldItems: CooperationFieldItem[];
};

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="text-center">
      <h2 className="text-[26px] font-normal leading-none text-[var(--color-text-strong)] lg:text-[28px]">{children}</h2>
      <div className="mx-auto mt-4 h-[3px] w-[40px] bg-[var(--color-accent)]" />
    </div>
  );
}

export function PartnerLogoGrid({ locale, coreItems, moreItems, fieldItems }: PartnerLogoGridProps) {
  return (
    <section className="bg-white">
      <SectionHeading>{locale === 'en' ? 'Core Partners' : '核心合作伙伴'}</SectionHeading>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-7">
        {coreItems.map((item) => (
          <div
            key={item.id}
            className="flex min-h-[300px] items-center justify-center rounded-lg border border-[#dcdfe6] bg-white p-4 text-center shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <div className="flex h-full min-h-[268px] w-full items-center justify-center bg-white">
              <Image
                src={item.logoUrl}
                alt={item.name}
                width={900}
                height={360}
                className="mx-auto max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 lg:mt-14">
        <SectionHeading>{locale === 'en' ? 'More Partners' : '更多合作伙伴'}</SectionHeading>
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
        <SectionHeading>{locale === 'en' ? 'Cooperation Fields' : '合作领域'}</SectionHeading>
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {fieldItems.map((item) => (
            <article
              key={item.id}
              className="flex min-h-[248px] flex-col items-center justify-center rounded-md border border-[#dcdfe6] bg-white px-7 py-8 text-center"
            >
              <div className="relative h-[88px] w-[108px]">
                <Image src={item.iconUrl} alt={item.title} fill sizes="108px" className="object-contain" />
              </div>
              <h3 className="mt-7 text-[20px] font-normal leading-[1.45] text-[#202020]">{item.title}</h3>
              <p className="mt-4 text-[15px] font-normal leading-[1.8] text-[#555555]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
