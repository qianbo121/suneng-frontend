import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { CreatePartnerDto } from '@/modules/partner/dto/create-partner.dto';
import { PartnerListQueryDto } from '@/modules/partner/dto/partner-list-query.dto';
import { UpdatePartnerDto } from '@/modules/partner/dto/update-partner.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  getPublicList() {
    return this.prisma.partner.findMany({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
    });
  }

  async getAdminList(query: PartnerListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.PartnerWhereInput = {
      status: query.status,
      ...(query.keyword ? { name: { contains: query.keyword, mode: 'insensitive' } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.partner.findMany({ where, skip, take, orderBy }),
      this.prisma.partner.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.partner.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Partner not found');
    return record;
  }

  create(dto: CreatePartnerDto) {
    return this.prisma.partner.create({
      data: { ...dto, sortOrder: dto.sortOrder ?? 0 },
    });
  }

  async update(id: number, dto: UpdatePartnerDto) {
    await this.findOne(id);
    return this.prisma.partner.update({ where: { id }, data: dto });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.partner.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.partner.delete({ where: { id } });
  }
}
