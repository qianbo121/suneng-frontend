import { Injectable, NotFoundException } from '@nestjs/common';
import { CertificateCategory, Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { buildPagination } from '@/common/utils/pagination';
import { CreateCertificateDto } from '@/modules/certificate/dto/create-certificate.dto';
import { CertificateListQueryDto } from '@/modules/certificate/dto/certificate-list-query.dto';
import { PublicCertificateQueryDto } from '@/modules/certificate/dto/public-certificate-query.dto';
import { UpdateCertificateDto } from '@/modules/certificate/dto/update-certificate.dto';
import { PrismaService } from '@/prisma/prisma.service';

const categoryMap: Record<string, CertificateCategory> = {
  荣誉: CertificateCategory.honor,
  资质: CertificateCategory.qualification,
  专利: CertificateCategory.patent,
  honor: CertificateCategory.honor,
  qualification: CertificateCategory.qualification,
  patent: CertificateCategory.patent,
};

@Injectable()
export class CertificateService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicList(query: PublicCertificateQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const category = query.category ? categoryMap[query.category] : undefined;
    const where: Prisma.CertificateWhereInput = {
      status: PublishStatus.published,
      ...(category ? { category } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.certificate.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
      }),
      this.prisma.certificate.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getAdminList(query: CertificateListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.CertificateWhereInput = {
      status: query.status,
      ...(query.category ? { category: query.category } : {}),
      ...(query.keyword
        ? {
            OR: [
              { nameZh: { contains: query.keyword, mode: 'insensitive' } },
              { nameEn: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.certificate.findMany({ where, skip, take, orderBy }),
      this.prisma.certificate.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.certificate.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Certificate not found');
    return record;
  }

  create(dto: CreateCertificateDto) {
    return this.prisma.certificate.create({ data: { ...dto, sortOrder: dto.sortOrder ?? 0 } });
  }

  async update(id: number, dto: UpdateCertificateDto) {
    await this.findOne(id);
    return this.prisma.certificate.update({ where: { id }, data: dto });
  }

  async updateStatus(id: number, status: PublishStatus) {
    await this.findOne(id);
    return this.prisma.certificate.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.certificate.delete({ where: { id } });
  }
}
