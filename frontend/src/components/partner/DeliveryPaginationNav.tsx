'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/components/ui/Pagination';

type DeliveryPaginationNavProps = {
  page: number;
  pageSize: number;
  total: number;
};

export function DeliveryPaginationNav({
  page,
  pageSize,
  total,
}: DeliveryPaginationNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={(nextPage) => {
        const params = new URLSearchParams(searchParams.toString());

        if (nextPage <= 1) {
          params.delete('page');
        } else {
          params.set('page', String(nextPage));
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      }}
    />
  );
}
