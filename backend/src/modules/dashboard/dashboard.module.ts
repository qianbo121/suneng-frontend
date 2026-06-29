import { Module } from '@nestjs/common';

import { CustomRequirementModule } from '@/modules/custom-requirement/custom-requirement.module';
import { DashboardController } from '@/modules/dashboard/dashboard.controller';
import { DashboardService } from '@/modules/dashboard/dashboard.service';

@Module({
  imports: [CustomRequirementModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
