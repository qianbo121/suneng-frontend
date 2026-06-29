import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { buildAdminListQuery } from '@/common/utils/admin-query';
import { CreateAboutSectionDto } from '@/modules/about/dto/create-about-section.dto';
import { CreateChairmanMessageDto } from '@/modules/about/dto/create-chairman-message.dto';
import { CreateCultureValueDto } from '@/modules/about/dto/create-culture-value.dto';
import { CreateTimelineEventDto } from '@/modules/about/dto/create-timeline-event.dto';
import { AboutSectionListQueryDto } from '@/modules/about/dto/about-section-list-query.dto';
import { ChairmanMessageListQueryDto } from '@/modules/about/dto/chairman-message-list-query.dto';
import { CultureValueListQueryDto } from '@/modules/about/dto/culture-value-list-query.dto';
import { TimelineListQueryDto } from '@/modules/about/dto/timeline-list-query.dto';
import { UpdateAboutSectionDto } from '@/modules/about/dto/update-about-section.dto';
import { UpdateChairmanMessageDto } from '@/modules/about/dto/update-chairman-message.dto';
import { UpdateCultureValueDto } from '@/modules/about/dto/update-culture-value.dto';
import { UpdateTimelineEventDto } from '@/modules/about/dto/update-timeline-event.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AboutService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicAbout() {
    const [sections, timeline, chairman, culture] = await Promise.all([
      this.prisma.aboutSection.findMany({
        where: { status: PublishStatus.published },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.timelineEvent.findMany({
        where: { status: PublishStatus.published },
        orderBy: [{ year: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.chairmanMessage.findFirst({
        where: { status: PublishStatus.published },
        orderBy: { id: 'asc' },
      }),
      this.prisma.cultureValue.findMany({
        where: { status: PublishStatus.published },
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
      }),
    ]);

    return { sections, timeline, chairman, culture };
  }

  async getSectionList(query: AboutSectionListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.AboutSectionWhereInput = {
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
      this.prisma.aboutSection.findMany({ where, skip, take, orderBy }),
      this.prisma.aboutSection.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getTimelineList(query: TimelineListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query, 'year');
    const where: Prisma.TimelineEventWhereInput = {
      status: query.status,
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
      this.prisma.timelineEvent.findMany({ where, skip, take, orderBy }),
      this.prisma.timelineEvent.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getCultureList(query: CultureValueListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query);
    const where: Prisma.CultureValueWhereInput = {
      status: query.status,
      ...(query.type ? { type: query.type } : {}),
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
      this.prisma.cultureValue.findMany({ where, skip, take, orderBy }),
      this.prisma.cultureValue.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getChairmanList(query: ChairmanMessageListQueryDto) {
    const { page, pageSize, skip, take, orderBy } = buildAdminListQuery(query, 'createdAt');
    const where: Prisma.ChairmanMessageWhereInput = {
      status: query.status,
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
      this.prisma.chairmanMessage.findMany({ where, skip, take, orderBy }),
      this.prisma.chairmanMessage.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findSection(id: number) {
    const record = await this.prisma.aboutSection.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('About section not found');
    return record;
  }

  async findTimeline(id: number) {
    const record = await this.prisma.timelineEvent.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Timeline event not found');
    return record;
  }

  async findCulture(id: number) {
    const record = await this.prisma.cultureValue.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Culture value not found');
    return record;
  }

  async findChairman(id: number) {
    const record = await this.prisma.chairmanMessage.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Chairman message not found');
    return record;
  }

  createSection(dto: CreateAboutSectionDto) {
    return this.prisma.aboutSection.create({ data: { ...dto, sortOrder: dto.sortOrder ?? 0 } });
  }

  createTimeline(dto: CreateTimelineEventDto) {
    return this.prisma.timelineEvent.create({ data: { ...dto, sortOrder: dto.sortOrder ?? 0 } });
  }

  createCulture(dto: CreateCultureValueDto) {
    return this.prisma.cultureValue.create({ data: { ...dto, sortOrder: dto.sortOrder ?? 0 } });
  }

  createChairman(dto: CreateChairmanMessageDto) {
    return this.prisma.chairmanMessage.create({ data: dto });
  }

  async updateSection(id: number, dto: UpdateAboutSectionDto) {
    await this.findSection(id);
    return this.prisma.aboutSection.update({ where: { id }, data: dto });
  }

  async updateTimeline(id: number, dto: UpdateTimelineEventDto) {
    await this.findTimeline(id);
    return this.prisma.timelineEvent.update({ where: { id }, data: dto });
  }

  async updateCulture(id: number, dto: UpdateCultureValueDto) {
    await this.findCulture(id);
    return this.prisma.cultureValue.update({ where: { id }, data: dto });
  }

  async updateChairman(id: number, dto: UpdateChairmanMessageDto) {
    await this.findChairman(id);
    return this.prisma.chairmanMessage.update({ where: { id }, data: dto });
  }

  async updateSectionStatus(id: number, status: PublishStatus) {
    await this.findSection(id);
    return this.prisma.aboutSection.update({ where: { id }, data: { status } });
  }

  async updateTimelineStatus(id: number, status: PublishStatus) {
    await this.findTimeline(id);
    return this.prisma.timelineEvent.update({ where: { id }, data: { status } });
  }

  async updateCultureStatus(id: number, status: PublishStatus) {
    await this.findCulture(id);
    return this.prisma.cultureValue.update({ where: { id }, data: { status } });
  }

  async updateChairmanStatus(id: number, status: PublishStatus) {
    await this.findChairman(id);
    return this.prisma.chairmanMessage.update({ where: { id }, data: { status } });
  }

  async removeSection(id: number) {
    await this.findSection(id);
    return this.prisma.aboutSection.delete({ where: { id } });
  }

  async removeTimeline(id: number) {
    await this.findTimeline(id);
    return this.prisma.timelineEvent.delete({ where: { id } });
  }

  async removeCulture(id: number) {
    await this.findCulture(id);
    return this.prisma.cultureValue.delete({ where: { id } });
  }

  async removeChairman(id: number) {
    await this.findChairman(id);
    return this.prisma.chairmanMessage.delete({ where: { id } });
  }
}
