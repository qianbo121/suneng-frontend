import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { CompanyInfoListQueryDto } from '@/modules/company-info/dto/company-info-list-query.dto';
import { CreateCompanyInfoDto } from '@/modules/company-info/dto/create-company-info.dto';
import { UpdateCompanyInfoDto } from '@/modules/company-info/dto/update-company-info.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CompanyInfoService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicAll() {
    const items = await this.prisma.companyInfo.findMany({ orderBy: { key: 'asc' } });
    return items.reduce<Record<string, { zh: string | null; en: string | null }>>((acc, item) => {
      acc[item.key] = { zh: item.valueZh ?? null, en: item.valueEn ?? null };
      return acc;
    }, {});
  }

  async getAdminList(query: CompanyInfoListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query, 'key');
    const where: Prisma.CompanyInfoWhereInput = query.keyword
      ? {
          OR: [
            { key: { contains: query.keyword, mode: 'insensitive' } },
            { valueZh: { contains: query.keyword, mode: 'insensitive' } },
            { valueEn: { contains: query.keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.companyInfo.findMany({ where, skip, take, orderBy }),
      this.prisma.companyInfo.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.companyInfo.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Company info not found');
    return record;
  }

  create(dto: CreateCompanyInfoDto) {
    return this.prisma.companyInfo.create({ data: dto });
  }

  async update(id: number, dto: UpdateCompanyInfoDto) {
    await this.findOne(id);
    return this.prisma.companyInfo.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.companyInfo.delete({ where: { id } });
  }
}
