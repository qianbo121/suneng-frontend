import Image from 'next/image';

import { buildBrandImageAlt, joinImageAlt } from '@/lib/seo';
import { ServiceAdvantageCard } from '@/types/service-support';
import { Locale } from '@/types/site';

type ServiceAdvantagesProps = {
  locale: Locale;
  items: ServiceAdvantageCard[];
};

export function ServiceAdvantages({ locale, items }: ServiceAdvantagesProps) {
  return (
    <section>
      <div className="mb-8">
        <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">
          {locale === 'en' ? 'Service Advantages' : '服务优势'}
        </p>
        <h2 className="mt-3 text-[30px] font-semibold text-[#202020]">
          {locale === 'en' ? 'Reliable Support Capability' : '可靠服务能力'}
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden border border-[#e8ebf0] bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(14,33,60,0.08)]"
          >
            <div className="relative aspect-[16/10] bg-[#edf2f7]">
              <Image
                src={item.image}
                alt={joinImageAlt(locale, [item.title, item.content, buildBrandImageAlt(locale, 'short')])}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div className="px-6 py-6">
              <h3 className="text-[22px] font-semibold text-[#202020]">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-neutral-700">{item.content}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
