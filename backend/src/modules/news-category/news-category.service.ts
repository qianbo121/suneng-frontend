import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { slugifyText } from '@/common/utils/slug';
import { CreateNewsCategoryDto } from '@/modules/news-category/dto/create-news-category.dto';
import { NewsCategoryListQueryDto } from '@/modules/news-category/dto/news-category-list-query.dto';
import { UpdateNewsCategoryDto } from '@/modules/news-category/dto/update-news-category.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NewsCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  getPublicList() {
    return this.prisma.newsCategory.findMany({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async getAdminList(query: NewsCategoryListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.NewsCategoryWhereInput = {
      status: query.status,
      ...(query.keyword
        ? {
            OR: [
              { nameZh: { contains: query.keyword, mode: 'insensitive' } },
              { nameEn: { contains: query.keyword, mode: 'insensitive' } },
              { slug: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.newsCategory.findMany({ where, skip, take, orderBy }),
      this.prisma.newsCategory.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.newsCategory.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('News category not found');
    return record;
  }

  async create(dto: CreateNewsCategoryDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || dto.nameEn || dto.nameZh, 'news-category');
    return this.prisma.newsCategory.create({
      data: { ...dto, slug, sortOrder: dto.sortOrder ?? 0 },
    });
  }

  async update(id: number, dto: UpdateNewsCategoryDto) {
    const record = await this.findOne(id);
    const slug =
      dto.slug || dto.nameEn || dto.nameZh
        ? await this.ensureUniqueSlug(
            dto.slug || dto.nameEn || dto.nameZh || record.slug,
            'news-category',
            id,
          )
        : undefined;

    return this.prisma.newsCategory.update({
      where: { id },
      data: {
        ...dto,
        ...(slug ? { slug } : {}),
      },
    });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.newsCategory.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.newsCategory.delete({ where: { id } });
  }

  private async ensureUniqueSlug(source: string, fallback: string, excludeId?: number) {
    const baseSlug = slugifyText(source, fallback);
    let candidate = baseSlug;
    let index = 1;

    while (
      await this.prisma.newsCategory.findFirst({
        where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      candidate = `${baseSlug}-${index++}`;
    }

    return candidate;
  }
}
