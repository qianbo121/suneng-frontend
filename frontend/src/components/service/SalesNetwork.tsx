import { SalesOutletApiItem } from '@/types/service-support';
import { Locale } from '@/types/site';

type SalesNetworkProps = {
  locale: Locale;
  items: SalesOutletApiItem[];
};

function localize(locale: Locale, zh?: string | null, en?: string | null, fallback = '') {
  return locale === 'en' ? en || zh || fallback : zh || en || fallback;
}

function getMarkerPosition(item: SalesOutletApiItem, index: number) {
  if (typeof item.lng === 'number' && typeof item.lat === 'number') {
    const left = ((item.lng - 73) / (135 - 73)) * 100;
    const top = (1 - (item.lat - 18) / (54 - 18)) * 100;
    return {
      left: `${Math.max(8, Math.min(92, left))}%`,
      top: `${Math.max(12, Math.min(88, top))}%`,
    };
  }

  const fallbackPositions = [
    { left: '68%', top: '33%' },
    { left: '62%', top: '45%' },
    { left: '54%', top: '40%' },
    { left: '74%', top: '52%' },
    { left: '46%', top: '56%' },
    { left: '58%', top: '64%' },
  ];

  return fallbackPositions[index % fallbackPositions.length];
}

export function SalesNetwork({ locale, items }: SalesNetworkProps) {
  return (
    <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="overflow-hidden border border-[#e8ebf0] bg-white shadow-soft">
        <div className="border-b border-[#edf0f4] px-6 py-5 lg:px-8">
          <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">
            {locale === 'en' ? 'Sales Network' : '销售网络'}
          </p>
          <h2 className="mt-3 text-[30px] font-semibold text-[#202020]">
            {locale === 'en' ? 'Coverage Overview' : '覆盖区域概览'}
          </h2>
        </div>
        <div className="relative aspect-[4/3] bg-[linear-gradient(180deg,#f7fafc_0%,#edf2f7_100%)]">
          <svg viewBox="0 0 800 560" className="h-full w-full">
            <path
              d="M168 142l79-40 74 12 55-34 59 8 48 29 63 7 28 44-15 56 31 43-24 59-72 27-41 42-76-9-40 30-89-7-63-51-57-9-26-49 13-55-28-49 26-54 55-19z"
              fill="#dfe8f2"
              stroke="#c7d3df"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M558 409l28 12 16 24-9 25-28 7-24-16 1-27 16-25z"
              fill="#dfe8f2"
              stroke="#c7d3df"
              strokeWidth="6"
            />
          </svg>
          {items.slice(0, 8).map((item, index) => {
            const position = getMarkerPosition(item, index);

            return (
              <div
                key={item.id}
                className="absolute"
                style={{ left: position.left, top: position.top }}
              >
                <span className="absolute -left-1.5 -top-1.5 flex h-4 w-4 animate-pulse rounded-full bg-brand-accent/25" />
                <span className="relative block h-3 w-3 rounded-full bg-brand-accent shadow-[0_0_0_6px_rgba(230,0,18,0.12)]" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.3em] text-brand-accent">
            {locale === 'en' ? 'Outlet List' : '网点列表'}
          </p>
          <h2 className="mt-3 text-[30px] font-semibold text-[#202020]">
            {locale === 'en' ? 'Regional Support Points' : '区域服务网点'}
          </h2>
        </div>
        <div className="space-y-4">
          {items.length ? (
            items.map((item) => (
              <article
                key={item.id}
                className="border border-[#e8ebf0] bg-white px-6 py-5 shadow-soft"
              >
                <h3 className="text-[20px] font-semibold text-[#202020]">
                  {[localize(locale, item.regionZh, item.regionEn), localize(locale, item.cityZh, item.cityEn)]
                    .filter(Boolean)
                    .join(' / ')}
                </h3>
                <p className="mt-3 text-sm leading-7 text-neutral-700">
                  {localize(locale, item.addressZh, item.addressEn)}
                </p>
                {item.phone ? (
                  <p className="mt-3 text-sm font-medium text-brand-primary">{item.phone}</p>
                ) : null}
              </article>
            ))
          ) : (
            <article className="border border-dashed border-[#d7dfe8] bg-white px-6 py-8 text-sm text-neutral-600">
              {locale === 'en'
                ? 'No sales network data is available yet.'
                : '当前暂无销售网络数据。'}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
