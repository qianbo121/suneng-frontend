import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export function buildPagination(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
