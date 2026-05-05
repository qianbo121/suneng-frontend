import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { buildPagination } from '@/common/utils/pagination';
import { slugifyText } from '@/common/utils/slug';
import { CreateProductDto } from '@/modules/product/dto/create-product.dto';
import { ProductListQueryDto } from '@/modules/product/dto/product-list-query.dto';
import { UpdateProductDto } from '@/modules/product/dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicList(query: ProductListQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.ProductWhereInput = {
      status: PublishStatus.published,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  getHotList() {
    return this.prisma.product.findMany({
      where: { status: PublishStatus.published, isHot: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
      include: { category: true },
    });
  }

  async getPublicDetail(slug: string) {
    const record = await this.prisma.product.findFirst({
      where: { slug, status: PublishStatus.published },
      include: { category: true },
    });
    if (!record) throw new NotFoundException('Product not found');
    return record;
  }

  async getRelated(id: number) {
    const current = await this.prisma.product.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Product not found');
    return this.prisma.product.findMany({
      where: {
        categoryId: current.categoryId,
        status: PublishStatus.published,
        NOT: { id: current.id },
      },
      take: 6,
      orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
    });
  }

  async getAdminList(query: ProductListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.ProductWhereInput = {
      status: query.status,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(typeof query.isHot === 'boolean' ? { isHot: query.isHot } : {}),
      ...(query.keyword
        ? {
            OR: [
              { nameZh: { contains: query.keyword, mode: 'insensitive' } },
              { nameEn: { contains: query.keyword, mode: 'insensitive' } },
              { model: { contains: query.keyword, mode: 'insensitive' } },
              { slug: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!record) throw new NotFoundException('Product not found');
    return record;
  }

  async create(dto: CreateProductDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || dto.nameEn || dto.nameZh, 'product');
    const data: Prisma.ProductUncheckedCreateInput = {
      categoryId: dto.categoryId,
      nameZh: dto.nameZh,
      nameEn: dto.nameEn,
      model: dto.model,
      summaryZh: dto.summaryZh,
      summaryEn: dto.summaryEn,
      descriptionZh: dto.descriptionZh,
      descriptionEn: dto.descriptionEn,
      specsJson: dto.specsJson as Prisma.InputJsonValue | undefined,
      featuresJson: dto.featuresJson as Prisma.InputJsonValue | undefined,
      imagesJson: dto.imagesJson as Prisma.InputJsonValue | undefined,
      isHot: dto.isHot ?? false,
      slug,
      seoTitleZh: dto.seoTitleZh,
      seoTitleEn: dto.seoTitleEn,
      seoDescriptionZh: dto.seoDescriptionZh,
      seoDescriptionEn: dto.seoDescriptionEn,
      seoKeywordsZh: dto.seoKeywordsZh,
      seoKeywordsEn: dto.seoKeywordsEn,
      ogImage: dto.ogImage,
      sortOrder: dto.sortOrder ?? 0,
    };

    return this.prisma.product.create({
      data,
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const record = await this.findOne(id);
    const slug =
      dto.slug || dto.nameEn || dto.nameZh
        ? await this.ensureUniqueSlug(
            dto.slug || dto.nameEn || dto.nameZh || record.slug,
            'product',
            id,
          )
        : undefined;
    const data: Prisma.ProductUncheckedUpdateInput = {
      ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
      ...(dto.nameZh !== undefined ? { nameZh: dto.nameZh } : {}),
      ...(dto.nameEn !== undefined ? { nameEn: dto.nameEn } : {}),
      ...(dto.model !== undefined ? { model: dto.model } : {}),
      ...(dto.summaryZh !== undefined ? { summaryZh: dto.summaryZh } : {}),
      ...(dto.summaryEn !== undefined ? { summaryEn: dto.summaryEn } : {}),
      ...(dto.descriptionZh !== undefined ? { descriptionZh: dto.descriptionZh } : {}),
      ...(dto.descriptionEn !== undefined ? { descriptionEn: dto.descriptionEn } : {}),
      ...(dto.specsJson !== undefined ? { specsJson: dto.specsJson as Prisma.InputJsonValue } : {}),
      ...(dto.featuresJson !== undefined
        ? { featuresJson: dto.featuresJson as Prisma.InputJsonValue }
        : {}),
      ...(dto.imagesJson !== undefined
        ? { imagesJson: dto.imagesJson as Prisma.InputJsonValue }
        : {}),
      ...(dto.isHot !== undefined ? { isHot: dto.isHot } : {}),
      ...(dto.seoTitleZh !== undefined ? { seoTitleZh: dto.seoTitleZh } : {}),
      ...(dto.seoTitleEn !== undefined ? { seoTitleEn: dto.seoTitleEn } : {}),
      ...(dto.seoDescriptionZh !== undefined ? { seoDescriptionZh: dto.seoDescriptionZh } : {}),
      ...(dto.seoDescriptionEn !== undefined ? { seoDescriptionEn: dto.seoDescriptionEn } : {}),
      ...(dto.seoKeywordsZh !== undefined ? { seoKeywordsZh: dto.seoKeywordsZh } : {}),
      ...(dto.seoKeywordsEn !== undefined ? { seoKeywordsEn: dto.seoKeywordsEn } : {}),
      ...(dto.ogImage !== undefined ? { ogImage: dto.ogImage } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      ...(slug ? { slug } : {}),
    };

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }

  private async ensureUniqueSlug(source: string, fallback: string, excludeId?: number) {
    const baseSlug = slugifyText(source, fallback);
    let candidate = baseSlug;
    let index = 1;

    while (
      await this.prisma.product.findFirst({
        where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      candidate = `${baseSlug}-${index++}`;
    }

    return candidate;
  }
}
