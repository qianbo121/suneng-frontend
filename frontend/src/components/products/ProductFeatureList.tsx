import { ProductFeatureItem } from '@/types/product';
import { Locale } from '@/types/site';

type ProductFeatureListProps = {
  locale: Locale;
  items: ProductFeatureItem[];
};

export function ProductFeatureList({ locale, items }: ProductFeatureListProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="border border-[#e8ebf0] bg-white">
      <div className="border-b border-[#edf0f4] px-6 py-5 lg:px-8">
        <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">
          {locale === 'en' ? 'Features' : '产品特点'}
        </p>
        <h2 className="mt-3 text-[28px] font-semibold text-[#202020]">
          {locale === 'en' ? 'Key Advantages' : '核心特点'}
        </h2>
      </div>
      <div className="grid gap-0 divide-y divide-[#edf0f4]">
        {items.map((item, index) => (
          <div key={`${item.content}-${index}`} className="grid gap-4 px-6 py-5 md:grid-cols-[40px_minmax(0,1fr)] lg:px-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,75,151,0.08)] text-sm font-semibold text-brand-primary">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              {item.title ? (
                <h3 className="text-lg font-semibold text-[#202020]">{item.title}</h3>
              ) : null}
              <p className="mt-2 text-sm leading-7 text-neutral-700">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
