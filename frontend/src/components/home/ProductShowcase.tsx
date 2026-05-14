'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { HomeSectionFallback } from '@/components/home/HomeSectionFallback';
import { SectionTitle } from '@/components/common/SectionTitle';
import { cn } from '@/lib/utils';
import { buildProductImageAlt } from '@/lib/seo';
import { ProductShowcaseItem } from '@/types/home';
import { Locale } from '@/types/site';

type ProductShowcaseProps = {
  locale: Locale;
  items: ProductShowcaseItem[];
};

export function ProductShowcase({ locale, items }: ProductShowcaseProps) {
  return (
    <section className="bg-[#f7f7f7] py-16 lg:py-20">
      <div className="mx-auto max-w-content px-4 lg:px-6">
        <SectionTitle
          eyebrow="product display"
          title={locale === 'en' ? 'Featured Product Display' : '重点产品展示'}
          align="center"
        />
        {items.length ? (
          <div className="mt-10 space-y-6 lg:mt-14 lg:space-y-8">
            {items.slice(0, 4).map((item, index) => {
              const reversed = index % 2 === 1;

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.24 }}
                  transition={{ duration: 0.42, ease: 'easeOut' }}
                  className="grid overflow-hidden bg-white lg:grid-cols-2"
                >
                  <div className={reversed ? 'order-2 lg:order-1' : ''}>
                    <div className="relative min-h-[320px] bg-[#dce5ef] sm:min-h-[360px] lg:min-h-[470px]">
                      <Image
                        src={item.image}
                        alt={buildProductImageAlt(locale, item.name[locale], item.description[locale])}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex items-center bg-white px-8 py-10 lg:px-14 lg:py-14',
                      reversed ? 'order-1 lg:order-2' : '',
                    )}
                  >
                    <div className="max-w-[520px]">
                      <p className="text-[72px] font-semibold leading-none text-[#f1f1f1] lg:text-[112px]">
                        0{index + 1}
                      </p>
                      <p className="mt-3 text-[12px] uppercase tracking-[0.3em] text-brand-accent">
                        {item.name.en}
                      </p>
                      <h3 className="mt-4 text-[28px] font-semibold tracking-[0.03em] text-[#222] lg:text-[34px]">
                        {item.name[locale]}
                      </h3>
                      <p className="mt-5 text-[15px] leading-8 text-neutral-600 lg:text-[16px]">
                        {item.description[locale]}
                      </p>
                      <div className="mt-8">
                        <Link
                          href={`/${locale}${item.href}`}
                          className="inline-flex min-h-[46px] items-center justify-center rounded-sm bg-brand-accent px-7 text-sm font-medium text-white transition hover:bg-[#c80010]"
                        >
                          {locale === 'en' ? 'View this product series' : '查看该产品系列'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10">
            <HomeSectionFallback locale={locale} type="empty" />
          </div>
        )}
      </div>
    </section>
  );
}
