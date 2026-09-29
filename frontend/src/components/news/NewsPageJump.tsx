'use client';

import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import type { Locale } from '@/types/site';
import styles from './NewsPagination.module.css';

export function NewsPageJump({
  locale,
  page,
  pageCount,
  firstPageHref,
}: {
  locale: Locale;
  page: number;
  pageCount: number;
  firstPageHref: string;
}) {
  const english = locale === 'en';
  const id = useId();
  const link = useRef<HTMLAnchorElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(String(page));
  const [error, setError] = useState('');
  const target = Number(value);
  const valid =
    /^\d+$/.test(value) && Number.isSafeInteger(target) && target >= 1 && target <= pageCount;
  const [pathname, query = ''] = firstPageHref.split('?');
  const params = new URLSearchParams(query);
  params.delete('page');
  const fields = Array.from(params.entries());
  if (valid && target > 1) params.set('page', String(target));
  const search = params.toString();
  const targetHref = `${pathname}${search ? `?${search}` : ''}`;
  const showError = () => {
    setError(
      english ? `Enter a page from 1 to ${pageCount}.` : `请输入 1–${pageCount} 之间的整数页码`,
    );
    input.current?.focus();
  };

  return (
    <form
      className={styles.jumpForm}
      action={pathname}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        if (!valid) {
          showError();
          return;
        }
        setError('');
        // Reuse list click handling (including browser-local paging and focus),
        // or Next navigation when this is a server-rendered search result.
        link.current?.click();
      }}
    >
      {fields.map(([name, fieldValue]) => (
        <input key={name} type="hidden" name={name} value={fieldValue} />
      ))}
      <label htmlFor={id}>{english ? 'Go to' : '跳至'}</label>
      <input
        ref={input}
        id={id}
        className={styles.pageInput}
        name="page"
        type="number"
        inputMode="numeric"
        autoComplete="off"
        min={1}
        max={pageCount}
        step={1}
        required
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          setError('');
        }}
        onInvalid={(event) => {
          event.preventDefault();
          showError();
        }}
      />
      {!english && <span>页</span>}
      <button type="submit" className={`${styles.link} ${styles.edge}`}>
        {english ? 'Go' : '确定'}
      </button>
      <Link ref={link} href={targetHref} prefetch={false} hidden tabIndex={-1} aria-hidden="true">
        {english ? 'Go to page' : '跳转到指定页'}
      </Link>
      {error && (
        <span id={`${id}-error`} role="alert" className={styles.jumpError}>
          {error}
        </span>
      )}
    </form>
  );
}
