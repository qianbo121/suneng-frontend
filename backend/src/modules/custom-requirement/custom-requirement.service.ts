import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomRequirementStatus, Prisma } from '@prisma/client';

import { buildPagination } from '@/common/utils/pagination';
import { CreateCustomRequirementDto } from '@/modules/custom-requirement/dto/create-custom-requirement.dto';
import { CustomRequirementListQueryDto } from '@/modules/custom-requirement/dto/custom-requirement-list-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

function normalizeEmpty(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

@Injectable()
export class CustomRequirementService {
  constructor(private readonly prisma: PrismaService) {}

  createPublic(dto: CreateCustomRequirementDto) {
    return this.prisma.customRequirement.create({
      data: {
        name: normalizeEmpty(dto.name),
        phone: dto.phone.trim(),
        company: normalizeEmpty(dto.company),
        industry: normalizeEmpty(dto.industry),
        process: normalizeEmpty(dto.process),
        temperature: normalizeEmpty(dto.temperature),
        requirement: normalizeEmpty(dto.requirement),
        status: CustomRequirementStatus.pending,
      },
    });
  }

  async getAdminList(query: CustomRequirementListQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.CustomRequirementWhereInput = {
      status: query.status,
      ...(query.keyword
        ? {
            OR: [
              { name: { contains: query.keyword, mode: 'insensitive' } },
              { phone: { contains: query.keyword, mode: 'insensitive' } },
              { company: { contains: query.keyword, mode: 'insensitive' } },
              { industry: { contains: query.keyword, mode: 'insensitive' } },
              { process: { contains: query.keyword, mode: 'insensitive' } },
              { temperature: { contains: query.keyword, mode: 'insensitive' } },
              { requirement: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.customRequirement.findMany({
        where,
        skip,
        take,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.customRequirement.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.customRequirement.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Custom requirement not found');
    return record;
  }

  async markFollowed(id: number) {
    await this.findOne(id);
    return this.prisma.customRequirement.update({
      where: { id },
      data: { status: CustomRequirementStatus.followed },
    });
  }
}
