import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CustomRequirementStatus, Prisma } from '@prisma/client';

import { buildPagination } from '@/common/utils/pagination';
import { CreateCustomRequirementDto } from '@/modules/custom-requirement/dto/create-custom-requirement.dto';
import { CustomRequirementListQueryDto } from '@/modules/custom-requirement/dto/custom-requirement-list-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

function normalizeEmpty(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

type CustomRequirementSpamState = {
  lastSubmittedAt: number;
  count: number;
  windowStartAt: number;
};

@Injectable()
export class CustomRequirementService {
  private readonly spamMap = new Map<string, CustomRequirementSpamState>();

  constructor(private readonly prisma: PrismaService) {}

  createPublic(dto: CreateCustomRequirementDto, clientKey: string) {
    this.ensureNotSpam(clientKey);

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

  private ensureNotSpam(clientKey: string) {
    const now = Date.now();
    const current = this.spamMap.get(clientKey);

    if (!current) {
      this.spamMap.set(clientKey, {
        lastSubmittedAt: now,
        count: 1,
        windowStartAt: now,
      });
      return;
    }

    if (now - current.lastSubmittedAt < 30_000) {
      throw new HttpException(
        'Please do not submit repeatedly in a short time',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (now - current.windowStartAt > 10 * 60_000) {
      current.count = 0;
      current.windowStartAt = now;
    }

    current.count += 1;
    current.lastSubmittedAt = now;

    if (current.count > 5) {
      throw new HttpException('Submission frequency is too high', HttpStatus.TOO_MANY_REQUESTS);
    }

    this.spamMap.set(clientKey, current);
  }
}
