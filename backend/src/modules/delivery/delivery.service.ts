import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { buildPagination } from '@/common/utils/pagination';
import { CreateDeliveryDto } from '@/modules/delivery/dto/create-delivery.dto';
import { DeliveryListQueryDto } from '@/modules/delivery/dto/delivery-list-query.dto';
import { UpdateDeliveryDto } from '@/modules/delivery/dto/update-delivery.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicList(query: DeliveryListQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.DeliveryWhereInput = { status: PublishStatus.published };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.delivery.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { deliveryDate: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.delivery.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getAdminList(query: DeliveryListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.DeliveryWhereInput = {
      status: query.status,
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
      this.prisma.delivery.findMany({ where, skip, take, orderBy }),
      this.prisma.delivery.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.delivery.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Delivery not found');
    return record;
  }

  create(dto: CreateDeliveryDto) {
    return this.prisma.delivery.create({
      data: {
        ...dto,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: number, dto: UpdateDeliveryDto) {
    await this.findOne(id);
    return this.prisma.delivery.update({
      where: { id },
      data: {
        ...dto,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
      },
    });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.delivery.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.delivery.delete({ where: { id } });
  }
}
