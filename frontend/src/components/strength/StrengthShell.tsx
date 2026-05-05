import { ReactNode } from 'react';

import { PageBanner } from '@/components/layout/PageBanner';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarItem } from '@/types/site';

type StrengthShellProps = {
  locale: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  bannerImage?: string;
  sidebarTitle: string;
  sidebarItems: SidebarItem[];
  children: ReactNode;
};

export function StrengthShell({
  locale,
  title,
  englishTitle,
  subtitle,
  bannerImage,
  sidebarTitle,
  sidebarItems,
  children,
}: StrengthShellProps) {
  return (
    <div className="space-y-10 pb-12 lg:space-y-12 lg:pb-16">
      <PageBanner
        locale={locale}
        title={title}
        englishTitle={englishTitle}
        subtitle={subtitle}
        backgroundImage={bannerImage}
      />
      <div className="mx-auto grid max-w-content gap-8 px-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <div className="lg:sticky lg:top-[108px] lg:self-start">
          <Sidebar title={sidebarTitle} items={sidebarItems} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
