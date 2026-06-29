import type { CSSProperties, ReactNode } from 'react';

import { QuoteModalButton } from '@/components/lead/QuoteModalButton';
import { cn } from '@/lib/utils';
import { siteSettings } from '@/mock/siteSettings';

export type GeoFaqItem = {
  question: string;
  answer: ReactNode;
};

export function GeoSection({
  id,
  eyebrow,
  title,
  children,
  eyebrowClassName,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  eyebrowClassName?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[#e2e8f0] py-12 lg:py-16">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        {eyebrow ? (
          <p className={cn('text-[13px] font-semibold text-[#c51624]', eyebrowClassName)}>{eyebrow}</p>
        ) : null}
        <h2 className={cn('text-[26px] font-semibold leading-[1.28] text-[#101828] lg:text-[38px]', eyebrow && 'mt-3')}>
          {title}
        </h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export function GeoHeroTags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3 text-[14px] font-semibold text-white">
      {tags.map((tag) => (
        <span key={tag} className="rounded-[4px] border border-white/24 bg-white/10 px-4 py-2">
          {tag}
        </span>
      ))}
    </div>
  );
}

export function GeoBulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-[#3f4a5f] lg:text-[16px]">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="mt-[0.74em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c51624]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function GeoFactList({
  items,
  labelWidth = '120px',
}: {
  items: Array<readonly [string, ReactNode] | string[]>;
  labelWidth?: string;
}) {
  return (
    <dl className="grid gap-3">
      {items.map(([label, value]) => (
        <div
          key={String(label)}
          className="grid gap-1 border-b border-[#e7edf5] pb-3 last:border-b-0 sm:grid-cols-[var(--label-width)_1fr]"
          style={{ '--label-width': labelWidth } as CSSProperties}
        >
          <dt className="text-[13px] font-semibold text-[#667085]">{label}</dt>
          <dd className="text-[15px] leading-[1.75] text-[#253047]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function GeoFaqGrid({
  items,
  openMode = 'all',
}: {
  items: GeoFaqItem[];
  openMode?: 'all' | 'first';
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 md:items-start md:gap-5" itemScope itemType="https://schema.org/FAQPage">
      {items.map((faq, index) => (
        <details
          key={faq.question}
          className="group rounded-[8px] border border-[#dfe6f0] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,35,75,0.03)] [&>summary::-webkit-details-marker]:hidden"
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/Question"
          open={openMode === 'all' || index === 0}
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] font-semibold leading-[1.6] text-[#101828]" itemProp="name">
            <span>{faq.question}</span>
            <span
              aria-hidden="true"
              className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#dfe6f0] group-open:hidden"
            >
              <span className="absolute h-[2px] w-3 rounded-full bg-[#c51624]" />
              <span className="absolute h-3 w-[2px] rounded-full bg-[#c51624]" />
            </span>
            <span
              aria-hidden="true"
              className="relative mt-1 hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#dfe6f0] group-open:flex"
            >
              <span className="absolute h-[2px] w-3 rounded-full bg-[#c51624]" />
            </span>
          </summary>
          <div className="mt-4 border-t border-[#edf1f6] pt-4" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <div className="text-[15px] leading-[1.9] text-[#344054]" itemProp="text">
              {faq.answer}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

export function GeoContactCta({
  eyebrow,
  title,
  description,
  secondaryHref,
  secondaryLabel,
  primaryLabel = '获取报价方案',
}: {
  eyebrow: string;
  title: string;
  description: string;
  secondaryHref: string;
  secondaryLabel: string;
  primaryLabel?: string;
}) {
  return (
    <section id="contact" className="border-t border-[#e2e8f0] bg-[#101828] py-12 text-white lg:py-16">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
        <div>
          <p className="text-[13px] font-semibold text-white/58">{eyebrow}</p>
          <h2 className="mt-3 text-[28px] font-semibold leading-[1.28] lg:text-[42px]">{title}</h2>
          <p className="mt-5 max-w-[820px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
            {description}
          </p>
          <address className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px] leading-[1.8] text-white/82 not-italic">
            <span>电话 / 微信：{siteSettings.salesPhone}</span>
            <span>邮箱：{siteSettings.email}</span>
          </address>
        </div>
        <div className="flex flex-wrap gap-4 lg:justify-end">
          <QuoteModalButton
            label={primaryLabel}
            className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
          />
          <a
            href={secondaryHref}
            className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] border border-white/46 px-6 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
