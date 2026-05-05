import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { CreateSeoDto } from '@/modules/seo/dto/create-seo.dto';
import { SeoListQueryDto } from '@/modules/seo/dto/seo-list-query.dto';
import { UpdateSeoDto } from '@/modules/seo/dto/update-seo.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicByPageKey(pageKey: string) {
    const record = await this.prisma.seoMeta.findUnique({ where: { pageKey } });
    if (!record) throw new NotFoundException('SEO metadata not found');
    return record;
  }

  async getAdminList(query: SeoListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query, 'pageKey');
    const where: Prisma.SeoMetaWhereInput = query.keyword
      ? {
          OR: [
            { pageKey: { contains: query.keyword, mode: 'insensitive' } },
            { titleZh: { contains: query.keyword, mode: 'insensitive' } },
            { titleEn: { contains: query.keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.seoMeta.findMany({ where, skip, take, orderBy }),
      this.prisma.seoMeta.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.seoMeta.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('SEO metadata not found');
    return record;
  }

  create(dto: CreateSeoDto) {
    return this.prisma.seoMeta.create({ data: dto });
  }

  async update(id: number, dto: UpdateSeoDto) {
    await this.findOne(id);
    return this.prisma.seoMeta.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.seoMeta.delete({ where: { id } });
  }
}
