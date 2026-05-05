'use client';

import { HiOutlineFlag, HiOutlineSparkles, HiOutlineStar } from 'react-icons/hi2';

import { EmptyState } from '@/components/ui/EmptyState';
import { CultureValueApiItem } from '@/types/about';
import { Locale } from '@/types/site';

type AboutCultureSectionProps = {
  locale: Locale;
  items: Array<{
    id: number;
    type: CultureValueApiItem['type'];
    title: string;
    content: string;
  }>;
};

function getCultureIcon(type: CultureValueApiItem['type']) {
  switch (type) {
    case 'mission':
      return HiOutlineFlag;
    case 'vision':
      return HiOutlineSparkles;
    default:
      return HiOutlineStar;
  }
}

function getCultureTypeLabel(locale: Locale, type: CultureValueApiItem['type']) {
  if (locale === 'en') {
    if (type === 'mission') return 'Mission';
    if (type === 'vision') return 'Vision';
    return 'Values';
  }

  if (type === 'mission') return '使命';
  if (type === 'vision') return '愿景';
  return '价值观';
}

export function AboutCultureSection({ locale, items }: AboutCultureSectionProps) {
  if (!items.length) {
    return (
      <EmptyState
        title={locale === 'en' ? 'Corporate culture is not available yet' : '企业文化内容暂未配置'}
        description={
          locale === 'en'
            ? 'No culture cards were returned from /api/v1/about.'
            : '当前接口未返回企业文化卡片内容。'
        }
      />
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = getCultureIcon(item.type);

        return (
          <article
            key={item.id}
            className="group border border-[#e8ebf0] bg-white px-7 py-8 transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(14,33,60,0.08)]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(0,75,151,0.08)] text-brand-primary">
              <Icon className="text-[28px]" />
            </div>
            <p className="mt-6 text-[12px] uppercase tracking-[0.28em] text-brand-accent">
              {getCultureTypeLabel(locale, item.type)}
            </p>
            <h2 className="mt-4 text-[24px] font-semibold text-[#202020]">{item.title}</h2>
            <p className="mt-5 text-[15px] leading-8 text-neutral-700">{item.content}</p>
          </article>
        );
      })}
    </section>
  );
}
