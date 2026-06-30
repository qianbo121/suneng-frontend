import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { buildPagination } from '@/common/utils/pagination';
import { ContactMessageListQueryDto } from '@/modules/contact-message/dto/contact-message-list-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ContactMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminList(query: ContactMessageListQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.ContactMessageWhereInput = {
      status: query.status,
      ...(query.keyword
        ? {
            OR: [
              { name: { contains: query.keyword, mode: 'insensitive' } },
              { phone: { contains: query.keyword, mode: 'insensitive' } },
              { email: { contains: query.keyword, mode: 'insensitive' } },
              { company: { contains: query.keyword, mode: 'insensitive' } },
              { message: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: 'desc' }],
      }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }
}
