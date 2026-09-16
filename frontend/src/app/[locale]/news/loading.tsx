import { getLocale } from 'next-intl/server';

export default async function NewsLoading() {
  const locale = await getLocale();
  return (
    <div
      className="mx-auto min-h-[60vh] max-w-[1320px] px-5 py-12"
      role="status"
      aria-live="polite"
    >
      <p className="text-base text-slate-600">
        {locale === 'en' ? 'Loading resources…' : '正在加载技术资料…'}
      </p>
    </div>
  );
}
