import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { buildPagination } from '@/common/utils/pagination';
import { CreateStrengthItemDto } from '@/modules/strength-item/dto/create-strength-item.dto';
import { StrengthItemListQueryDto } from '@/modules/strength-item/dto/strength-item-list-query.dto';
import { UpdateStrengthItemDto } from '@/modules/strength-item/dto/update-strength-item.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class StrengthItemService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicList(query: StrengthItemListQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.StrengthItemWhereInput = {
      status: PublishStatus.published,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.strengthItem.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
      }),
      this.prisma.strengthItem.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getAdminList(query: StrengthItemListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.StrengthItemWhereInput = {
      status: query.status,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.keyword
        ? {
            OR: [
              { titleZh: { contains: query.keyword, mode: 'insensitive' } },
              { titleEn: { contains: query.keyword, mode: 'insensitive' } },
              { summaryZh: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.strengthItem.findMany({ where, skip, take, orderBy }),
      this.prisma.strengthItem.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.strengthItem.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Strength item not found');
    return record;
  }

  create(dto: CreateStrengthItemDto) {
    return this.prisma.strengthItem.create({ data: { ...dto, sortOrder: dto.sortOrder ?? 0 } });
  }

  async update(id: number, dto: UpdateStrengthItemDto) {
    await this.findOne(id);
    return this.prisma.strengthItem.update({ where: { id }, data: dto });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.strengthItem.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.strengthItem.delete({ where: { id } });
  }
}
