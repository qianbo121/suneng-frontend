import { Injectable } from '@nestjs/common';

import { CustomRequirementService } from '@/modules/custom-requirement/custom-requirement.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customRequirementService: CustomRequirementService,
  ) {}

  async getStats() {
    const [productCount, newsCount, pendingRequirementCount] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.news.count(),
      this.customRequirementService.getPendingCount(),
    ]);

    return {
      productCount,
      newsCount,
      pendingRequirementCount,
    };
  }
}
