import Image from 'next/image';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageBanner } from '@/components/layout/PageBanner';

export type NavigationHubCard = {
  title: string;
  description: string;
  href: string;
  label?: string;
  image?: string;
  imageAlt?: string;
  note?: string;
};

export type NavigationHubSection = {
  id?: string;
  title: string;
  description?: string;
  cards: NavigationHubCard[];
};

type NavigationHubPageProps = {
  title: string;
  englishTitle: string;
  subtitle: string;
  heroImage: string;
  introTitle: string;
  intro: string;
  quickLinks?: Array<{ title: string; description: string; href: string }>;
  sections: NavigationHubSection[];
  ctaTitle: string;
  ctaDescription: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function NavigationHubPage({
  title,
  englishTitle,
  subtitle,
  heroImage,
  introTitle,
  intro,
  quickLinks,
  sections,
  ctaTitle,
  ctaDescription,
  primaryHref = '/zh/inquiry',
  primaryLabel = '提交项目情况',
  secondaryHref = '/zh/products',
  secondaryLabel = '查看产品中心',
}: NavigationHubPageProps) {
  return (
    <main className="bg-[#f6f8fb] text-[#172033]">
      <PageBanner
        locale="zh"
        title={title}
        englishTitle={englishTitle}
        subtitle={subtitle}
        backgroundImage={heroImage}
        variant="compact"
      />

      <div className="border-b border-[#e5e9f0] bg-white">
        <div className="mx-auto flex min-h-[42px] max-w-[1660px] items-center px-6 lg:px-[86px]">
          <Breadcrumb locale="zh" currentLabel={title} tone="dark" className="text-[13px]" />
        </div>
      </div>

      <section className="bg-white px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[13px] font-semibold tracking-[0.2em] text-brand-primary">
            江苏苏能工业炉
          </p>
          <h2 className="mt-4 max-w-[860px] text-pretty text-[30px] font-semibold leading-[1.35] text-[#071a3d] lg:text-[40px]">
            {introTitle}
          </h2>
          <p className="mt-5 max-w-[920px] text-[16px] leading-[1.9] text-[#4b5870] lg:text-[18px]">
            {intro}
          </p>
          {quickLinks && (
            <nav aria-label="按当前问题找指南" className="mt-7 grid gap-4 md:grid-cols-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[6px] border border-[#dfe5ed] bg-[#f6f8fb] p-5 transition-colors hover:border-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
                >
                  <span className="block text-[18px] font-semibold text-[#14233d]">
                    {item.title}
                  </span>
                  <span className="mt-2 block text-[15px] leading-[1.8] text-[#5a6578]">
                    {item.description}
                  </span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      {sections.map((section, sectionIndex) => (
        <section
          key={section.title}
          id={section.id}
          className={`scroll-mt-28 px-6 py-12 lg:px-10 lg:py-16 ${sectionIndex % 2 === 0 ? 'bg-[#f6f8fb]' : 'bg-white'}`}
        >
          <div className="mx-auto max-w-[1180px]">
            <header className="max-w-[840px]">
              <h2 className="text-pretty text-[27px] font-semibold leading-[1.4] text-[#071a3d] lg:text-[34px]">
                {section.title}
              </h2>
              {section.description ? (
                <p className="mt-3 text-[15px] leading-[1.85] text-[#5b667a] lg:text-[17px]">
                  {section.description}
                </p>
              ) : null}
            </header>

            <div
              className={`mt-8 grid gap-5 md:grid-cols-2 ${section.cards.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}
            >
              {section.cards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-[6px] border border-[#dfe5ed] bg-white shadow-[0_8px_24px_rgba(15,35,75,0.04)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-[0_14px_30px_rgba(15,35,75,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {card.image ? (
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#eaf0f7]">
                      <Image
                        src={card.image}
                        alt={card.imageAlt ?? ''}
                        fill
                        sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) 50vw, 380px"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                      />
                    </div>
                  ) : null}

                  <div className="flex h-full flex-col p-6">
                    {card.label ? (
                      <p className="text-[12px] font-semibold tracking-[0.16em] text-brand-primary">
                        {card.label}
                      </p>
                    ) : null}
                    <h3 className="mt-2 text-pretty text-[20px] font-semibold leading-[1.45] text-[#14233d] transition-colors duration-200 group-hover:text-brand-primary">
                      {card.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[15px] leading-[1.8] text-[#5a6578]">
                      {card.description}
                    </p>
                    {card.note ? (
                      <p className="mt-4 border-t border-[#e7ebf1] pt-4 text-[13px] leading-[1.7] text-[#788397]">
                        {card.note}
                      </p>
                    ) : null}
                    <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-brand-primary">
                      查看详情
                      <HiArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="bg-[#071a3d] px-6 py-12 text-white lg:px-10 lg:py-16">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[760px]">
            <h2 className="text-pretty text-[28px] font-semibold leading-[1.4] lg:text-[36px]">
              {ctaTitle}
            </h2>
            <p className="mt-3 text-[16px] leading-[1.8] text-white/76">{ctaDescription}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <Link
              href={primaryHref}
              className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#a90f1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/42 px-6 text-[15px] font-semibold text-white transition-colors duration-200 hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
