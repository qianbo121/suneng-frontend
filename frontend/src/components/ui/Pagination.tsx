'use client';

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

import { cn } from '@/lib/utils';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
};

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  const triggerChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    onPageChange?.(nextPage);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => triggerChange(page - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-neutral-700 transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
        disabled={page <= 1}
      >
        <HiChevronLeft />
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => triggerChange(item)}
          className={cn(
            'flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm transition',
            item === page
              ? 'border-brand-primary bg-brand-primary text-white'
              : 'border-slate-200 bg-white text-neutral-700 hover:border-brand-primary hover:text-brand-primary',
          )}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        onClick={() => triggerChange(page + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-neutral-700 transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
        disabled={page >= totalPages}
      >
        <HiChevronRight />
      </button>
    </div>
  );
}
