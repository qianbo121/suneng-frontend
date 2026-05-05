import Link from 'next/link';

import { ContactBarContent } from '@/types/home';
import { Locale } from '@/types/site';

type ContactBarProps = {
  locale: Locale;
  content: ContactBarContent;
};

export function ContactBar({ locale, content }: ContactBarProps) {
  return (
    <section className="bg-[#18345a] py-6 text-white lg:py-7">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:flex lg:items-center lg:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/48">
              {content.hotlineLabel[locale]}
            </p>
            <p className="mt-2 text-[28px] font-semibold leading-none">{content.hotline}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/48">
              {content.addressLabel[locale]}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/80">
              {content.address[locale]}
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}${content.buttonHref}`}
          className="inline-flex min-h-[46px] items-center justify-center rounded-sm bg-brand-accent px-8 text-sm font-medium text-white transition hover:bg-[#c80010]"
        >
          {content.buttonLabel[locale]}
        </Link>
      </div>
    </section>
  );
}
