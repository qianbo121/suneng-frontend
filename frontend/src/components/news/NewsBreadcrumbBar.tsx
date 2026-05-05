import { Breadcrumb } from '@/components/layout/Breadcrumb';

type NewsBreadcrumbBarProps = {
  locale: string;
  currentLabel: string;
  items?: Array<{
    label: string;
    href?: string;
  }>;
};

export function NewsBreadcrumbBar({ locale, currentLabel, items }: NewsBreadcrumbBarProps) {
  return (
    <div className="border-b border-[#e5e5e5] bg-white">
      <div className="mx-auto flex min-h-[54px] max-w-[1660px] items-center px-6 lg:px-[86px]">
        <Breadcrumb
          locale={locale}
          currentLabel={currentLabel}
          tone="dark"
          className="text-[13px]"
          items={items}
        />
      </div>
    </div>
  );
}
