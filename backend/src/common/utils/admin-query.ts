import { AdminListQueryDto } from '@/common/dto/admin-list-query.dto';
import { buildPagination } from '@/common/utils/pagination';

export function buildAdminListQuery(query: AdminListQueryDto, defaultSortBy = 'sortOrder') {
  const { page, pageSize, skip, take } = buildPagination(query);
  const sortBy = query.sortBy ?? defaultSortBy;
  const sortDirection = query.sortDirection ?? 'asc';

  return {
    page,
    pageSize,
    skip,
    take,
    orderBy: { [sortBy]: sortDirection } as Record<string, 'asc' | 'desc'>,
  };
}
