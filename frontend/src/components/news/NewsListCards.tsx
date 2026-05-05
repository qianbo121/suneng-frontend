import Image from 'next/image';
import Link from 'next/link';
import { HiChevronLeft, HiChevronRight, HiClock } from 'react-icons/hi2';

import { EmptyState } from '@/components/ui/EmptyState';
import { formatNewsDisplayDate } from '@/lib/news';
import { cn } from '@/lib/utils';
import { NewsListCardItem } from '@/types/news';
import { Locale } from '@/types/site';

type NewsListCardsProps = {
  locale: Locale;
  items: NewsListCardItem[];
  page?: number;
  total?: number;
  pageSize?: number;
};

function NewsListItem({
  locale,
  item,
  last,
}: {
  locale: Locale;
  item: NewsListCardItem;
  last: boolean;
}) {
  return (
    <Link
      href={`/${locale}/news/${item.slug}`}
      className={cn(
        'group grid gap-7 py-[28px] transition md:grid-cols-[320px_minmax(0,1fr)] md:items-center lg:gap-[36px]',
        !last && 'border-b border-[#e2e2e2]',
      )}
    >
      <div className="relative aspect-[2/1] overflow-hidden rounded-[6px] bg-[#f3f3f3] md:h-[158px] md:aspect-auto">
        <Image
          src={item.image}
          alt={item.title[locale]}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="min-w-0">
        <h2 className="line-clamp-2 text-[22px] font-semibold leading-[1.45] text-[#202020] transition-colors group-hover:text-[var(--color-accent)]">
          {item.title[locale]}
        </h2>
        <p className="mt-[12px] line-clamp-2 text-[15px] font-normal leading-[1.85] text-[#777777] lg:text-[16px]">
          {item.summary[locale]}
        </p>
        <div className="mt-[18px] flex items-center gap-2 text-[15px] font-normal text-[#8b8b8b]">
          <HiClock className="h-[18px] w-[18px] text-[#9da3aa]" />
          <span>{formatNewsDisplayDate(item.date)}</span>
        </div>
      </div>
    </Link>
  );
}

function NewsPagination({
  locale,
  page,
  total,
  pageSize,
}: Required<Pick<NewsListCardsProps, 'locale' | 'page' | 'total' | 'pageSize'>>) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pages = Array.from({ length: Math.min(pageCount, 5) }, (_, index) => index + 1);

  if (pageCount <= 1) return null;

  return (
    <div className="mt-[24px] flex items-center justify-center gap-[14px]">
      <Link
        href={`/${locale}/news?page=${Math.max(1, page - 1)}`}
        aria-disabled={page <= 1}
        className={cn(
          'flex h-[38px] w-[38px] items-center justify-center rounded-[4px] border border-[#d8d8d8] bg-white text-[#777] transition',
          page <= 1
            ? 'pointer-events-none opacity-45'
            : 'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
        )}
      >
        <HiChevronLeft className="h-5 w-5" />
      </Link>
      {pages.map((item) => (
        <Link
          key={item}
          href={`/${locale}/news?page=${item}`}
          className={cn(
            'flex h-[38px] min-w-[38px] items-center justify-center rounded-[4px] border px-3 text-[16px] transition',
            page === item
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
              : 'border-[#d8d8d8] bg-white text-[#333] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
          )}
        >
          {item}
        </Link>
      ))}
      <Link
        href={`/${locale}/news?page=${Math.min(pageCount, page + 1)}`}
        aria-disabled={page >= pageCount}
        className={cn(
          'flex h-[38px] w-[38px] items-center justify-center rounded-[4px] border border-[#d8d8d8] bg-white text-[#777] transition',
          page >= pageCount
            ? 'pointer-events-none opacity-45'
            : 'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
        )}
      >
        <HiChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}

export function NewsListCards({ locale, items, page = 1, total = items.length, pageSize = 6 }: NewsListCardsProps) {
  const normalized = items.slice(0, pageSize);

  if (normalized.length === 0) {
    return (
      <EmptyState
        title={locale === 'en' ? 'No news found' : '暂无新闻数据'}
        description={
          locale === 'en'
            ? 'There are no published news articles yet.'
            : '当前还没有已发布的新闻内容。'
        }
      />
    );
  }

  return (
    <section>
      <div className="rounded-[10px] border border-[#d9d9d9] bg-white px-[28px] py-[8px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:px-[34px]">
        {normalized.map((item, index) => (
          <NewsListItem key={item.id} locale={locale} item={item} last={index === normalized.length - 1} />
        ))}
      </div>
      <NewsPagination locale={locale} page={page} total={total} pageSize={pageSize} />
    </section>
  );
}
