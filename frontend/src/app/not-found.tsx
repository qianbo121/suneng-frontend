import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { NotFoundState } from '@/components/common/NotFoundState';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { BaiduAnalytics } from '@/components/seo/BaiduAnalytics';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: { absolute: locale === 'en' ? 'Page Not Found | Suneng' : '页面未找到｜苏能工业炉' },
    robots: { index: false, follow: true },
  };
}

export default async function RootNotFoundPage() {
  // Use the same request locale that the existing language middleware resolves.
  // Metadata and the rendered navigation must agree before scripts run.
  const locale = await getLocale() === 'en' ? 'en' : 'zh';
  return (
    <html lang={locale === 'en' ? 'en' : 'zh-CN'}>
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
