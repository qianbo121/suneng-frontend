import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactMessageStatus, Prisma } from '@prisma/client';

import { buildPagination } from '@/common/utils/pagination';
import { ensureNotSpam, SpamThrottleState } from '@/common/utils/spam-throttle';
import { ContactMessageListQueryDto } from '@/modules/contact-message/dto/contact-message-list-query.dto';
import { CreateContactMessageDto } from '@/modules/contact-message/dto/create-contact-message.dto';
import { UpdateContactMessageStatusDto } from '@/modules/contact-message/dto/update-contact-message-status.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ContactMessageService {
  private readonly spamMap = new Map<string, SpamThrottleState>();

  constructor(private readonly prisma: PrismaService) {}

  async createPublic(dto: CreateContactMessageDto, clientKey: string) {
    ensureNotSpam(clientKey, this.spamMap);

    return this.prisma.contactMessage.create({
      data: {
        ...dto,
        status: ContactMessageStatus.new,
      },
    });
  }

  async getAdminList(query: ContactMessageListQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.ContactMessageWhereInput = {
      status: query.status,
      ...(typeof query.isRead === 'string' ? { isRead: query.isRead === 'true' } : {}),
      ...(query.keyword
        ? {
            OR: [
              { name: { contains: query.keyword, mode: 'insensitive' } },
              { company: { contains: query.keyword, mode: 'insensitive' } },
              { email: { contains: query.keyword, mode: 'insensitive' } },
              { phone: { contains: query.keyword, mode: 'insensitive' } },
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
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        include: {
          handler: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.contactMessage.findUnique({
      where: { id },
      include: {
        handler: {
          select: { id: true, username: true, role: true },
        },
      },
    });
    if (!record) throw new NotFoundException('Contact message not found');
    return record;
  }

  async markRead(id: number) {
    await this.findOne(id);
    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async updateStatus(id: number, dto: UpdateContactMessageStatusDto) {
    await this.findOne(id);
    return this.prisma.contactMessage.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.contactMessage.delete({ where: { id } });
  }

  async getUnreadCount() {
    return this.prisma.contactMessage.count({ where: { isRead: false } });
  }
}
