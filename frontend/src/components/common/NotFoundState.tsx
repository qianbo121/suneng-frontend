'use client';

import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/Button';

type NotFoundStateProps = {
  locale?: string;
};

export function NotFoundState({ locale }: NotFoundStateProps) {
  const pathname = usePathname();
  const currentLocale =
    locale || (pathname.startsWith('/en') ? 'en' : pathname.startsWith('/zh') ? 'zh' : 'zh');

  const copy =
    currentLocale === 'en'
      ? {
          title: 'Page Not Found',
          description:
            'Sorry, the page you are looking for does not exist or has been moved. You can return home, or continue browsing products and resources.',
          action: 'Back to Home',
          badge: '404 ERROR',
        }
      : {
          title: '页面未找到',
          description: '抱歉，您访问的页面不存在或已调整。您可以返回首页，或前往产品中心、资料中心继续浏览。',
          action: '返回首页',
          badge: '404 页面',
        };

  return (
    <section className="mx-auto max-w-content px-4 py-10 lg:px-6">
      <div className="rounded-[34px] border border-[rgba(0,75,151,0.08)] bg-white px-6 py-14 shadow-soft sm:px-10 lg:px-14">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex justify-center">
            <div className="relative flex h-[280px] w-full max-w-[440px] items-center justify-center rounded-[32px] bg-[linear-gradient(135deg,rgba(0,75,151,0.08),rgba(230,0,18,0.08))]">
              <div className="absolute left-8 top-8 h-16 w-16 rounded-full bg-[rgba(0,75,151,0.12)]" />
              <div className="absolute bottom-10 right-10 h-20 w-20 rounded-full bg-[rgba(230,0,18,0.12)]" />
              <div className="relative text-center">
                <p className="text-xs uppercase tracking-[0.38em] text-[rgba(0,75,151,0.56)]">{copy.badge}</p>
                <p className="mt-5 text-[88px] font-bold leading-none text-brand-primary">404</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-brand-accent">{copy.badge}</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-[0.04em] text-neutral-900 sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-neutral-700">{copy.description}</p>
            <div className="mt-8">
              <Button href={`/${currentLocale}`} size="lg">
                {copy.action}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
