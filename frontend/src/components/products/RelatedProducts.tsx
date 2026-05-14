import Image from 'next/image';
import Link from 'next/link';

import { EmptyState } from '@/components/ui/EmptyState';
import { buildProductImageAlt } from '@/lib/seo';
import { ProductListCardItem } from '@/types/product';
import { Locale } from '@/types/site';

type RelatedProductsProps = {
  locale: Locale;
  items: ProductListCardItem[];
};

export function RelatedProducts({ locale, items }: RelatedProductsProps) {
  if (!items.length) {
    return (
      <EmptyState
        title={locale === 'en' ? 'No related products' : '暂无相关产品'}
        description={
          locale === 'en'
            ? 'The current product does not have related recommendations yet.'
            : '当前产品暂时没有同类推荐内容。'
        }
      />
    );
  }

  return (
    <section>
      <div className="mb-8">
        <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">
          {locale === 'en' ? 'Related Products' : '相关产品'}
        </p>
        <h2 className="mt-3 text-[30px] font-semibold text-[#202020]">
          {locale === 'en' ? 'Recommended Equipment' : '推荐设备'}
        </h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/${locale}/products/detail/${item.slug}`}
            className="group overflow-hidden border border-[#e8ebf0] bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(14,33,60,0.08)]"
          >
            <div className="relative aspect-[16/11] overflow-hidden bg-[#f3f5f8]">
              <Image
                src={item.image}
                alt={buildProductImageAlt(locale, item.name[locale], locale === 'en' ? 'recommended equipment' : '推荐设备')}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="px-5 py-5">
              <p className="text-[12px] uppercase tracking-[0.24em] text-neutral-400">{item.model}</p>
              <h3 className="mt-3 text-[18px] font-semibold leading-8 text-[#202020]">
                {item.name[locale]}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
