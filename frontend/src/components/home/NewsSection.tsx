import Image from 'next/image';
import Link from 'next/link';

import { SectionTitle } from '@/components/common/SectionTitle';
import { HomeSectionFallback } from '@/components/home/HomeSectionFallback';
import { NewsItem } from '@/types/home';
import { Locale } from '@/types/site';

type NewsSectionProps = {
  locale: Locale;
  items: NewsItem[];
};

function formatDate(input: string) {
  const date = new Date(input);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function NewsHeader({ locale }: { locale: Locale }) {
  return (
    <div className="mb-8 lg:mb-10">
      <div className="relative">
        <SectionTitle
          eyebrow="news center"
          title={locale === 'en' ? 'News Center' : '新闻中心'}
          align="center"
        />

        <Link
          href={`/${locale}/news`}
          className="mt-5 block text-right text-[16px] font-normal leading-none text-[#333333] transition-opacity hover:opacity-80 md:absolute md:right-0 md:top-[36px] md:mt-0"
        >
          {locale === 'en' ? (
            <>
              View More <span className="text-[#FF0000]">&gt;&gt;</span>
            </>
          ) : (
            <>
              查看更多 <span className="text-[#FF0000]">&gt;&gt;</span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
}

function FeaturedNewsCard({ locale, item }: { locale: Locale; item: NewsItem }) {
  return (
    <Link
      href={`/${locale}${item.href}`}
      className="group relative flex h-full min-h-[360px] overflow-hidden rounded-[12px] border border-black/10 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] xl:min-h-0"
    >
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={item.coverImage}
          alt={item.title[locale]}
          fill
          loading="eager"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 660px, 100vw"
        />
        <div className="absolute inset-x-0 bottom-0 bg-[rgba(0,0,0,0.6)] px-6 py-4">
          <p className="text-[12px] font-normal leading-none tracking-[0.02em] text-white/75">
            {formatDate(item.publishDate)}
          </p>
          <h3 className="mt-2 line-clamp-2 text-[18px] font-semibold leading-[1.5] text-white">
            {item.title[locale]}
          </h3>
        </div>
      </div>
    </Link>
  );
}

function SecondaryNewsCard({ locale, item }: { locale: Locale; item: NewsItem }) {
  return (
    <Link
      href={`/${locale}${item.href}`}
      className="group flex h-auto min-h-0 flex-col rounded-[12px] border border-black/10 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:bg-[#fafafa] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] xl:h-auto xl:flex-1 xl:flex-row xl:items-stretch"
    >
      <div className="relative w-full shrink-0 overflow-hidden rounded-[2px] xl:w-[200px]">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={item.coverImage}
            alt={item.title[locale]}
            fill
            loading="eager"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes="200px"
          />
        </div>
      </div>
      <div className="mt-3 flex min-w-0 flex-1 flex-col justify-start py-1 xl:ml-4 xl:mt-0">
        <p className="text-[12px] font-normal leading-none tracking-[0.02em] text-[#9AA0A6]">
          {formatDate(item.publishDate)}
        </p>
        <h4 className="mt-2 line-clamp-2 text-[18px] font-semibold leading-[1.55] text-[#333333]">
          {item.title[locale]}
        </h4>
        <p className="mt-2 line-clamp-2 overflow-hidden text-[14px] font-normal leading-[1.86] text-[#666666] xl:pr-2">
          {item.summary[locale]}
        </p>
      </div>
    </Link>
  );
}

export function NewsSection({ locale, items }: NewsSectionProps) {
  const normalized = items.slice(0, 4);
  const [featured, ...secondary] = normalized;

  if (!featured) {
    return (
      <section className="overflow-hidden bg-white py-14 lg:py-18">
        <div className="mx-auto w-full max-w-[1440px] px-4 md:px-5 lg:px-5 xl:px-4">
          <NewsHeader locale={locale} />
          <HomeSectionFallback locale={locale} type="empty" />
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden bg-white pb-14 pt-8 lg:pb-18 lg:pt-10">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-5 lg:px-5 xl:px-4">
        {/* News center module: title area + left featured card + right list cards */}
        <div className="px-0 py-0">
          <NewsHeader locale={locale} />

          <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(0,1fr)]">
            <div className="min-w-0 xl:h-full">
              <FeaturedNewsCard locale={locale} item={featured} />
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:flex xl:h-full xl:min-h-full xl:grid-cols-none xl:flex-col xl:gap-3 xl:py-3">
              {secondary.map((item) => (
                <SecondaryNewsCard key={item.id} locale={locale} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
