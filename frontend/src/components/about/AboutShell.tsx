import { ReactNode } from 'react';
import Link from 'next/link';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageBanner } from '@/components/layout/PageBanner';
import { SidebarItem } from '@/types/site';
import { cn } from '@/lib/utils';

type AboutShellProps = {
  locale: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  bannerImage?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  sidebarTitle: string;
  sidebarItems: SidebarItem[];
  children: ReactNode;
};

export function AboutShell({
  locale,
  title,
  englishTitle,
  bannerImage,
  bannerTitle,
  bannerSubtitle,
  sidebarTitle,
  sidebarItems,
  children,
}: AboutShellProps) {
  const activeHref = sidebarItems.find((item) => item.label === title)?.href ?? sidebarItems[0]?.href;
  const isEnglish = locale === 'en';
  const aboutTitle = isEnglish ? 'About Us' : '关于我们';
  const aboutSubtitle = isEnglish
    ? 'Focused on industrial furnace R&D, manufacturing and system integration solutions'
    : '专注工业炉研发制造与系统集成解决方案';

  return (
    <div className="bg-white pb-2 lg:pb-6">
      <PageBanner
        locale={locale}
        title={bannerTitle ?? aboutTitle}
        englishTitle={englishTitle}
        subtitle={bannerSubtitle ?? aboutSubtitle}
        backgroundImage={bannerImage}
        variant="about"
      />

      <div className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex max-w-[1660px] flex-col gap-4 px-6 py-0 lg:flex-row lg:items-stretch lg:justify-between lg:px-[86px]">
          <div className="flex min-h-[54px] items-center">
            <Breadcrumb
              locale={locale}
              currentLabel={title}
              tone="dark"
              className="text-[13px]"
              items={[
                { label: aboutTitle, href: `/${locale}/about` },
                { label: title },
              ]}
            />
          </div>
          <nav aria-label={sidebarTitle} className="flex flex-wrap items-stretch justify-start lg:justify-end">
            {sidebarItems.map((item) => {
              const active = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex min-h-[48px] min-w-[140px] items-center justify-center border-l border-[#e5e5e5] px-8 text-[15px] font-normal transition last:border-r',
                    active
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-white text-[#333333] hover:bg-[#f7f7f7] hover:text-[var(--color-accent)]',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1660px] px-6 pt-7 lg:px-[86px] lg:pt-9">
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
