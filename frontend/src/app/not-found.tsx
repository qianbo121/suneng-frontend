import type { Metadata } from 'next';

import { NotFoundState } from '@/components/common/NotFoundState';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { BaiduAnalytics } from '@/components/seo/BaiduAnalytics';

export const metadata: Metadata = {
  title: { absolute: '页面未找到｜苏能工业炉' },
  robots: { index: false, follow: true },
};

export default function RootNotFoundPage() {
  // Next also evaluates the root fallback while preparing cached pages. Keep
  // it independent of request headers; unmatched URLs use global-not-found instead.
  const locale = 'zh';
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen text-neutral-900">
          <Header locale={locale} />
          <main className="min-h-[calc(100vh-520px)] pt-[78px] lg:pt-[88px]">
            <NotFoundState locale={locale} />
          </main>
          <Footer locale={locale} />
        </div>
        <BaiduAnalytics />
      </body>
    </html>
  );
}
