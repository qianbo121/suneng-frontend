import Image from 'next/image';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { cn } from '@/lib/utils';

type PageBannerProps = {
  title: string;
  englishTitle?: string;
  subtitle?: string;
  locale?: string;
  backgroundImage?: string;
  className?: string;
  variant?: 'default' | 'about';
};

export function PageBanner({
  title,
  englishTitle = 'Corporate Website',
  subtitle,
  locale = 'zh',
  backgroundImage = '/images/about/about_img_hero_factory_01.png',
  className,
  variant = 'default',
}: PageBannerProps) {
  if (variant === 'about') {
    return (
      <section className={cn('relative w-full', className)}>
        <div className="relative h-[205px] overflow-hidden bg-[#0f2238] text-white lg:h-[325px]">
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative mx-auto flex h-full max-w-[1660px] items-center justify-center px-6 text-center lg:px-[86px]">
            <div className="max-w-[760px]">
              <h1 className="text-[36px] font-normal leading-none tracking-[0.02em] lg:text-[54px]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-5 text-[15px] font-normal leading-[1.7] text-white/86 lg:text-[18px]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('mx-auto max-w-content px-4 lg:px-6', className)}>
      <div className="relative overflow-hidden rounded-[34px] bg-brand-deep px-6 py-[6px] text-center text-white shadow-soft sm:px-10 lg:px-14 lg:py-[11px]">
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1200px, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,26,55,0.82)_0%,rgba(0,75,151,0.56)_55%,rgba(0,75,151,0.22)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(230,0,18,0.14),transparent_30%,transparent)]" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.36em] text-white/58">{englishTitle}</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-[0.06em] sm:text-[32px] lg:text-[42px]">
            {title}
          </h1>
          {subtitle ? <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76">{subtitle}</p> : null}
          <div className="mt-8 border-t border-white/16 pt-5">
            <Breadcrumb locale={locale} currentLabel={title} />
          </div>
        </div>
      </div>
    </section>
  );
}
