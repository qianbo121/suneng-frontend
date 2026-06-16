'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiChevronRight } from 'react-icons/hi2';

import { getRouteLabelMap } from '@/mock/navigation';
import { Locale } from '@/types/site';
import { cn } from '@/lib/utils';

type BreadcrumbProps = {
  locale?: string;
  currentLabel?: string;
  className?: string;
  tone?: 'light' | 'dark';
  items?: BreadcrumbItem[];
};

type BreadcrumbItem = {
  label: string;
  href?: string;
};

function appendCurrentCrumb(items: BreadcrumbItem[], currentLabel?: string) {
  if (!currentLabel) return items;

  const lastItem = items.at(-1);

  if (lastItem?.label.trim() === currentLabel.trim()) {
    return items;
  }

  return [...items, { label: currentLabel }];
}

export function Breadcrumb({
  locale = 'zh',
  currentLabel,
  className,
  tone = 'light',
  items,
}: BreadcrumbProps) {
  const pathname = usePathname();
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const labelMap = getRouteLabelMap(currentLocale);
  const segments = pathname.split('/').filter(Boolean);
  const cleanSegments = segments[0] === 'zh' || segments[0] === 'en' ? segments.slice(1) : segments;
  const homeLabel = currentLocale === 'zh' ? '首页' : 'Home';
  const crumbs = items
    ? appendCurrentCrumb(items, currentLabel)
    : cleanSegments.map((segment, index) => {
        const href = `/${locale}/${cleanSegments.slice(0, index + 1).join('/')}`;
        const routePath = `/${cleanSegments.slice(0, index + 1).join('/')}`;

        return {
          href,
          label:
            index === cleanSegments.length - 1 && currentLabel
              ? currentLabel
              : labelMap.get(routePath) || decodeURIComponent(segment),
        };
      });

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex flex-wrap items-center gap-2 text-sm',
        tone === 'light' ? 'text-white/72' : 'text-neutral-500',
        className,
      )}
    >
      <Link
        href={`/${locale}`}
        className={cn('transition', tone === 'light' ? 'hover:text-white' : 'hover:text-brand-primary')}
      >
        {homeLabel}
      </Link>
      {crumbs.map((crumb, index) => {
        const isCurrent = index === crumbs.length - 1;

        return (
          <div key={`${crumb.href}-${index}`} className="flex items-center gap-2">
            <HiChevronRight
              className={cn('text-xs', tone === 'light' ? 'text-white/38' : 'text-neutral-300')}
            />
            {isCurrent ? (
              <span className={cn(tone === 'light' ? 'text-white' : 'text-neutral-900')}>
                {crumb.label}
              </span>
            ) : crumb.href ? (
              <Link
                href={crumb.href}
                className={cn('transition', tone === 'light' ? 'hover:text-white' : 'hover:text-brand-primary')}
              >
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
