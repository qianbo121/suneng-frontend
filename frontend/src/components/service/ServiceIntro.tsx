import Image from 'next/image';

import { buildBrandImageAlt, joinImageAlt } from '@/lib/seo';

type ServiceIntroProps = {
  locale: 'zh' | 'en';
  title: string;
  content: string;
  image: string;
};

export function ServiceIntro({ locale, title, content, image }: ServiceIntroProps) {
  return (
    <section className="overflow-hidden border border-[#e8ebf0] bg-white shadow-soft">
      <div className="grid lg:grid-cols-[0.98fr_1.02fr]">
        <div className="px-8 py-9 lg:px-12 lg:py-12">
          <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">
            {locale === 'en' ? 'After-sales Service' : '售后服务'}
          </p>
          <h2 className="mt-4 text-[32px] font-semibold leading-tight text-[#202020] lg:text-[40px]">
            {title}
          </h2>
          <p className="mt-6 text-[15px] leading-8 text-neutral-700 lg:text-base">{content}</p>
        </div>
        <div className="relative min-h-[320px] bg-[#e8edf3] lg:min-h-[500px]">
          <Image
            src={image}
            alt={joinImageAlt(locale, [title, locale === 'en' ? 'after-sales service and technical support' : '售后服务与技术支持', buildBrandImageAlt(locale, 'short')])}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
