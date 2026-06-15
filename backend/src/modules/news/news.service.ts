import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';
import DOMPurify from 'isomorphic-dompurify';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { buildPagination } from '@/common/utils/pagination';
import { slugifyText } from '@/common/utils/slug';
import { BaiduSubmitService } from '@/modules/news/baidu-submit.service';
import { CreateNewsDto } from '@/modules/news/dto/create-news.dto';
import { NewsListQueryDto } from '@/modules/news/dto/news-list-query.dto';
import { UpdateNewsDto } from '@/modules/news/dto/update-news.dto';
import { NewsCategoryService } from '@/modules/news-category/news-category.service';
import { PrismaService } from '@/prisma/prisma.service';

type NewsPublishState = {
  id: number;
  status: PublishStatus;
  isPublished: boolean;
  slug: string;
  baiduSubmittedAt: Date | null;
};

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly baiduSubmittingNewsIds = new Set<number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly newsCategoryService: NewsCategoryService,
    private readonly baiduSubmitService: BaiduSubmitService,
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
    return record;
  }

  // View counting is decoupled from the (cacheable) detail read and driven by a
  // client-side ping, so caching the detail page does not suppress it. The
  // controller enforces per-viewer/day idempotency via cookie; increment:1 is
  // atomic at the row level. updateMany avoids throwing for stale/unpublished ids.
  async registerView(id: number): Promise<void> {
    await this.prisma.news.updateMany({
      where: { id, status: PublishStatus.published, isPublished: true },
      data: { viewCount: { increment: 1 } },
    });
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
    const categoryId = await this.resolveCategoryId(dto.categoryId);
    const slugSource = dto.slug || dto.titleEn || dto.titleZh;

    return this.persistWithUniqueSlug(slugSource, 'news', undefined, (slug) =>
      this.prisma.news.create({
        data: {
          ...dto,
          // Defense in depth: sanitize admin-authored HTML on write so a
          // stored payload cannot rely solely on the frontend sanitizer.
          ...(typeof dto.contentZh === 'string'
            ? { contentZh: DOMPurify.sanitize(dto.contentZh) }
            : {}),
          ...(typeof dto.contentEn === 'string'
            ? { contentEn: DOMPurify.sanitize(dto.contentEn) }
            : {}),
          categoryId,
          slug,
          isPublished: dto.isPublished ?? false,
          publishDate: dto.publishDate ? new Date(dto.publishDate) : undefined,
          sortOrder: dto.sortOrder ?? 0,
        },
      }),
    );
  }

  async update(id: number, dto: UpdateNewsDto) {
    const record = await this.findOne(id);
    const { categoryId: requestedCategoryId, ...newsData } = dto;
    const categoryId =
      requestedCategoryId !== undefined
        ? await this.resolveCategoryId(requestedCategoryId)
        : undefined;

    const baseData = {
      ...newsData,
      ...(typeof newsData.contentZh === 'string'
        ? { contentZh: DOMPurify.sanitize(newsData.contentZh) }
        : {}),
      ...(typeof newsData.contentEn === 'string'
        ? { contentEn: DOMPurify.sanitize(newsData.contentEn) }
        : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(dto.publishDate ? { publishDate: new Date(dto.publishDate) } : {}),
    };

    const slugSource = dto.slug || dto.titleEn || dto.titleZh;
    if (!slugSource) {
      return this.prisma.news.update({ where: { id }, data: baseData });
    }

    return this.persistWithUniqueSlug(slugSource || record.slug, 'news', id, (slug) =>
      this.prisma.news.update({ where: { id }, data: { ...baseData, slug } }),
    );
  }

  async updateStatus(id: number, status: PublishStatus) {
    const before = await this.prisma.news.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('News not found');

    const after = await this.prisma.news.update({
      where: { id },
      data: { status, isPublished: status === PublishStatus.published },
    });

    if (this.shouldSubmitToBaidu(before, after)) {
      void this.submitPublishedNewsToBaidu(after);
    }

    return after;
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

  // Race-safe write: ensureUniqueSlug picks a candidate, but a concurrent write
  // can take it between the check and the insert (TOCTOU). Catch the unique
  // violation and retry with a fresh slug instead of returning a 500.
  private async persistWithUniqueSlug<T>(
    source: string,
    fallback: string,
    excludeId: number | undefined,
    write: (slug: string) => Promise<T>,
  ): Promise<T> {
    let candidate = await this.ensureUniqueSlug(source, fallback, excludeId);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await write(candidate);
      } catch (error) {
        if (this.isSlugConflict(error) && attempt < 4) {
          candidate = await this.ensureUniqueSlug(
            `${candidate}-${attempt + 1}`,
            fallback,
            excludeId,
          );
          continue;
        }
        throw error;
      }
    }
    throw new Error('Unable to allocate a unique slug');
  }

  private isSlugConflict(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      return false;
    }
    const target = error.meta?.target;
    return Array.isArray(target) ? target.includes('slug') : String(target ?? '').includes('slug');
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

  private shouldSubmitToBaidu(before: NewsPublishState, after: NewsPublishState) {
    return (
      !this.isPubliclyVisible(before) &&
      this.isPubliclyVisible(after) &&
      Boolean(after.slug) &&
      !after.baiduSubmittedAt
    );
  }

  private isPubliclyVisible(news: NewsPublishState) {
    return news.status === PublishStatus.published && news.isPublished;
  }

  private async submitPublishedNewsToBaidu(news: NewsPublishState) {
    if (this.baiduSubmittingNewsIds.has(news.id)) return;

    this.baiduSubmittingNewsIds.add(news.id);
    try {
      const latest = await this.prisma.news.findUnique({
        where: { id: news.id },
        select: {
          id: true,
          status: true,
          isPublished: true,
          slug: true,
          baiduSubmittedAt: true,
        },
      });

      if (!latest || !this.isPubliclyVisible(latest) || !latest.slug || latest.baiduSubmittedAt) {
        return;
      }

      const url = this.baiduSubmitService.buildNewsUrl(latest.slug);
      const submitted = await this.baiduSubmitService.submitUrl(url);
      if (!submitted) return;

      await this.prisma.news.updateMany({
        where: { id: latest.id, baiduSubmittedAt: null },
        data: { baiduSubmittedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(
        `Baidu auto submit failed for news ${news.id}: ${this.getErrorMessage(error)}`,
      );
    } finally {
      this.baiduSubmittingNewsIds.delete(news.id);
    }
  }

  private getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
