import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { BannerListQueryDto } from '@/modules/banner/dto/banner-list-query.dto';
import { CreateBannerDto } from '@/modules/banner/dto/create-banner.dto';
import { UpdateBannerDto } from '@/modules/banner/dto/update-banner.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicList() {
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        status: PublishStatus.published,
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
    });
  }

  async getAdminList(query: BannerListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.BannerWhereInput = {
      status: query.status,
      sectionKey: query.sectionKey,
      ...(query.keyword
        ? {
            OR: [
              { titleZh: { contains: query.keyword, mode: 'insensitive' } },
              { titleEn: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.banner.findMany({ where, skip, take, orderBy }),
      this.prisma.banner.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    return this.ensureExists(id);
  }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: number, dto: UpdateBannerDto) {
    await this.ensureExists(id);
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.ensureExists(id);
    return this.prisma.banner.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.banner.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const record = await this.prisma.banner.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Banner not found');
    return record;
  }
}
