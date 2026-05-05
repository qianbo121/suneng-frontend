import { ProductSpecRow } from '@/types/product';
import { Locale } from '@/types/site';

type ProductSpecTableProps = {
  locale: Locale;
  items: ProductSpecRow[];
};

export function ProductSpecTable({ locale, items }: ProductSpecTableProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="border border-[#e8ebf0] bg-white">
      <div className="border-b border-[#edf0f4] px-6 py-5 lg:px-8">
        <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">
          {locale === 'en' ? 'Specifications' : '产品参数'}
        </p>
        <h2 className="mt-3 text-[28px] font-semibold text-[#202020]">
          {locale === 'en' ? 'Technical Parameters' : '技术参数'}
        </h2>
      </div>
      <div className="divide-y divide-[#edf0f4]">
        {items.map((item) => (
          <div key={`${item.key}-${item.value}`} className="grid gap-2 px-6 py-4 md:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
            <p className="text-sm font-medium text-neutral-500">{item.key}</p>
            <p className="text-sm leading-7 text-neutral-800">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
