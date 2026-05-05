'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

import { SidebarItem } from '@/types/site';
import { cn } from '@/lib/utils';

type SidebarProps = {
  title: string;
  items: SidebarItem[];
};

export function Sidebar({ title, items }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isEnglish = pathname.startsWith('/en');

  return (
    <aside className="rounded-[28px] border border-[rgba(0,75,151,0.08)] bg-white p-4 shadow-soft lg:p-5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-[22px] bg-brand-primary px-4 py-4 text-left text-white lg:cursor-default"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-white/58">
            {isEnglish ? 'Subnav' : '子导航'}
          </p>
          <p className="mt-1 text-lg font-semibold">{title}</p>
        </div>
        <HiChevronDown className={cn('text-xl transition-transform lg:hidden', open ? 'rotate-180' : '')} />
      </button>
      <div className={cn('space-y-2 pt-4', open ? 'block' : 'hidden lg:block')}>
        {items.map((item) => {
          const matchHrefs = item.matchHrefs ?? [];
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            matchHrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-[20px] border px-4 py-3 text-sm transition',
                active
                  ? 'border-brand-primary bg-[rgba(0,75,151,0.06)] font-medium text-brand-primary'
                  : 'border-slate-200 text-neutral-700 hover:border-brand-primary hover:text-brand-primary',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
