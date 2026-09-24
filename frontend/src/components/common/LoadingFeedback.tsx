import type { Locale } from '@/types/site';

export function LoadingFeedback({ locale, resource = false }: { locale: Locale; resource?: boolean }) {
  const english = locale === 'en';

  return (
    <div className="py-6 text-center text-[15px] leading-6 text-[#475467]">
      <p role="status" aria-live="polite">
        {resource
          ? english ? 'Loading resources…' : '正在加载技术资料…'
          : english ? 'Loading page…' : '正在加载页面…'}
      </p>
      {/* An empty href reloads the current URL, including its search parameters.
          Native navigation works even if the pending response has not hydrated. */}
      <a
        href=""
        className="mt-3 inline-flex min-h-11 items-center rounded px-5 font-semibold text-[#145ca8] underline underline-offset-4 hover:bg-[#eff6ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {english ? 'Reload page' : '重新加载'}
      </a>
    </div>
  );
}
