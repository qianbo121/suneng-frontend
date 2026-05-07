import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { buildPagination } from '@/common/utils/pagination';
import { slugifyText } from '@/common/utils/slug';
import { CreateNewsDto } from '@/modules/news/dto/create-news.dto';
import { NewsListQueryDto } from '@/modules/news/dto/news-list-query.dto';
import { UpdateNewsDto } from '@/modules/news/dto/update-news.dto';
import { NewsCategoryService } from '@/modules/news-category/news-category.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly newsCategoryService: NewsCategoryService,
  ) {}

  async getPublicList(query: NewsListQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.NewsWhereInput = {
      status: PublishStatus.published,
      isPublished: true,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.news.findMany({
        where,
        skip,
        take,
        orderBy: [{ publishDate: 'desc' }, { sortOrder: 'asc' }, { id: 'desc' }],
        include: { category: true },
      }),
      this.prisma.news.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getPublicDetail(slug: string) {
    const record = await this.prisma.news.findFirst({
      where: { slug, status: PublishStatus.published, isPublished: true },
      include: { category: true },
    });
    if (!record) throw new NotFoundException('News not found');

    const updated = await this.prisma.news.update({
      where: { id: record.id },
      data: { viewCount: { increment: 1 } },
      include: { category: true },
    });

    return updated;
  }

  async getPrevNext(id: number) {
    const current = await this.prisma.news.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('News not found');

    const prev = await this.prisma.news.findFirst({
      where: {
        status: PublishStatus.published,
        isPublished: true,
        OR: [
          { publishDate: { gt: current.publishDate } },
          { publishDate: current.publishDate, id: { gt: current.id } },
        ],
      },
      orderBy: [{ publishDate: 'asc' }, { id: 'asc' }],
      select: { id: true, titleZh: true, titleEn: true, slug: true, publishDate: true },
    });

    const next = await this.prisma.news.findFirst({
      where: {
        status: PublishStatus.published,
        isPublished: true,
        OR: [
          { publishDate: { lt: current.publishDate } },
          { publishDate: current.publishDate, id: { lt: current.id } },
        ],
      },
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
      select: { id: true, titleZh: true, titleEn: true, slug: true, publishDate: true },
    });

    return { prev, next };
  }

  async getAdminList(query: NewsListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query, 'publishDate');
    const where: Prisma.NewsWhereInput = {
      status: query.status,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(typeof query.isPublished === 'boolean' ? { isPublished: query.isPublished } : {}),
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
        orderBy,
        include: { category: true },
      }),
      this.prisma.news.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.news.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!record) throw new NotFoundException('News not found');
    return record;
  }

  async create(dto: CreateNewsDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || dto.titleEn || dto.titleZh, 'news');
    const categoryId = await this.resolveCategoryId(dto.categoryId);

    return this.prisma.news.create({
      data: {
        ...dto,
        categoryId,
        slug,
        isPublished: dto.isPublished ?? false,
        publishDate: dto.publishDate ? new Date(dto.publishDate) : undefined,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: number, dto: UpdateNewsDto) {
    const record = await this.findOne(id);
    const { categoryId: requestedCategoryId, ...newsData } = dto;
    const categoryId =
      requestedCategoryId !== undefined ? await this.resolveCategoryId(requestedCategoryId) : undefined;
    const slug =
      dto.slug || dto.titleEn || dto.titleZh
        ? await this.ensureUniqueSlug(
            dto.slug || dto.titleEn || dto.titleZh || record.slug,
            'news',
            id,
          )
        : undefined;

    return this.prisma.news.update({
      where: { id },
      data: {
        ...newsData,
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(slug ? { slug } : {}),
        ...(dto.publishDate ? { publishDate: new Date(dto.publishDate) } : {}),
      },
    });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.news.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.news.delete({ where: { id } });
  }

  private async resolveCategoryId(categoryId?: number) {
    if (categoryId) {
      const category = await this.prisma.newsCategory.findUnique({ where: { id: categoryId } });
      if (category) return category.id;
    }

    const defaultCategoryId = await this.newsCategoryService.getDefaultCategoryId();
    if (!defaultCategoryId) {
      throw new Error('Default news category is missing');
    }

    return defaultCategoryId;
  }

  private async ensureUniqueSlug(source: string, fallback: string, excludeId?: number) {
    const baseSlug = slugifyText(source, fallback);
    let candidate = baseSlug;
    let index = 1;

    while (
      await this.prisma.news.findFirst({
        where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      candidate = `${baseSlug}-${index++}`;
    }

    return candidate;
  }
}
