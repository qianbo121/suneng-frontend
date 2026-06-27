import { ReactNode } from 'react';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/JsonLd';
import { FloatToolbar } from '@/components/layout/FloatToolbar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { BaiduAnalytics } from '@/components/seo/BaiduAnalytics';
import { routing } from '@/i18n/routing';
import { getOrganizationJsonLd, getWebsiteJsonLd } from '@/lib/seo/jsonld';
import type { Locale } from '@/types/site';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const currentLocale = locale as Locale;
  const htmlLang = locale === 'en' ? 'en' : 'zh-CN';

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen bg-white pb-[72px] text-neutral-900 xl:pb-0">
            <Header locale={locale} />
            <main className="min-h-[calc(100vh-520px)] bg-white">
              {children}
            </main>
            <Footer locale={locale} />
            <FloatToolbar locale={locale} />
          </div>
        </NextIntlClientProvider>
        <JsonLd id="organization-jsonld" data={getOrganizationJsonLd(currentLocale)} />
        <JsonLd id="website-jsonld" data={getWebsiteJsonLd(currentLocale)} />
        <BaiduAnalytics />
      </body>
    </html>
  );
}
