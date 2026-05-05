import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { CreateStrengthCategoryDto } from '@/modules/strength-category/dto/create-strength-category.dto';
import { StrengthCategoryListQueryDto } from '@/modules/strength-category/dto/strength-category-list-query.dto';
import { UpdateStrengthCategoryDto } from '@/modules/strength-category/dto/update-strength-category.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class StrengthCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  getPublicList() {
    return this.prisma.strengthCategory.findMany({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
    });
  }

  async getAdminList(query: StrengthCategoryListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.StrengthCategoryWhereInput = {
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
      this.prisma.strengthCategory.findMany({ where, skip, take, orderBy }),
      this.prisma.strengthCategory.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.strengthCategory.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Strength category not found');
    return record;
  }

  create(dto: CreateStrengthCategoryDto) {
    return this.prisma.strengthCategory.create({ data: { ...dto, sortOrder: dto.sortOrder ?? 0 } });
  }

  async update(id: number, dto: UpdateStrengthCategoryDto) {
    await this.findOne(id);
    return this.prisma.strengthCategory.update({ where: { id }, data: dto });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.strengthCategory.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.strengthCategory.delete({ where: { id } });
  }
}
