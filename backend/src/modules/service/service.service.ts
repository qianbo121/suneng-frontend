import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { CreateServiceDto } from '@/modules/service/dto/create-service.dto';
import { ServiceListQueryDto } from '@/modules/service/dto/service-list-query.dto';
import { UpdateServiceDto } from '@/modules/service/dto/update-service.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  getPublicList() {
    return this.prisma.serviceSection.findMany({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async getAdminList(query: ServiceListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.ServiceSectionWhereInput = {
      status: query.status,
      ...(query.keyword
        ? {
            OR: [
              { sectionKey: { contains: query.keyword, mode: 'insensitive' } },
              { titleZh: { contains: query.keyword, mode: 'insensitive' } },
              { titleEn: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceSection.findMany({ where, skip, take, orderBy }),
      this.prisma.serviceSection.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.serviceSection.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Service section not found');
    return record;
  }

  create(dto: CreateServiceDto) {
    return this.prisma.serviceSection.create({ data: { ...dto, sortOrder: dto.sortOrder ?? 0 } });
  }

  async update(id: number, dto: UpdateServiceDto) {
    await this.findOne(id);
    return this.prisma.serviceSection.update({ where: { id }, data: dto });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.serviceSection.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.serviceSection.delete({ where: { id } });
  }
}
