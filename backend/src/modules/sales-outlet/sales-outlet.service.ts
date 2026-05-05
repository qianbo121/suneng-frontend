import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { CreateSalesOutletDto } from '@/modules/sales-outlet/dto/create-sales-outlet.dto';
import { SalesOutletListQueryDto } from '@/modules/sales-outlet/dto/sales-outlet-list-query.dto';
import { UpdateSalesOutletDto } from '@/modules/sales-outlet/dto/update-sales-outlet.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SalesOutletService {
  constructor(private readonly prisma: PrismaService) {}

  getPublicList() {
    return this.prisma.salesOutlet.findMany({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async getAdminList(query: SalesOutletListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.SalesOutletWhereInput = {
      status: query.status,
      ...(query.keyword
        ? {
            OR: [
              { regionZh: { contains: query.keyword, mode: 'insensitive' } },
              { cityZh: { contains: query.keyword, mode: 'insensitive' } },
              { addressZh: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.salesOutlet.findMany({ where, skip, take, orderBy }),
      this.prisma.salesOutlet.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.salesOutlet.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Sales outlet not found');
    return record;
  }

  create(dto: CreateSalesOutletDto) {
    return this.prisma.salesOutlet.create({ data: { ...dto, sortOrder: dto.sortOrder ?? 0 } });
  }

  async update(id: number, dto: UpdateSalesOutletDto) {
    await this.findOne(id);
    return this.prisma.salesOutlet.update({ where: { id }, data: dto });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.salesOutlet.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.salesOutlet.delete({ where: { id } });
  }
}
