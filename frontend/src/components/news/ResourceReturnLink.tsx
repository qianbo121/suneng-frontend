'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import {
  requestResourceListRestore,
  resourceDetailHref,
  safeResourceListHref,
} from '@/lib/news-list-navigation';
import type { Locale } from '@/types/site';
import type { NewsContentType } from '@/lib/news-content-type';
import styles from './ResourceReturnLink.module.css';

export function ResourceReturnLink({
  locale = 'zh',
  contentType,
  children,
  plain = false,
}: {
  locale?: Locale;
  contentType: NewsContentType;
  children?: ReactNode;
  plain?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const fallback = `/${locale}/news?format=${contentType}`;
  const [href, setHref] = useState(fallback);
  useEffect(() => {
    setHref(
      safeResourceListHref(new URLSearchParams(location.search).get('returnTo'), locale) ??
        fallback,
    );
  }, [fallback, locale, pathname]);
  return (
    <Link
      href={href}
      className={plain ? styles.plain : styles.back}
      data-resource-return
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        const source = safeResourceListHref(
          new URLSearchParams(location.search).get('returnTo'),
          locale,
        );
        const target = source ?? fallback;
        requestResourceListRestore(target, Boolean(source));
        router.push(target, { scroll: false });
      }}
    >
      {!plain && <HiArrowLeft aria-hidden="true" />}
      {children ?? (locale === 'en' ? 'Back to list' : '返回列表')}
    </Link>
  );
}

export function ResourceDetailBreadcrumb({
  locale = 'zh',
  contentType,
}: {
  locale?: Locale;
  contentType: NewsContentType;
}) {
  return (
    <nav className={styles.breadcrumb} aria-label={locale === 'en' ? 'Breadcrumb' : '面包屑'}>
      <Link href={`/${locale}`}>{locale === 'en' ? 'Home' : '首页'}</Link>
      <span aria-hidden="true">/</span>
      <ResourceReturnLink locale={locale} contentType={contentType} plain>
        {locale === 'en' ? 'Resources' : '技术资料'}
      </ResourceReturnLink>
      <span aria-hidden="true">/</span>
      <span aria-current="page">
        {contentType === 'infographic'
          ? locale === 'en'
            ? 'Infographics'
            : '图文资料'
          : locale === 'en'
            ? 'Technical Articles'
            : '技术文章'}
      </span>
    </nav>
  );
}

// Continue reading without replacing the original list position with the
// article's scroll offset. Both kinds of resource use the same return context.
export function ResourceReadingLink({
  href,
  locale,
  className,
  children,
}: {
  href: string;
  locale: Locale;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [target, setTarget] = useState(href);
  useEffect(() => {
    const source = safeResourceListHref(
      new URLSearchParams(location.search).get('returnTo'),
      locale,
    );
    setTarget(source ? resourceDetailHref(href, source) : href);
  }, [href, locale, pathname]);
  return (
    <Link
      href={target}
      className={className}
      onNavigate={() => window.scrollTo({ top: 0, behavior: 'instant' })}
    >
      {children}
    </Link>
  );
}
