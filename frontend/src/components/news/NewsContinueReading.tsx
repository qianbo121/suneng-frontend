import Link from 'next/link';

import type { NewsContinueReadingCandidate } from '@/lib/news-continue-reading';
import type { Locale } from '@/types/site';

type NewsContinueReadingProps = {
  items: NewsContinueReadingCandidate[];
  locale: Locale;
};

export function NewsContinueReading({ items, locale }: NewsContinueReadingProps) {
  if (!items.length) return null;

  const heading = locale === 'en' ? 'Continue reading' : '继续阅读';
  const viewAllLabel = locale === 'en' ? 'View all articles' : '查看全部文章';

  return (
    <aside
      aria-labelledby="news-continue-reading-title"
      className="mx-auto mt-8 max-w-[1060px] border-t border-[#dfe3e8] pt-6"
    >
      <div className="flex items-end justify-between gap-5">
        <h2
          id="news-continue-reading-title"
          className="text-[24px] font-semibold leading-[1.35] text-[#101828]"
        >
          {heading}
        </h2>
        <Link
          href={`/${locale}/news`}
          className="shrink-0 rounded-[3px] text-[14px] font-medium text-[#475467] transition-colors duration-200 hover:text-[#3370ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3370ff]"
        >
          {viewAllLabel}
        </Link>
      </div>

      <div className="mt-4 grid border-t border-[#e4e7ec] md:grid-cols-2 md:gap-x-10">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/${locale}/news/${item.slug}`}
            className="group flex min-h-[76px] min-w-0 touch-manipulation items-center border-b border-[#e4e7ec] px-1 py-4 text-[#344054] transition-colors duration-200 hover:text-[#3370ff] focus-visible:z-10 focus-visible:rounded-[3px] focus-visible:text-[#3370ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3370ff]"
          >
            <span className="line-clamp-2 min-w-0 text-[17px] font-medium leading-[1.6] [line-break:strict] [overflow-wrap:break-word] [text-wrap:pretty]">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
