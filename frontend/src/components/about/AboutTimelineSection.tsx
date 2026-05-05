'use client';

import { motion } from 'framer-motion';

import { EmptyState } from '@/components/ui/EmptyState';
import { Locale } from '@/types/site';

type AboutTimelineSectionProps = {
  locale: Locale;
  items: Array<{
    id: number;
    year: number;
    title: string;
    content: string;
  }>;
};

export function AboutTimelineSection({ locale, items }: AboutTimelineSectionProps) {
  if (!items.length) {
    return (
      <EmptyState
        title={locale === 'en' ? 'Timeline is not available yet' : '发展历程暂未配置'}
        description={
          locale === 'en'
            ? 'No timeline data was returned from /api/v1/about.'
            : '当前接口未返回发展历程数据。'
        }
      />
    );
  }

  return (
    <section className="relative pl-8 lg:pl-12">
      <div className="absolute bottom-0 left-[15px] top-0 w-px bg-[#dbe3ec] lg:left-[23px]" />
      <div className="space-y-8">
        {items.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="relative border border-[#e8ebf0] bg-white px-7 py-7 shadow-soft"
          >
            <span className="absolute left-[-31px] top-9 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-brand-accent shadow-[0_10px_28px_rgba(230,0,18,0.18)] lg:left-[-39px]" />
            <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-brand-accent">
              {item.year}
            </p>
            <h2 className="mt-4 text-[24px] font-semibold text-[#202020]">{item.title}</h2>
            <p className="mt-4 text-[15px] leading-8 text-neutral-700">{item.content}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
