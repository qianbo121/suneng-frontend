import Image from 'next/image';
import Link from 'next/link';

import { HomeSectionFallback } from '@/components/home/HomeSectionFallback';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ProductCategoryItem } from '@/types/home';
import { Locale } from '@/types/site';

type ProductGridProps = {
  locale: Locale;
  items: ProductCategoryItem[];
};

export function ProductGrid({ locale, items }: ProductGridProps) {
  return (
    <section className="mx-auto max-w-content px-4 lg:px-6">
      <SectionTitle
        eyebrow="product"
        title={locale === 'en' ? 'Product Series' : '产品系列'}
        align="center"
      />
      {items.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/products/detail/${item.slug}`}
              className="group overflow-hidden border border-[#e8ebf0] bg-white transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(14,33,60,0.08)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f6f8]">
                <Image
                  src={item.image}
                  alt={item.name[locale]}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-5 py-5 lg:px-6 lg:py-6">
                <h3 className="text-lg font-medium text-neutral-900">{item.name[locale]}</h3>
                <p className="mt-3 text-sm text-brand-primary">
                  {locale === 'en' ? 'View this series »' : '查看该产品系列 »'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <HomeSectionFallback locale={locale} type="empty" />
        </div>
      )}
    </section>
  );
}
