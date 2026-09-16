'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { useState } from 'react';
import styles from './AboutSubpages.module.css';

export function PartnerSearch({ query }: { query: string }) {
  const [value, setValue] = useState(query);
  const router = useRouter();
  return (
    <form action="/zh/partner" method="get" role="search" className={styles.search}>
      <input
        aria-label="搜索单位或主营产品"
        name="q"
        type="search"
        placeholder="搜索单位或主营产品"
        maxLength={120}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          if (query && !event.target.value) router.push('/zh/partner');
        }}
      />
      {query && (
        <Link className={styles.textLink} href="/zh/partner" aria-label="清空搜索">
          清空
        </Link>
      )}
      <button type="submit" aria-label="搜索合作单位">
        <HiMagnifyingGlass aria-hidden="true" size={21} />
      </button>
    </form>
  );
}
