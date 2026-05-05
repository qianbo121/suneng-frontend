import { Injectable } from '@nestjs/common';

import { ContactMessageService } from '@/modules/contact-message/contact-message.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contactMessageService: ContactMessageService,
  ) {}

  async getStats() {
    const [productCount, newsCount, unreadContactCount] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.news.count(),
      this.contactMessageService.getUnreadCount(),
    ]);

    return {
      productCount,
      newsCount,
      unreadContactCount,
      todayVisitCount: 0,
    };
  }
}
