'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Catches render/data errors within a locale segment (e.g. an upstream API
// outage thrown by a page) so the user sees a retryable message instead of a
// crashed route — and, crucially, the failure is NOT cached as a 404.
export default function LocaleError({ error }: LocaleErrorProps) {
  const english = useParams<{ locale: string }>().locale === 'en';
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[680px] px-6 py-24 text-center">
      <h1 className="text-[24px] font-semibold leading-[1.4] text-[#101828]">
        {english ? 'Something went wrong' : '页面暂时无法加载'}
      </h1>
      <p className="mt-4 text-[15px] leading-[1.85] text-[#475467]">
        {english ? 'This page failed to load. Please try again.' : '内容加载失败，请稍后重试。'}
      </p>
      <button
        type="button"
        // A server-rendered failure can remain in the router's payload after
        // reset(). Reload the current URL to request fresh server data.
        onClick={() => window.location.reload()}
        className="mt-6 inline-flex min-h-[42px] items-center justify-center rounded-[4px] cta-primary px-6 text-[14px] font-semibold text-white transition"
      >
        {english ? 'Retry' : '重试'}
      </button>
    </div>
  );
}
