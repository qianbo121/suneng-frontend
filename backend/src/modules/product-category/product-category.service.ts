import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { slugifyText } from '@/common/utils/slug';
import { CreateProductCategoryDto } from '@/modules/product-category/dto/create-product-category.dto';
import { ProductCategoryListQueryDto } from '@/modules/product-category/dto/product-category-list-query.dto';
import { UpdateProductCategoryDto } from '@/modules/product-category/dto/update-product-category.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProductCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  getPublicList() {
    return this.prisma.productCategory.findMany({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async getAdminList(query: ProductCategoryListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.ProductCategoryWhereInput = {
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
      this.prisma.productCategory.findMany({ where, skip, take, orderBy }),
      this.prisma.productCategory.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.productCategory.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Product category not found');
    return record;
  }

  async create(dto: CreateProductCategoryDto) {
    const slug = await this.ensureUniqueSlug(
      dto.slug || dto.nameEn || dto.nameZh,
      'product-category',
    );

    return this.prisma.productCategory.create({
      data: {
        ...dto,
        slug,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: number, dto: UpdateProductCategoryDto) {
    const record = await this.findOne(id);
    const slug =
      dto.slug || dto.nameEn || dto.nameZh
        ? await this.ensureUniqueSlug(
            dto.slug || dto.nameEn || dto.nameZh || record.slug,
            'product-category',
            id,
          )
        : undefined;

    return this.prisma.productCategory.update({
      where: { id },
      data: {
        ...dto,
        ...(slug ? { slug } : {}),
      },
    });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.productCategory.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.productCategory.delete({ where: { id } });
  }

  private async ensureUniqueSlug(source: string, fallback: string, excludeId?: number) {
    const baseSlug = slugifyText(source, fallback);
    let candidate = baseSlug;
    let index = 1;

    while (
      await this.prisma.productCategory.findFirst({
        where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      candidate = `${baseSlug}-${index++}`;
    }

    return candidate;
  }
}
