import { Injectable } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildPagination } from '@/common/utils/pagination';
import { ShujuNewsReadQueryDto } from '@/modules/shuju-service/dto/shuju-news-read-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ShujuNewsReadService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ShujuNewsReadQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.NewsWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.keyword
        ? {
            OR: [
              { titleZh: { contains: query.keyword, mode: 'insensitive' } },
              { titleEn: { contains: query.keyword, mode: 'insensitive' } },
              { slug: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.news.findMany({
        where,
        skip,
        take,
        orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          titleZh: true,
          titleEn: true,
          summaryZh: true,
          coverImage: true,
          publishDate: true,
          slug: true,
          isPublished: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, nameZh: true, slug: true } },
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async listCategories() {
    return this.prisma.newsCategory.findMany({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: { id: true, nameZh: true, slug: true },
    });
  }
}
