import { ReactNode } from 'react';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { FloatToolbar } from '@/components/layout/FloatToolbar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { routing } from '@/i18n/routing';

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

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-white text-neutral-900">
        <Header locale={locale} />
        <main className="min-h-[calc(100vh-520px)] bg-white pb-[88px] xl:pb-0">
          {children}
        </main>
        <Footer locale={locale} />
        <FloatToolbar locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
