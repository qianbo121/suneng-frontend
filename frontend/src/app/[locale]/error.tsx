'use client';

import { useEffect } from 'react';

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Catches render/data errors within a locale segment (e.g. an upstream API
// outage thrown by a page) so the user sees a retryable message instead of a
// crashed route — and, crucially, the failure is NOT cached as a 404.
export default function LocaleError({ error, reset }: LocaleErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[680px] px-6 py-24 text-center">
      <h1 className="text-[24px] font-semibold leading-[1.4] text-[#101828]">
        页面暂时无法加载 · Something went wrong
      </h1>
      <p className="mt-4 text-[15px] leading-[1.85] text-[#475467]">
        内容加载失败，请稍后重试。· This page failed to load. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-[42px] items-center justify-center rounded-[4px] bg-[#c51624] px-6 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]"
      >
        重试 · Retry
      </button>
    </div>
  );
}
